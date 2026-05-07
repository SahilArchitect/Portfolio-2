"""Text chunker — 512-token chunks, 64-token overlap, markdown-heading-aware.

Uses tiktoken for token counting (cl100k_base encoding, which is what
text-embedding-3-small uses).
"""

from __future__ import annotations

import re
from collections.abc import Sequence

try:  # tiktoken is preferred, but local tests must not require network installs.
    import tiktoken
except ModuleNotFoundError:  # pragma: no cover - exercised only when dependency is absent.
    tiktoken = None  # type: ignore[assignment]

_HEADING_RE = re.compile(r"^(#{1,6})\s", re.MULTILINE)
_CHUNK_SIZE = 512
_OVERLAP = 64


def _encode(text: str) -> list[int] | list[str]:
    if tiktoken is not None:
        return tiktoken.get_encoding("cl100k_base").encode(text)
    return re.findall(r"\S+|\s+", text)


def _decode(tokens: Sequence[int] | Sequence[str]) -> str:
    if not tokens:
        return ""
    if isinstance(tokens[0], int) and tiktoken is not None:
        return tiktoken.get_encoding("cl100k_base").decode(list(tokens))  # type: ignore[arg-type]
    return "".join(str(token) for token in tokens)


def _split_on_headings(text: str) -> list[str]:
    """Split markdown into sections at heading boundaries."""
    positions = [m.start() for m in _HEADING_RE.finditer(text)]
    if not positions:
        return [text]
    sections = []
    positions.append(len(text))
    for i in range(len(positions) - 1):
        section = text[positions[i] : positions[i + 1]].strip()
        if section:
            sections.append(section)
    return sections


def chunk_text(text: str) -> list[str]:
    """Split text into 512-token chunks with 64-token overlap.

    Respects markdown heading boundaries: never splits in the middle of a
    heading. If a section exceeds 512 tokens it is further split by sliding
    window with overlap.

    Args:
        text: Input markdown string.

    Returns:
        List of string chunks, each ≤512 tokens.
    """
    sections = _split_on_headings(text)
    chunks: list[str] = []

    for section in sections:
        tokens = _encode(section)
        if len(tokens) <= _CHUNK_SIZE:
            if tokens:
                chunks.append(section)
        else:
            # Slide a window over the token list.
            start = 0
            while start < len(tokens):
                end = min(start + _CHUNK_SIZE, len(tokens))
                chunk_tokens = tokens[start:end]
                chunks.append(_decode(chunk_tokens))
                if end == len(tokens):
                    break
                start += _CHUNK_SIZE - _OVERLAP

    return [c.strip() for c in chunks if c.strip()]
