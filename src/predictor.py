import abc
from langchain import LLMChain, PromptTemplate
from llm_multiton import LLMMultiton
from configuration import LLMConfig

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

    @abc.abstractclassmethod
    def _clear_memory(self):
        pass

    def predict(self,user_input):
        return self._predict(user_input)

    def get_answer(self):
        return self._get_answer()

    def clear_memory(self):
        return self._clear_memory()

class SimplePredictor(AbstractPredictor):
    def __init__(self, config):
        super().__init__(config)
    
    def _get_answer(self):
        template = """Question: {question}

        Answer: """

        prompt = PromptTemplate(
                template=template,
            input_variables=['question']
        )

        # user question
        question = ';'.join(self._conversation) 

        llm_configuration = LLMConfig(platform='hugging-face', model_name='google/flan-t5-small', temperature=1e-10)
        llm = LLMMultiton.get_instance(LLMMultiton.Key(llm_configuration)).get_llm()

        llm_chain = LLMChain(
            prompt=prompt,
            llm=llm
        )

        print('Question: '+question)
        answer = llm_chain.run(question)
        print('Answer: '+answer)
        return answer

    def _predict(self, user_input):
        self._user_input = user_input
        self._conversation.append(self._user_input)

        return self.get_answer()

    def _clear_memory(self):
        self._conversation = []