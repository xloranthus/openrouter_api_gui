
import json, os
from models import Message, Chat, ChatWithMessages

class ChatDAO:

    def __init__(self, chats_file, messages_dir):
        self._chats_file = chats_file
        self._messages_dir = messages_dir


    def load_chats(self) -> list[Chat]:
        if not os.path.exists(self._chats_file):
            return []

        chats: list[Chat] = []
        with open(self._chats_file, 'r') as f:
            for line in f:
                chat = json.loads(line)
                chats.append(chat)
        return chats


    def load_chat(self, chat_id: int) -> ChatWithMessages:
        self._raise_exception_if_chat_does_not_exist(chat_id)

        messages = self._load_messages(chat_id)
        chat_title = self._get_chat_title(chat_id)
        return ChatWithMessages(chat_id, chat_title, messages)


    def add_chat(self, chat_title: str) -> None:
        chats = self.load_chats()
        chat_id = 0 if not chats else chats[-1].id_ + 1
        self._append_chat(Chat(chat_id, chat_title))


    def delete_chat(self, chat_id: int) -> None:
        self._raise_exception_if_chat_does_not_exist(chat_id)

        chats = self.load_chats()
        chats = [chat for chat in chats if chat.id_ != chat_id]
        self._write_chats(chats)


    def rename_chat(self, chat_id: int, chat_title: str) -> None:
        self._raise_exception_if_chat_does_not_exist(chat_id)

        chats = self.load_chats()
        for chat in chats:
            if chat.id_ == chat_id:
                chat.title = chat_title
                break
        self._write_chats(chats)


    def add_message(self, chat_id: int, message: Message) -> None:
        self._raise_exception_if_chat_does_not_exist(chat_id)
        self._append_message(chat_id, message)


    def delete_last_message(self, chat_id: int) -> None:
        self._raise_exception_if_chat_does_not_exist(chat_id)
        messages = self._load_messages(chat_id)
        if not messages:
            raise Exception(f'cannot delete last message, because there are no messages for chat: "{chat_id}"')

        messages = messages[:-1]
        self._write_messages(chat_id, messages)


    def _chat_id_to_messages_path(self, chat_id: int) -> str:
        return os.path.join(self._messages_dir, f'{chat_id:03}.jsonl')


    def _chat_exists(self, chat_id: int) -> bool:
        chats = self.load_chats()
        return bool([chat for chat in chats if chat.id_ == chat_id])


    def _raise_exception_if_chat_does_not_exist(self, chat_id: int):
        if not self._chat_exists(chat_id):
            raise Exception(f'chat does not exist: "{chat_id}"')


    def _get_chat_title(self, chat_id: int) -> str:
        chats = self.load_chats()
        return [chat for chat in chats if chat.id_ == chat_id][0].title


    def _load_messages(self, chat_id: int) -> list[Message]:
        messages_path = self._chat_id_to_messages_path(chat_id)
        if not os.path.exists(messages_path):
            return []

        messages: list[Message] = []
        with open(messages_path, 'r') as f:
            for line in f:
                message = json.loads(line)
                messages.append(message)
        return messages


    def _append_chat(self, chat: Chat) -> None:
        with open(self._chats_file, 'a') as f:
            f.write(json.dumps(chat) + '\n')


    def _write_chats(self, chats: list[Chat]) -> None:
        with open(self._chats_file, 'w') as f:
            for chat in chats:
                f.write(json.dumps(chat) + '\n')


    def _append_message(self, chat_id: int, message: Message) -> None:
        messages_path = self._chat_id_to_messages_path(chat_id)
        with open(messages_path, 'a') as f:
            f.write(json.dumps(message) + '\n')


    def _write_messages(self, chat_id: int, messages: list[Message]) -> None:
        messages_path = self._chat_id_to_messages_path(chat_id)
        with open(messages_path, 'w') as f:
            for message in messages:
                f.write(json.dumps(message) + '\n')
