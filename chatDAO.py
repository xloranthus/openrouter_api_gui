
import json, os

MESSAGES_DIR = './messages'
CHATS_FILE = './chats.jsonl'

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


class ActiveChat(Chat):
    def __init__(self, id_: int, title: str, messages: list[Message]):
        super().__init__(id_, title)
        self.messages = messages


def chat_id_to_messages_path(chat_id: int) -> str:
    return os.path.join(MESSAGES_DIR, f'{chat_id:03}.jsonl')


def load_chats() -> list[Chat]:
    chats: list[Chat] = []
    with open(CHATS_FILE, 'r') as f:
        for line in f:
            chat = json.loads(line)
            chats.append(chat)
    return chats


def load_messages(messages_path) -> list[Message]:
    messages: list[Message] = []
    with open(messages_path, 'r') as f:
        for line in f:
            message = json.loads(line)
            messages.append(message)
    return messages


def load_chat(chat_id: int) -> Chat:
    if not chat_exists(chat_id):
        raise Exception(f'chat does not exist: "{chat_id}"')

    messages_path = chat_id_to_messages_path(chat_id)
    messages = load_messages(messages_path)

    chat_title = get_chat_title(chat_id)

    return ActiveChat(chat_id, chat_title, messages)


def chat_exists(chat_id: int) -> bool:
    chats = load_chats()
    return bool([chat for chat in chats if chat.id_ == chat_id])


def get_chat_title(chat_id: int) -> str:
    chats = load_chats()
    return [chat for chat in chats if chat.id_ == chat_id][0].title


def add_message(chat_id: int, message: Message) -> None:
    pass
    # if chat_exists(chat.id_):


def delete_last_message(chat_id: int) -> None:
    pass


def rename_chat(chat_id: int, chat_title: str) -> None:
    pass


def delete_chat(chat_id: int) -> None:
    pass
