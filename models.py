
from pydantic import BaseModel, Field, ConfigDict, field_validator
from enum import Enum
import os


# String Enum (best for APIs)
class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class Message(BaseModel):
    role: Role
    content: str = Field(pattern=r'[^\s]+')


class Chat(BaseModel):
    id_: int = Field(ge=0)
    title: str = Field(pattern=r'[^\s]+')

    # rename chat title miatt kell
    model_config = ConfigDict(validate_assignment=True)


class ChatWithMessages(Chat):
    messages: list[Message]


class ChatTitleWrapper(BaseModel):
    chat_title: str = Field(pattern=r'\S+')


class LLM(BaseModel):
    name: str = Field(pattern=r'\S+')
    openrouter_reference: str = Field(pattern=r'\S+')
    logo_file: str

    @field_validator('logo_file')
    def logo_file_exists(cls, v):
        assert os.path.exists(os.path.join('img', v)), f'Logo file {v} does not exist.'
        return v


class Prompt(BaseModel):
    model: str = Field(pattern=r'\S+')
    messages: list[Message]

    # This model does not support assistant message prefill. The conversation must end with a user message.
    @field_validator('messages')
    def last_message_from_user(cls, v):
        assert len(v) > 0 and v[-1].role == Role.USER, 'This model does not support assistant message prefill. The conversation must end with a user message.'
        return v

