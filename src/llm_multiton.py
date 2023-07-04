from dataclasses import dataclass, field
from typing import Dict
from llm import LLM
from configuration import LLMConfig

class LLMMultiton():
    _pool: Dict['LLMMultiton.Key', LLM] = {}

    @dataclass(frozen=True)
    class Key:
        config: LLMConfig = field
        llm_config: str = field(init=False)

        def __post_init__(self):
            object.__setattr__(self, "llm_config", self.config)

    @classmethod
    def get_instance(cls, key: Key) -> LLM:
        instance = cls._pool.get(key)
        if instance is None:
            instance = LLM(
                config = key.llm_config
            )
            cls._pool[key] = instance
        return instance

