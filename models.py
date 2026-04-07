

class Message:
    def __init__(self, role: str, content: str):
        if role not in ('user', 'assistant'):
            raise Exception(f'invalid role: "{role}"')
        self.role = role
        self.content = content


    def __str__(self):
        return str(self.__dict__)


def dict_to_message(dict_: dict) -> Message:
    return Message(dict_['role'], dict_['content'])


class Chat:
    def __init__(self, id_: int, title: str):
        self.id_ = id_
        self.title = title


    def __str__(self):
        return str(self.__dict__)


def dict_to_chat(dict_: dict) -> Chat:
    return Chat(dict_['id_'], dict_['title'])


class ChatWithMessages(Chat):
    def __init__(self, id_: int, title: str, messages: list[Message]):
        super().__init__(id_, title)
        self.messages = messages


    def __str__(self):
        return str(self.__dict__)


def dict_to_chatwithmessages(dict_: dict) -> Chat:
    message_dicts = dict_['messages']
    messages = [dict_to_message(message_dict) for message_dict in message_dicts]
    return ChatWithMessages(dict_['id_'], dict_['title'], messages)
