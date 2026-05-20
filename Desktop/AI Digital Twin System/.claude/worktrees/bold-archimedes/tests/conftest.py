"""Shared test fixtures."""

from __future__ import annotations

import pytest

from app.personality.traits import TraitVector
from app.personality.style import StyleProfile


@pytest.fixture
def sample_personality_data() -> dict:
    return {"openness": 0.8, "conscientiousness": 0.6, "extraversion": 0.7, "agreeableness": 0.9, "neuroticism": 0.2}


@pytest.fixture
def sample_style_data() -> dict:
    return {"tone": "warm", "formality": 0.3, "verbosity": 0.6, "humor": 0.7,
            "vocabulary_level": "standard", "preferred_phrases": ["absolutely", "great question"],
            "avoided_topics": ["politics", "religion"]}


@pytest.fixture
def sample_trait_vector(sample_personality_data) -> TraitVector:
    return TraitVector.from_dict(sample_personality_data)


@pytest.fixture
def sample_style_profile(sample_style_data) -> StyleProfile:
    return StyleProfile.from_dict(sample_style_data)
