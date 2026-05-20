"""Tests for the personality engine."""

from app.personality.engine import PersonalityEngine


def test_build_profile(sample_personality_data, sample_style_data):
    profile = PersonalityEngine.build_profile(sample_personality_data, sample_style_data)
    assert profile.traits.openness == 0.8
    assert profile.style.tone == "warm"
    assert profile.rules.safe_mode is True


def test_system_context_output(sample_personality_data, sample_style_data):
    profile = PersonalityEngine.build_profile(sample_personality_data, sample_style_data)
    context = profile.to_system_context()
    assert "Personality" in context
    assert "Communication Style" in context
    assert "Behavioral Rules" in context
    assert "politics" in context
