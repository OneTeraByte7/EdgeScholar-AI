"""Minimal stub of `optimum.bettertransformer`.

This stub is intentionally lightweight: it does not implement the real
performance transformations. It simply provides a `BetterTransformer` class
and helper functions that return the original model unchanged so imports
and basic codepaths succeed during development.

Replace this with the real `optimum[bettertransformer]` implementation for
production or when you need BetterTransformer optimizations.
"""
from typing import Any


class BetterTransformer:
    """Development stub for the real BetterTransformer.

    Usage in code that expects a transformer-optimized object should still
    work (the returned object will just be the original model).
    """

    def __init__(self, model: Any):
        self.model = model

    @staticmethod
    def from_transformers(model: Any, *args, **kwargs) -> Any:
        """Return the original model unchanged (stub)."""
        return model

    @staticmethod
    def transform(model: Any, *args, **kwargs) -> Any:
        """Return the original model unchanged (stub)."""
        return model

    def to(self, *args, **kwargs) -> Any:
        return self.model


__all__ = ["BetterTransformer"]
