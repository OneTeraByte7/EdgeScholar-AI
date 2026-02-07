"""Local stub package for `optimum` to provide a minimal `bettertransformer` module
when the optional extra isn't available in the environment.

This file intentionally keeps the package small and only exists to satisfy
imports during development. It should be removed if you install the real
`optimum[bettertransformer]` package.
"""

__all__ = ["bettertransformer"]
