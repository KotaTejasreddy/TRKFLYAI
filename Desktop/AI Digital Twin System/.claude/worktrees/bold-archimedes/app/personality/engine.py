"""Core Personality Engine - assembles trait, style, and rules into a coherent persona."""

from __future__ import annotations

from dataclasses import dataclass

from app.personality.rules import BehaviorRules
from app.personality.style import StyleProfile
from app.personality.traits import TraitVector


@dataclass
class PersonalityProfile:
    traits: TraitVector
    style: StyleProfile
    rules: BehaviorRules

    def to_system_context(self) -> str:
        sections = [
            f"## Personality\n{self.traits.describe()}",
            f"\n## Communication Style\n{self.style.to_prompt_instructions()}",
            f"\n## Behavioral Rules\n{self.rules.to_prompt_rules()}",
        ]
        return "\n".join(sections)


class PersonalityEngine:
    @staticmethod
    def build_profile(personality_data: dict, style_data: dict, rules_data: dict | None = None) -> PersonalityProfile:
        return PersonalityProfile(
            traits=TraitVector.from_dict(personality_data),
            style=StyleProfile.from_dict(style_data),
            rules=BehaviorRules(**(rules_data or {})),
        )

    @staticmethod
    def build_from_twin(twin) -> PersonalityProfile:
        return PersonalityEngine.build_profile(
            personality_data=twin.personality or {},
            style_data=twin.style or {},
            rules_data=twin.metadata_.get("behavior_rules") if twin.metadata_ else None,
        )
