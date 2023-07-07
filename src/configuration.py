from dataclasses import dataclass, field
from llm import LLM

@dataclass(frozen=True)
class LLMConfig():
    platform: str = field
    model_name: str = field
    temperature: float = field

    def __post_init__(self):
        pass

@dataclass(frozen=True)
class ChainConfig():
    chain_name: str = field
    memory_name: str = field
    prompt_name: str = field
    token_limit: int = field
    llm_configuration: LLMConfig = field

    def __post_init__(self):
        pass

@dataclass(frozen=True)
class PredictorConfig():
    model_config: LLMConfig = field
    chain_config: ChainConfig = field

    def __post_init__(self):
        pass

