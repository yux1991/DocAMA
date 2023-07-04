from dataclasses import dataclass, field
from typing import Dict
from predictor import SimplePredictor
from configuration import PredictorConfig

class SimplePredictorMultiton():
    _pool: Dict['SimplePredictorMultiton.Key', SimplePredictor] = {}

    @dataclass(frozen=True)
    class Key:
        config: PredictorConfig = field
        model_config: PredictorConfig = field(init=False)

        def __post_init__(self):
            object.__setattr__(self, "model_config", self.config)

    @classmethod
    def get_instance(cls, key: Key) -> SimplePredictor:
        instance = cls._pool.get(key)
        if instance is None:
            instance = SimplePredictor(
                model_config = key.model_config
            )
            cls._pool[key] = instance
        return instance