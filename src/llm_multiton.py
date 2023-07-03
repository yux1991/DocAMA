from dataclasses import dataclass, field
from typing import Dict
from llm import LLM
from configuration import LLMConfig

class LLMMultiton():
    _pool: Dict['LLMMultiton.Key', LLM] = {}

    @dataclass(frozen=True)
    class Key:
        config: LLMConfig = field
        llm_key: str = field(init=False)

        def __post_init__(self):
            object.__setattr__(self, "llm_key", self.config.key)

    @classmethod
    def get_instance(cls, key: Key) -> LLM:
        instance = cls._pool.get(key)
        if instance is None:
            instance = LLM(
                config = key.config
            )
            cls._pool[key] = instance
        return instance

