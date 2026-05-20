"""Tests for personality trait model."""

from app.personality.traits import TraitVector


def test_trait_vector_from_dict(sample_personality_data):
    tv = TraitVector.from_dict(sample_personality_data)
    assert tv.openness == 0.8
    assert tv.extraversion == 0.7


def test_trait_vector_defaults():
    tv = TraitVector.from_dict({})
    assert tv.openness == 0.5
    assert tv.neuroticism == 0.5


def test_trait_distance_identical():
    a = TraitVector(openness=0.5, extraversion=0.5)
    b = TraitVector(openness=0.5, extraversion=0.5)
    assert a.distance(b) == 0.0


def test_trait_distance_different():
    a = TraitVector(openness=0.0)
    b = TraitVector(openness=1.0)
    assert a.distance(b) > 0


def test_describe_high_openness():
    tv = TraitVector(openness=0.9, extraversion=0.8)
    desc = tv.describe()
    assert "creative" in desc
    assert "outgoing" in desc


def test_to_list_length():
    tv = TraitVector(custom={"empathy": 0.9})
    assert len(tv.to_list()) == 6
