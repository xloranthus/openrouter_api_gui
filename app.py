
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import requests, json
from models import *
from chatDAO import ChatDAO


# load OPENROUTER_API_KEY
from dotenv import load_dotenv
load_dotenv()
import os
if not os.getenv('OPENROUTER_API_KEY'):
    raise Exception('OPENROUTER API KEY is missing')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')


# load LLMs
LLMS_FILE = './llms.jsonl'
if not os.path.exists(LLMS_FILE):
    raise Exception('Cannot load LLMs. LLMs file does not exist.')
llms: list[LLM] = []
with open(LLMS_FILE, 'r') as f:
    for line in f:
        llm_dict = json.loads(line)
        llm = LLM(**llm_dict)
        llms.append(llm)
if not llms:
    raise Exception('No LLMs to choose from.')
llm_names = [llm.name for llm in llms]


app = FastAPI()

app.mount('/static', StaticFiles(directory='static'), name='static')
app.mount('/img', StaticFiles(directory='img'), name='img')
templates = Jinja2Templates(directory='templates')

CHATS_FILE = './chats.jsonl'
MESSAGES_DIR = './messages'
chatDAO = ChatDAO(CHATS_FILE, MESSAGES_DIR)

# ---------
# Frontend
# ---------

@app.get('/', name='index', response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name='index.html',
        context={}
    )


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
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')


@app.patch('/api/chats/{chat_id}')
def rename_chat(chat_id: int, chat_title_wrapper: ChatTitleWrapper):
    try:
        chatDAO.rename_chat(chat_id, chat_title_wrapper.chat_title)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')


@app.post('/api/messages', status_code=status.HTTP_204_NO_CONTENT)
def add_message(chat_id: int, message: Message):
    try:
        chatDAO.add_message(chat_id, message)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')


@app.delete('/api/messages')
def delete_last_message(chat_id: int):
    try:
        chatDAO.delete_last_message(chat_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Chat ID {chat_id} does not exist.')


# ---------
# LLMs API
# ---------

@app.get('/api/llms', response_class=JSONResponse)
def load_llms() -> list[LLM]:
    return llms


# ---------
# OpenRouter API
# ---------

@app.post('/api/openrouter', response_class=JSONResponse)
def prompt_llm(prompt: Prompt) -> Message:

    if prompt.model not in llm_names:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid model {prompt.model}')

    prompt.model = [llm for llm in llms if llm.name == prompt.model][0].openrouter_reference

    response = requests.post(
        url='https://openrouter.ai/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer: {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json'
        },
        data=json.dumps({
            'model': prompt.model,
            'messages': [message.__dict__ for message in prompt.messages]
        })
    )

    response_json = response.json()

    return Message(
        role=response_json['choices'][0]['message']['role'],
        content=response_json['choices'][0]['message']['content']
    )



