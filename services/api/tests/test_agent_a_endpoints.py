from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

import httpx
import pytest
from app.api import search as search_router
from app.api.deps import get_redis_cache, get_redis_ratelimit, get_session
from app.main import create_app
from app.schemas.search import Citation, SearchResponse


class FakeRedis:
    def __init__(self, initial_count: int = 0) -> None:
        self.count = initial_count
        self.items: dict[str, Any] = {}

    async def incr(self, key: str) -> int:
        self.count += 1
        return self.count

    async def expire(self, key: str, seconds: int) -> bool:
        self.items[f"{key}:ttl"] = seconds
        return True

    async def ttl(self, key: str) -> int:
        return int(self.items.get(f"{key}:ttl", 300))

    async def ping(self) -> bool:
        return True

    def pipeline(self) -> FakeRedis:
        return self

    def zadd(self, key: str, mapping: dict[str, float]) -> FakeRedis:
        self.items.setdefault(key, {}).update(mapping)
        return self

    def zremrangebyscore(self, key: str, minimum: float, maximum: float) -> FakeRedis:
        return self

    async def execute(self) -> list[Any]:
        return []

    async def zcount(self, key: str, minimum: float, maximum: float) -> int:
        return len(self.items.get(key, {}))

    async def zscan_iter(self, key: str):
        for item in self.items.get(key, {}):
            yield (item, 0)

    async def lrange(self, key: str, start: int, end: int) -> list[str]:
        return []

    async def aclose(self) -> None:
        return None


class FakeSession:
    def add(self, obj: Any) -> None:
        if getattr(obj, "id", None) is None:
            obj.id = uuid4()
        now = datetime.now(UTC)
        obj.created_at = getattr(obj, "created_at", None) or now
        obj.updated_at = getattr(obj, "updated_at", None) or now
        obj.status = getattr(obj, "status", None) or "new"

    async def commit(self) -> None:
        return None

    async def refresh(self, obj: Any) -> None:
        return None


async def _fake_session():
    yield FakeSession()


async def _client(app):
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://testserver")


@pytest.mark.asyncio
async def test_search_happy_path(monkeypatch: pytest.MonkeyPatch) -> None:
    app = create_app()
    app.dependency_overrides[get_session] = _fake_session
    app.dependency_overrides[get_redis_cache] = lambda: FakeRedis()

    async def fake_run_search(query: str, session: Any) -> SearchResponse:
        return SearchResponse(
            answer=f"Answer for {query} [project:llm-gateway:0]",
            citations=[
                Citation(
                    doc_id="project:llm-gateway:0",
                    title="LLM Gateway",
                    slug="llm-gateway",
                    excerpt="Gateway excerpt",
                )
            ],
        )

    monkeypatch.setattr(search_router, "run_search", fake_run_search)
    async with await _client(app) as client:
        response = await client.post("/api/search", json={"query": "How does the gateway work?"})

    assert response.status_code == 200
    body = response.json()
    assert body["citations"][0]["doc_id"] == "project:llm-gateway:0"
    assert "[project:llm-gateway:0]" in body["answer"]


@pytest.mark.asyncio
async def test_search_rejects_blank_query() -> None:
    app = create_app()
    async with await _client(app) as client:
        response = await client.post("/api/search", json={"query": "   "})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_inquiries_happy_path_scores_inline() -> None:
    app = create_app()
    app.dependency_overrides[get_session] = _fake_session
    app.dependency_overrides[get_redis_ratelimit] = lambda: FakeRedis()

    payload = {
        "name": "Avery Tan",
        "email": "avery@example.com",
        "company": "Atlas Robotics",
        "intent": "hire",
        "message": "We are hiring for an AI backend role and want to discuss your RAG work.",
    }
    async with await _client(app) as client:
        response = await client.post("/api/inquiries", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["priority_score"] >= 80
    assert body["classified_type"] == "recruiter"


@pytest.mark.asyncio
async def test_inquiries_rate_limit_edge_case() -> None:
    app = create_app()
    app.dependency_overrides[get_session] = _fake_session
    app.dependency_overrides[get_redis_ratelimit] = lambda: FakeRedis(initial_count=5)

    payload = {
        "name": "Spam Bot",
        "email": "spam@example.com",
        "message": "Please buy guest post backlinks from this promotional SEO campaign.",
    }
    async with await _client(app) as client:
        response = await client.post("/api/inquiries", json=payload)

    assert response.status_code == 429
