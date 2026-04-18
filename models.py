
from pydantic import BaseModel, Field, ConfigDict, field_validator
from enum import Enum


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


class LLM(str, Enum):
    CLAUDESONNET46 = 'anthropic/claude-sonnet-4.6'
    CLAUDEOPUS46 = 'anthropic/claude-opus-4.6'
    DEEPSEEK32 = 'deepseek/deepseek-v3.2'
    GEMINI3FLASHPREVIEW = 'google/gemini-3-flash-preview'
    MINIMAXM25 = 'minimax/minimax-m2.5'
    MIMO2PRO = 'xiaomi/mimo-v2-pro'
    MINIMAXM27 = 'minimax/minimax-m2.7'
    GROK41FAST = 'x-ai/grok-4.1-fast'
    GPT54 = 'openai/gpt-5.4'


class Prompt(BaseModel):
    model: LLM
    messages: list[Message]

    # This model does not support assistant message prefill. The conversation must end with a user message.
    @field_validator('messages')
    def last_message_from_user(cls, v):
        assert len(v) > 0 and v[-1].role == Role.USER
        return v

