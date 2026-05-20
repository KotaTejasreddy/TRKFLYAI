"""Behavior guardrails for digital twins."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class BehaviorRules:
    max_response_length: int = 2000
    allowed_languages: list[str] = field(default_factory=lambda: ["en"])
    forbidden_topics: list[str] = field(default_factory=list)
    must_disclose_ai: bool = False
    safe_mode: bool = True

    def to_prompt_rules(self) -> str:
        rules = []
        if self.safe_mode: rules.append("Refuse any requests for harmful, illegal, or unethical content.")
        if self.must_disclose_ai: rules.append("If asked whether you are an AI, answer honestly.")
        if self.forbidden_topics: rules.append("NEVER discuss: " + ", ".join(self.forbidden_topics))
        rules.append(f"Keep responses under {self.max_response_length} characters.")
        return "\n".join(f"Rule: {r}" for r in rules)
