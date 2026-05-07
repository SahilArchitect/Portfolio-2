"""Search — RAG pipeline request/response shapes."""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500, description="Natural-language question.")

    @field_validator("query")
    @classmethod
    def _strip_query(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("query must not be blank")
        return stripped


class Citation(BaseModel):
    doc_id: str = Field(description="Unique identifier of the source document.")
    title: str = Field(description="Title of the source document.")
    slug: str = Field(description="URL slug of the source document.")
    excerpt: str = Field(description="Short excerpt from the relevant chunk.")


class SearchResponse(BaseModel):
    answer: str = Field(description="Generated answer with [doc-id] citation markers.")
    citations: list[Citation] = Field(
        default_factory=list,
        description="Cited source documents ordered by relevance.",
    )
