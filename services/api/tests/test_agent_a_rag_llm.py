from __future__ import annotations

from collections.abc import AsyncIterator
from types import SimpleNamespace
from typing import Any
from uuid import uuid4

import pytest
from app.llm import gateway
from app.llm.gateway import _cost_usd
from app.rag import embedder, indexer, pipeline, retriever
from app.rag.chunker import chunk_text
from app.rag.generator import generate_stream
from app.rag.retriever import RetrievedChunk, _mmr_rerank


def test_chunker_respects_markdown_headings() -> None:
    chunks = chunk_text("# Intro\nshort text\n\n## Details\n" + "word " * 700)

    assert chunks[0].startswith("# Intro")
    assert all(not chunk.startswith("short text") for chunk in chunks[1:])
    assert all(len(chunk.split()) <= 520 for chunk in chunks)


def test_mmr_rerank_balances_relevance_and_diversity() -> None:
    query = [1.0, 0.0]
    chunks = [
        RetrievedChunk("a", "project", "A", "a", "a", "a", 0.99, [1.0, 0.0]),
        RetrievedChunk("b", "project", "B", "b", "b", "b", 0.98, [0.99, 0.01]),
        RetrievedChunk("c", "post", "C", "c", "c", "c", 0.70, [0.0, 1.0]),
    ]

    selected = _mmr_rerank(query, chunks, k=2, lam=0.5)

    assert selected[0].doc_id == "a"
    assert len(selected) == 2
    assert {chunk.doc_id for chunk in selected}.issubset({"a", "b", "c"})


def test_gateway_cost_table_for_embedding_model() -> None:
    assert _cost_usd("text-embedding-3-small", 1_000_000, 0) == pytest.approx(0.02)


