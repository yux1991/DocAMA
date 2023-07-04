from dataclasses import dataclass, field
from typing import Dict

@dataclass(frozen=True)
class PredictorConfig():
    platform: str = field
    model_name: str = field

    def __post_init__(self):
        pass

@dataclass(frozen=True)
class LLMConfig():
    platform: str = field
    model_name: str = field
    temperature: float = field

    def __post_init__(self):
        pass