
from fastapi import FastAPI, status, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles

import requests, json
from models import *
from chatDAO import ChatDAO
import utils

# load OPENROUTER_API_KEY
from dotenv import load_dotenv
load_dotenv()
import os
if not os.getenv('OPENROUTER_API_KEY'):
    raise Exception('OPENROUTER API KEY is missing')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')


LLMS_FILE = './llms.jsonl'
CHATS_FILE = './chats.jsonl'
MESSAGES_DIR = './messages'

llms = utils.load_llms(LLMS_FILE)
llm_names = [llm.name for llm in llms]

chatDAO = ChatDAO(CHATS_FILE, MESSAGES_DIR)

app = FastAPI()

# ---------
# ChatDAO APIs
# ---------

@app.get('/api/chats', response_class=JSONResponse)
def load_chats() -> list[Chat]:
    return chatDAO.load_chats()


@app.get('/api/chats/{chat_id}', response_class=JSONResponse)
def load_chat(chat_id: int) -> ChatWithMessages:
    try:
        return chatDAO.load_chat(chat_id)
        # chat_w_messages = chatDAO.load_chat(chat_id)
        # if chat_w_messages.messages and chat_w_messages.messages[-1].role == Role.USER:
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')


@app.post('/api/chats', response_class=JSONResponse)
def add_chat(chat_title_wrapper: ChatTitleWrapper):
    return {
        'chat_id': chatDAO.add_chat(chat_title_wrapper.chat_title)
    }


@app.delete('/api/chats/{chat_id}')
def delete_chat(chat_id: int):
    try:
        chatDAO.delete_chat(chat_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.patch('/api/chats/{chat_id}')
def rename_chat(chat_id: int, chat_title_wrapper: ChatTitleWrapper):
    try:
        chatDAO.rename_chat(chat_id, chat_title_wrapper.chat_title)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post('/api/messages', response_class=JSONResponse)
def add_message(chat_id: int, llm_name: str, user_message: Message):
    # llm_name = llm_name.replace('_', '')

    try:
        chat_w_messages = chatDAO.load_chat(chat_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')

    try:
        llm_idx = llm_names.index(llm_name)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid model {llm_name}.')

    model = llms[llm_idx].openrouter_reference

    if user_message.role != Role.USER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This model does not support assistant message prefill. The conversation must end with a user message.')

    chat_w_messages.messages.append(user_message)
    chatDAO.add_message(chat_id, user_message)

    response = requests.post(
        url='https://openrouter.ai/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer: {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json'
        },
        data=json.dumps({
            'model': model,
            'messages': [message.__dict__ for message in chat_w_messages.messages]
        })
    )

    response_json = response.json()

    assistant_message = Message(
        role=response_json['choices'][0]['message']['role'],
        content=response_json['choices'][0]['message']['content']
    )

    chatDAO.add_message(chat_id, assistant_message)

    return assistant_message


# ---------
# LLMs API
# ---------

@app.get('/api/llms', response_class=JSONResponse)
def load_llms() -> list[LLM]:
    return llms


# ---------
# Frontend
# ---------

app.mount('/', StaticFiles(directory='../frontend', html=True))


