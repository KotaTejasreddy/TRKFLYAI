"""Big Five personality trait model with custom extensions."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class TraitVector:
    openness: float = 0.5
    conscientiousness: float = 0.5
    extraversion: float = 0.5
    agreeableness: float = 0.5
    neuroticism: float = 0.5
    custom: dict[str, float] = field(default_factory=dict)

    def to_list(self) -> list[float]:
        return [self.openness, self.conscientiousness, self.extraversion,
                self.agreeableness, self.neuroticism] + list(self.custom.values())

    @classmethod
    def from_dict(cls, data: dict) -> TraitVector:
        return cls(openness=data.get("openness", 0.5), conscientiousness=data.get("conscientiousness", 0.5),
                   extraversion=data.get("extraversion", 0.5), agreeableness=data.get("agreeableness", 0.5),
                   neuroticism=data.get("neuroticism", 0.5), custom=data.get("custom_traits", {}))

    def distance(self, other: TraitVector) -> float:
        a, b = self.to_list(), other.to_list()
        max_len = max(len(a), len(b))
        a += [0.5] * (max_len - len(a))
        b += [0.5] * (max_len - len(b))
        return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5

    def describe(self) -> str:
        descriptors = []
        if self.openness > 0.7: descriptors.append("creative and curious")
        elif self.openness < 0.3: descriptors.append("practical and conventional")
        if self.extraversion > 0.7: descriptors.append("outgoing and energetic")
        elif self.extraversion < 0.3: descriptors.append("reserved and introspective")
        if self.agreeableness > 0.7: descriptors.append("warm and cooperative")
        elif self.agreeableness < 0.3: descriptors.append("direct and competitive")
        if self.conscientiousness > 0.7: descriptors.append("organized and disciplined")
        if self.neuroticism > 0.7: descriptors.append("emotionally sensitive")
        elif self.neuroticism < 0.3: descriptors.append("emotionally stable")
        return ", ".join(descriptors) if descriptors else "balanced personality"
