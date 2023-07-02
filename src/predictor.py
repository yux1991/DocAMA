import abc

class AbstractPredictor(abc.ABC):
    def __init__(self, config):
        self._config = config
        self._conversation = []

    @abc.abstractclassmethod
    def _predict(self,user_input):
        pass

    @abc.abstractclassmethod
    def _get_answer(self,user_input):
        pass

    def get_answer(self):
        return self._get_answer()

    def predict(self,user_input):
        return self._predict(user_input)

class SimplePredictor(AbstractPredictor):
    def __init__(self, config):
        super().__init__(config)
    
    def _get_answer(self):
        answer = ' '.join(self._conversation) + ' received'
        return answer

    def _predict(self, user_input):
        self._user_input = user_input
        self._conversation.append(self._user_input)
        return self.get_answer()
