
from pydantic import BaseModel, Field, ConfigDict, field_validator
from enum import Enum
import os
from datetime import datetime


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
    # last_modified: datetime
    last_modified: str = Field(pattern=r'\S+')

    # rename chat title miatt kell
    model_config = ConfigDict(validate_assignment=True)


class ChatWithMessages(BaseModel):
    id_: int = Field(ge=0)
    title: str = Field(pattern=r'[^\s]+')
    messages: list[Message]


class ChatTitleWrapper(BaseModel):
    chat_title: str = Field(pattern=r'\S+')


class LLM(BaseModel):
    name: str = Field(pattern=r'\S+')
    openrouter_reference: str = Field(pattern=r'\S+')
    logo_file: str = Field(pattern=r'\S+')


