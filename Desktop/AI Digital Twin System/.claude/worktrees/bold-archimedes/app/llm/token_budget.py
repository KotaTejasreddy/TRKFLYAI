"""Token counting and budget management."""

from __future__ import annotations
import tiktoken

_DEFAULT_ENCODING = "cl100k_base"

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    try:
        enc = tiktoken.encoding_for_model(model)
    except KeyError:
        enc = tiktoken.get_encoding(_DEFAULT_ENCODING)
    return len(enc.encode(text))

def trim_messages_to_budget(messages: list[dict], max_tokens: int, model: str = "gpt-4o") -> list[dict]:
    if not messages:
        return messages
    system_msgs = [m for m in messages if m.get("role") == "system"]
    non_system = [m for m in messages if m.get("role") != "system"]
    system_cost = sum(count_tokens(m["content"], model) for m in system_msgs)
    remaining = max_tokens - system_cost
    kept: list[dict] = []
    for msg in reversed(non_system):
        cost = count_tokens(msg["content"], model)
        if remaining - cost < 0:
            break
        kept.insert(0, msg)
        remaining -= cost
    return system_msgs + kept
