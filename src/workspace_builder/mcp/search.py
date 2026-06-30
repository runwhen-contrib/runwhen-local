"""Lightweight token-overlap ranking for SLX bundle search.

We deliberately keep this dependency-free for v1: SQL ``LIKE`` filters in
:mod:`workspace_builder.resource_store_reader` get us to a candidate set,
and this module re-ranks the candidates by tokenised overlap with the
query so an agent's natural-language phrasing ("failing pods", "key vault
rotation") surfaces the most relevant Skill bundle first.

A future iteration can swap this out for embeddings/semantic search
without changing the tool contract that clients see, because the only
thing this returns is a stable ``score`` + ``snippet`` pair attached to
each candidate dict.
"""

from __future__ import annotations

import re
from typing import Iterable

# Field weights for token-overlap scoring. Heuristic, not learned: matches
# in the SLX name should dominate matches in the long-form runbook body.
_NAME_WEIGHT = 4.0
_PATH_WEIGHT = 2.0
_KIND_WEIGHT = 1.5
_CONTENT_WEIGHT = 1.0

_TOKEN_RE = re.compile(r"[A-Za-z0-9]+")
_STOPWORDS = frozenset(
    {
        "a",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "but",
        "by",
        "for",
        "from",
        "in",
        "is",
        "it",
        "of",
        "on",
        "or",
        "that",
        "the",
        "this",
        "to",
        "was",
        "with",
    }
)

# Chars to scan around the first match when building a snippet. Roughly two
# lines of context, enough for an agent to verify relevance before fetching
# the full bundle.
_SNIPPET_RADIUS = 120


def tokenize(text: str) -> list[str]:
    """Return a lowercased, stopword-filtered token list for ``text``."""
    if not text:
        return []
    return [
        tok.lower()
        for tok in _TOKEN_RE.findall(text)
        if tok.lower() not in _STOPWORDS
    ]


def score_candidate(
    query_tokens: Iterable[str],
    *,
    name: str | None,
    path: str | None,
    kinds: Iterable[str] | None,
    content: str | None,
) -> float:
    """Score a single bundle against ``query_tokens``.

    Score is the weighted count of distinct query tokens that appear in
    each field. We count distinct tokens (not occurrences) so a long
    runbook can't drown out a tight name match.
    """
    query_set = set(query_tokens)
    if not query_set:
        return 0.0

    score = 0.0
    if name:
        name_tokens = set(tokenize(name))
        score += _NAME_WEIGHT * len(query_set & name_tokens)
    if path:
        path_tokens = set(tokenize(path))
        score += _PATH_WEIGHT * len(query_set & path_tokens)
    if kinds:
        kind_tokens = set(tokenize(" ".join(kinds)))
        score += _KIND_WEIGHT * len(query_set & kind_tokens)
    if content:
        content_tokens = set(tokenize(content))
        score += _CONTENT_WEIGHT * len(query_set & content_tokens)
    return score


def make_snippet(content: str, query: str) -> str:
    """Return a short snippet around the first query-token match in ``content``.

    Falls back to the head of ``content`` when no token matches (so callers
    always have something to display in tool output).
    """
    if not content:
        return ""
    haystack = content.lower()
    for tok in tokenize(query):
        idx = haystack.find(tok)
        if idx != -1:
            start = max(0, idx - _SNIPPET_RADIUS)
            end = min(len(content), idx + len(tok) + _SNIPPET_RADIUS)
            prefix = "..." if start > 0 else ""
            suffix = "..." if end < len(content) else ""
            return prefix + content[start:end].replace("\n", " ").strip() + suffix
    head = content[: 2 * _SNIPPET_RADIUS].replace("\n", " ").strip()
    return head + ("..." if len(content) > 2 * _SNIPPET_RADIUS else "")


__all__ = ["tokenize", "score_candidate", "make_snippet"]
