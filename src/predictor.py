import abc
from configuration import LLMConfig, ChainConfig
from chain_multiton import ChainMultiton

class AbstractPredictor(abc.ABC):
    def __init__(self, model_config, chain_config):
        self._model_config = model_config
        self._chain_config = chain_config
        llm_configuration = LLMConfig(platform=self._model_config.platform,
                                      model_name=self._model_config.model_name,
                                      temperature=self._model_config.temperature)

        chain_configuration = ChainConfig(chain_name=self._chain_config.chain_name,
                                          memory_name=self._chain_config.memory_name,
                                          prompt_name=self._chain_config.prompt_name,
                                          token_limit = self._chain_config.token_limit,
                                          llm_configuration=llm_configuration)

        self._chain_multiton = ChainMultiton.get_instance(ChainMultiton.Key(chain_configuration))
        self._chain = self._chain_multiton.get_instance()

    @abc.abstractclassmethod
    def _predict(self,user_input):
        pass

    @abc.abstractclassmethod
    def _clear_memory(self):
        pass

    def predict(self,user_input):
        return self._predict(user_input)

    def clear_memory(self):
        return self._clear_memory()

class SimplePredictor(AbstractPredictor):
    def __init__(self, model_config, chain_config):
        super().__init__(model_config, chain_config)
    
    def _predict(self, user_input):
        return self._chain.predict(human_input = user_input)

    def _clear_memory(self):
        self._chain_multiton.clear_memory()