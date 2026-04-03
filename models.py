

class Message:
    def __init__(self, role: str, content: str):
        if role not in ('user', 'assistant'):
            raise Exception(f'invalid role: "{role}"')
        self.role = role
        self.content = content


class Chat:
    def __init__(self, id_: int, title: str):
        self.id_ = id_
        self.title = title


class ChatWithMessages(Chat):
    def __init__(self, id_: int, title: str, messages: list[Message]):
        super().__init__(id_, title)
        self.messages = messages
