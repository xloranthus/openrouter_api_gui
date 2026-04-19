
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


LLMs = {
    'Claude Sonnet 4.6': 'anthropic/claude-sonnet-4.6',
    'Claude Opus 4.6': 'anthropic/claude-opus-4.6',
    'DeepSeek V3.2': 'deepseek/deepseek-v3.2',
    'Gemini 3 Flash Preview': 'google/gemini-3-flash-preview',
    'MiMo-V2-Pro': 'xiaomi/mimo-v2-pro',
    'MiniMax M2.5': 'minimax/minimax-m2.5',
    'MiniMax M2.7': 'minimax/minimax-m2.7',
    'Grok 4.1 Fast': 'x-ai/grok-4.1-fast',
    'GPT-5.4': 'openai/gpt-5.4'
}


class Prompt(BaseModel):
    model: str
    messages: list[Message]


    @field_validator('model')
    def model_in_llms(cls, v):
        assert v in LLMs.keys(), f'Invalid model {v}.'
        return LLMs[v]


    # This model does not support assistant message prefill. The conversation must end with a user message.
    @field_validator('messages')
    def last_message_from_user(cls, v):
        assert len(v) > 0 and v[-1].role == Role.USER, 'This model does not support assistant message prefill. The conversation must end with a user message.'
        return v

