"""Shared worker utilities.

The API and worker are separate editable packages that both use the top-level
package name `app`, so worker jobs intentionally use direct SQLAlchemy Core
instead of importing API modules at runtime.
"""

from __future__ import annotations

import hashlib
import math
import os
import re
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import openai
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

EMBEDDING_DIM = 1536
CHUNK_SIZE = 512
OVERLAP = 64

_HEADING_RE = re.compile(r"^(#{1,6})\s", re.MULTILINE)
_ENGINE = None
_SESSIONMAKER = None


def database_url() -> str:
    return os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://engine_room:engine_room@localhost:5432/engine_room",
    )


def substack_feed_url() -> str:
    return os.getenv("SUBSTACK_FEED_URL", "")


def embedding_model() -> str:
    return os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")


def openai_api_key() -> str | None:
    return os.getenv("OPENAI_API_KEY") or None


def _local_embedding(text: str) -> list[float]:
    values = [0.0] * EMBEDDING_DIM
    tokens = [token for token in text.lower().replace("-", " ").split() if token]
    for token in tokens:
        digest = hashlib.sha256(token.encode()).digest()
        index = int.from_bytes(digest[:2], "big") % EMBEDDING_DIM
        sign = 1.0 if digest[2] % 2 == 0 else -1.0
        values[index] += sign
    norm = math.sqrt(sum(value * value for value in values))
    if norm == 0:
        return values
    return [value / norm for value in values]


def _engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = create_async_engine(database_url(), pool_pre_ping=True)
    return _ENGINE


def _sessionmaker():
    global _SESSIONMAKER
    if _SESSIONMAKER is None:
        _SESSIONMAKER = async_sessionmaker(_engine(), expire_on_commit=False)
    return _SESSIONMAKER


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    async with _sessionmaker()() as session:
        yield session


def _split_on_headings(text: str) -> list[str]:
    positions = [match.start() for match in _HEADING_RE.finditer(text)]
    if not positions:
        return [text]
    positions.append(len(text))
    return [text[positions[i] : positions[i + 1]].strip() for i in range(len(positions) - 1)]


def chunk_text(text: str) -> list[str]:
    chunks: list[str] = []
    for section in _split_on_headings(text):
        tokens = re.findall(r"\S+|\s+", section)
        if len(tokens) <= CHUNK_SIZE:
            if section.strip():
                chunks.append(section.strip())
            continue
        start = 0
        while start < len(tokens):
            end = min(start + CHUNK_SIZE, len(tokens))
            chunks.append("".join(tokens[start:end]).strip())
            if end == len(tokens):
                break
            start += CHUNK_SIZE - OVERLAP
    return [chunk for chunk in chunks if chunk]


async def embed_texts(texts: list[str]) -> list[list[float]]:
    key = openai_api_key()
    if not key:
        return [_local_embedding(text) for text in texts]
    client = openai.AsyncOpenAI(api_key=key, timeout=30.0)
    response = await client.embeddings.create(
        model=embedding_model(),
        input=texts,
        dimensions=EMBEDDING_DIM,
    )
    return [item.embedding for item in response.data]


def vector_literal(vector: list[float]) -> str:
    return "[" + ",".join(f"{value:.8f}" for value in vector) + "]"


def average_embedding(vectors: list[list[float]]) -> list[float] | None:
    if not vectors:
        return None
    dims = len(vectors[0])
    return [sum(vector[index] for vector in vectors) / len(vectors) for index in range(dims)]
