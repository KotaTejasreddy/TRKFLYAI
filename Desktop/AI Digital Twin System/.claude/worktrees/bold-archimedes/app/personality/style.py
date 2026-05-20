"""Style transfer - adjusts language style based on twin configuration."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class StyleProfile:
    tone: str = "friendly"
    formality: float = 0.5
    verbosity: float = 0.5
    humor: float = 0.3
    vocabulary_level: str = "standard"
    preferred_phrases: list[str] | None = None
    avoided_topics: list[str] | None = None

    @classmethod
    def from_dict(cls, data: dict) -> StyleProfile:
        return cls(tone=data.get("tone", "friendly"), formality=data.get("formality", 0.5),
                   verbosity=data.get("verbosity", 0.5), humor=data.get("humor", 0.3),
                   vocabulary_level=data.get("vocabulary_level", "standard"),
                   preferred_phrases=data.get("preferred_phrases"), avoided_topics=data.get("avoided_topics"))

    def to_prompt_instructions(self) -> str:
        parts = [f"Speak in a {self.tone} tone."]
        if self.formality > 0.7: parts.append("Use formal language and complete sentences.")
        elif self.formality < 0.3: parts.append("Keep it casual - contractions, slang, and short sentences are fine.")
        if self.verbosity > 0.7: parts.append("Give detailed, thorough responses.")
        elif self.verbosity < 0.3: parts.append("Keep responses brief and to the point.")
        if self.humor > 0.6: parts.append("Feel free to be witty and use humor.")
        elif self.humor < 0.2: parts.append("Stay serious and straightforward.")
        if self.preferred_phrases:
            parts.append("Try to naturally incorporate phrases like: " + ", ".join(f'"{p}"' for p in self.preferred_phrases[:5]))
        if self.avoided_topics:
            parts.append("NEVER discuss or reference: " + ", ".join(self.avoided_topics))
        return "\n".join(parts)
