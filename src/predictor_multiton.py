from dataclasses import dataclass, field
from typing import Dict
from predictor import SimplePredictor
from configuration import PredictorConfig

class SimplePredictorMultiton():
    _pool: Dict['SimplePredictorMultiton.Key', SimplePredictor] = {}

    @dataclass(frozen=True)
    class Key:
        config: PredictorConfig = field
        simple_predictor_key: str = field(init=False)

        def __post_init__(self):
            object.__setattr__(self, "simple_predictor_key", self.config.key)

    @classmethod
    def get_instance(cls, key: Key) -> SimplePredictor:
        instance = cls._pool.get(key)
        if instance is None:
            instance = SimplePredictor(
                config = key.config
            )
            cls._pool[key] = instance
        return instance