@pytest.mark.asyncio
async def test_gateway_logs_cost_to_redis(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[tuple[str, Any]] = []

    class FakeRedis:
        async def __aenter__(self) -> FakeRedis:
            return self

        async def __aexit__(self, *args: Any) -> None:
            return None

        def pipeline(self) -> FakeRedis:
            return self

        def hset(self, key: str, mapping: dict[str, Any]) -> FakeRedis:
            calls.append(("hset", key, mapping))
            return self

        def expire(self, key: str, ttl: int) -> FakeRedis:
            calls.append(("expire", key, ttl))
            return self

        def lpush(self, key: str, value: str) -> FakeRedis:
            calls.append(("lpush", key, value))
            return self

        def ltrim(self, key: str, start: int, end: int) -> FakeRedis:
            calls.append(("ltrim", key, start, end))
            return self

        async def execute(self) -> list[Any]:
            return []

    monkeypatch.setattr(gateway, "_get_redis", lambda: FakeRedis())

    await gateway._log_cost(
        model="text-embedding-3-small",
        tokens_in=100,
        tokens_out=0,
        cost_usd=0.000002,
        duration_ms=12.5,
        endpoint="test",
    )

    assert any(call[0] == "hset" for call in calls)
    assert any(call[0] == "lpush" for call in calls)


@pytest.mark.asyncio
async def test_gateway_retry_success(monkeypatch: pytest.MonkeyPatch) -> None:
    attempts = 0

    async def flaky() -> str:
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise RuntimeError("retry me")
        return "ok"

    async def no_sleep(seconds: float) -> None:
        return None

    monkeypatch.setattr(gateway, "_is_retryable", lambda exc: True)
    monkeypatch.setattr(gateway.asyncio, "sleep", no_sleep)

    assert await gateway._with_retry(flaky, max_attempts=2) == "ok"
    assert attempts == 2


@pytest.mark.asyncio
async def test_gateway_embed_and_complete(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeSettings:
        openai_api_key = "test-openai"
        anthropic_api_key = "test-anthropic"
        redis_url = "redis://localhost:6379/0"
        embedding_model = "text-embedding-3-small"

    class FakeEmbeddings:
        async def create(self, *, model: str, input: list[str], dimensions: int):
            assert dimensions == 1536
            return SimpleNamespace(
                data=[SimpleNamespace(embedding=[float(index), 0.0]) for index, _ in enumerate(input)]
            )

    class FakeOpenAI:
        def __init__(self, **kwargs: Any) -> None:
            self.embeddings = FakeEmbeddings()

    class FakeMessages:
        async def create(self, **kwargs: Any) -> Any:
            return SimpleNamespace(
                usage=SimpleNamespace(input_tokens=10, output_tokens=5),
                content=[SimpleNamespace(text="classified")],
            )

    class FakeAnthropic:
        def __init__(self, **kwargs: Any) -> None:
            self.messages = FakeMessages()

    async def fake_log_cost(**kwargs: Any) -> None:
        return None

    monkeypatch.setattr(gateway, "get_settings", lambda: FakeSettings())
    monkeypatch.setattr(gateway.openai, "AsyncOpenAI", FakeOpenAI)
    monkeypatch.setattr(gateway.anthropic, "AsyncAnthropic", FakeAnthropic)
    monkeypatch.setattr(gateway, "_log_cost", fake_log_cost)

    vectors = await gateway.embed(["one", "two"], endpoint="test.embed")
    text = await gateway.complete(system="s", messages=[{"role": "user", "content": "hi"}])
    await gateway.asyncio.sleep(0)

    assert vectors == [[0.0, 0.0], [1.0, 0.0]]
    assert text == "classified"


@pytest.mark.asyncio
async def test_embedder_batches_through_gateway(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_gateway_embed(texts: list[str], endpoint: str) -> list[list[float]]:
        return [[1.0, 0.0] for _ in texts]

    monkeypatch.setattr(embedder, "_gateway_embed", fake_gateway_embed)

    assert await embedder.embed(["a", "b"], endpoint="unit") == [[1.0, 0.0], [1.0, 0.0]]


@pytest.mark.asyncio
async def test_generator_without_context_is_honest() -> None:
    tokens = [token async for token in generate_stream("What did Sahil build?", [])]

    assert "don't have enough information" in "".join(tokens)


@pytest.mark.asyncio
async def test_pipeline_run_search_composes_answer(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_embed(texts: list[str], endpoint: str = "rag.embed") -> list[list[float]]:
        return [[1.0, 0.0]]

    async def fake_retrieve(query_vec: list[float], session: Any, k: int = 6) -> list[RetrievedChunk]:
        return [
            RetrievedChunk(
                doc_id="post:agent-systems:0",
                source_type="post",
                title="Agent Systems",
                slug="agent-systems",
                excerpt="Agent system excerpt",
                body_md="Agent system body",
                score=0.91,
                embedding=[1.0, 0.0],
            )
        ]

    async def fake_generate(query: str, chunks: list[RetrievedChunk]) -> AsyncIterator[str]:
        yield "Use agent systems [post:agent-systems:0]."

    monkeypatch.setattr(pipeline, "embed", fake_embed)
    monkeypatch.setattr(pipeline, "retrieve", fake_retrieve)
    monkeypatch.setattr(pipeline, "generate_stream", fake_generate)

    response = await pipeline.run_search("agent systems?", session=object(), use_cache=False)

    assert response.answer.startswith("Use agent systems")
    assert response.citations[0].doc_id == "post:agent-systems:0"


@pytest.mark.asyncio
async def test_retriever_executes_vector_query_and_reranks() -> None:
    class FakeResult:
        def mappings(self) -> list[dict[str, Any]]:
            return [
                {
                    "doc_id": "project:a:0",
                    "source_type": "project",
                    "title": "A",
                    "slug": "a",
                    "excerpt": "A excerpt",
                    "body_md": "A body",
                    "score": 0.99,
                    "embedding_text": "[1,0]",
                },
                {
                    "doc_id": "post:b:0",
                    "source_type": "post",
                    "title": "B",
                    "slug": "b",
                    "excerpt": "B excerpt",
                    "body_md": "B body",
                    "score": 0.75,
                    "embedding_text": "[0,1]",
                },
            ]

    class FakeSession:
        async def execute(self, sql: Any, params: dict[str, Any]) -> FakeResult:
            assert params["pool_size"] == 6
            return FakeResult()

    chunks = await retriever.retrieve([1.0, 0.0], session=FakeSession(), k=2)

    assert [chunk.doc_id for chunk in chunks] == ["project:a:0", "post:b:0"]


@pytest.mark.asyncio
async def test_index_document_upserts_chunks(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[Any] = []

    class FakeSession:
        async def execute(self, statement: Any, params: dict[str, Any] | None = None) -> None:
            calls.append((statement, params))

    async def fake_embed(texts: list[str], endpoint: str) -> list[list[float]]:
        return [[1.0, 0.0] for _ in texts]

    monkeypatch.setattr(indexer, "chunk_text", lambda markdown: ["chunk one", "chunk two"])
    monkeypatch.setattr(indexer, "embed", fake_embed)

    vectors = await indexer.index_document(
        session=FakeSession(),
        source_type="post",
        source_id=uuid4(),
        title="Post",
        slug="post",
        markdown="body",
        summary="summary",
    )

    assert vectors == [[1.0, 0.0], [1.0, 0.0]]
    assert len(calls) == 3


@pytest.mark.asyncio
async def test_refresh_dirty_embeddings_updates_project_and_post(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    project = SimpleNamespace(
        id=uuid4(),
        title="Project",
        slug="project",
        summary="Project summary",
        body_md="Project body",
        embedding=None,
        embedding_indexed_at=None,
    )
    post = SimpleNamespace(
        id=uuid4(),
        title="Post",
        slug="post",
        summary="Post summary",
        body_md="Post body",
        embedding=None,
        embedding_indexed_at=None,
    )

    class FakeSession:
        def __init__(self) -> None:
            self.calls = 0

        async def scalars(self, statement: Any):
            self.calls += 1
            return [project] if self.calls == 1 else [post]

        async def commit(self) -> None:
            return None

    async def fake_index_document(**kwargs: Any) -> list[list[float]]:
        return [[1.0, 0.0], [0.0, 1.0]]

    monkeypatch.setattr(indexer, "index_document", fake_index_document)

    result = await indexer.refresh_dirty_embeddings(FakeSession())

    assert result == {"projects": 1, "posts": 1, "chunks": 4}
    assert project.embedding == [0.5, 0.5]
    assert post.embedding == [0.5, 0.5]
