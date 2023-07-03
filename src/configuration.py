from dataclasses import dataclass, field

@dataclass(frozen=True)
class PredictorConfig():
    name: str = field
    key: str = field(init=False)

    def __post_init__(self):
        object.__setattr__(self, "key", self.name)

@dataclass(frozen=True)
class LLMConfig():
    platform: str = field
    model_name: str = field
    temperature: float = field
    key: str = field(init=False)

    def __post_init__(self):
        object.__setattr__(self, "key", self.model_name)