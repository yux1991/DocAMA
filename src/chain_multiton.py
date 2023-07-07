from dataclasses import dataclass, field
from typing import Dict
from chain import Chain
from configuration import ChainConfig

class ChainMultiton():
    _pool: Dict['ChainMultiton.Key', Chain] = {}

    @dataclass(frozen=True)
    class Key:
        config: ChainConfig = field

        def __post_init__(self):
            pass

    @classmethod
    def get_instance(cls, key: Key) -> Chain:
        instance = cls._pool.get(key)
        if instance is None:
            instance = Chain(
                config = key.config
            )
            cls._pool[key] = instance
        return instance

