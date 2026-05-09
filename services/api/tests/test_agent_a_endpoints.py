from __future__ import annotations

import os
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

os.environ["DATABASE_URL"] = "postgresql+asyncpg://engine_room:engine_room@localhost:5432/engine_room"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

import httpx
import pytest
from app.api import admin as admin_router
from app.api import search as search_router
from app.api.deps import get_redis_cache, get_redis_ratelimit, get_session
from app.core.settings import get_settings
from app.db.models import SiteSetting
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


class FakeAdminSession(FakeSession):
    def __init__(self) -> None:
        self.settings: dict[str, SiteSetting] = {}
        self.scalar_result = 0

    async def get(self, model: type[Any], key: str) -> Any:
        if model is SiteSetting:
            return self.settings.get(key)
        return None

    def add(self, obj: Any) -> None:
        if isinstance(obj, SiteSetting):
            self.settings[obj.key] = obj
            return
        super().add(obj)

    async def scalar(self, statement: Any) -> int:
        return self.scalar_result


async def _fake_session():
    yield FakeSession()


def _fake_admin_session(session: FakeAdminSession):
    async def override():
        yield session

    return override


def _set_admin_token(monkeypatch: pytest.MonkeyPatch) -> dict[str, str]:
    monkeypatch.setenv("ADMIN_TOKEN", "test-admin-token")
    get_settings.cache_clear()
    return {"Authorization": "Bearer test-admin-token"}


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


@pytest.mark.asyncio
async def test_admin_requires_bearer_token(monkeypatch: pytest.MonkeyPatch) -> None:
    _set_admin_token(monkeypatch)
    app = create_app()
    app.dependency_overrides[get_session] = _fake_admin_session(FakeAdminSession())

    async with await _client(app) as client:
        response = await client.get("/admin/hero")

    assert response.status_code == 401
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_admin_hero_round_trip_with_fake_database(monkeypatch: pytest.MonkeyPatch) -> None:
    headers = _set_admin_token(monkeypatch)
    fake_db = FakeAdminSession()
    app = create_app()
    app.dependency_overrides[get_session] = _fake_admin_session(fake_db)

    payload = {
        "variants": [
            {
                "id": "variant-a",
                "label": "Backend Proof",
                "copy": "I build AI backend systems with traces, recovery paths, and operator controls.",
                "allocation": 50,
            },
            {
                "id": "variant-b",
                "label": "Hiring Signal",
                "copy": "Hire Sahil for RAG, FastAPI, LLM gateways, and production observability.",
                "allocation": 50,
            },
        ]
    }

    async with await _client(app) as client:
        save_response = await client.patch("/admin/hero", headers=headers, json=payload)
        get_response = await client.get("/admin/hero", headers=headers)

    assert save_response.status_code == 200
    assert get_response.status_code == 200
    assert get_response.json()[0]["label"] == "Backend Proof"
    assert fake_db.settings["hero_experiment"].value["variants"][1]["allocation"] == 50
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_admin_hero_rejects_bad_allocation_edge_case(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    headers = _set_admin_token(monkeypatch)
    app = create_app()
    app.dependency_overrides[get_session] = _fake_admin_session(FakeAdminSession())

    payload = {
        "variants": [
            {"id": "a", "label": "A", "copy": "This copy is long enough.", "allocation": 90},
            {"id": "b", "label": "B", "copy": "This copy is also long enough.", "allocation": 90},
        ]
    }
    async with await _client(app) as client:
        response = await client.patch("/admin/hero", headers=headers, json=payload)

    assert response.status_code == 422
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_admin_substack_settings_with_fake_database(monkeypatch: pytest.MonkeyPatch) -> None:
    headers = _set_admin_token(monkeypatch)
    fake_db = FakeAdminSession()
    app = create_app()
    app.dependency_overrides[get_session] = _fake_admin_session(fake_db)

    async with await _client(app) as client:
        response = await client.patch(
            "/admin/substack/settings",
            headers=headers,
            json={"embedding_model": "text-embedding-3-small", "chunk_size": 768},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["embeddingModel"] == "text-embedding-3-small"
    assert body["chunkSize"] == 768
    assert fake_db.settings["substack_state"].value["chunkSize"] == 768
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_admin_substack_rejects_invalid_chunk_edge_case(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    headers = _set_admin_token(monkeypatch)
    app = create_app()
    app.dependency_overrides[get_session] = _fake_admin_session(FakeAdminSession())

    async with await _client(app) as client:
        response = await client.patch(
            "/admin/substack/settings",
            headers=headers,
            json={"embedding_model": "text-embedding-3-small", "chunk_size": 999},
        )

    assert response.status_code == 422
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_admin_worker_trigger_records_sync_log(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    headers = _set_admin_token(monkeypatch)
    fake_db = FakeAdminSession()
    app = create_app()
    app.dependency_overrides[get_session] = _fake_admin_session(fake_db)

    async def fake_ingest(session: Any) -> dict[str, int]:
        return {"posts": 0, "chunks": 0}

    monkeypatch.setattr(admin_router, "ingest_substack_feed", fake_ingest)

    async with await _client(app) as client:
        response = await client.post("/admin/worker/trigger/ingest_substack", headers=headers)

    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert fake_db.settings["substack_state"].value["recentLog"][0]["level"] == "info"
    get_settings.cache_clear()
