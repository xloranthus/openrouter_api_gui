
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from models import *
from chatDAO import ChatDAO

app = FastAPI()

app.mount('/static', StaticFiles(directory='static'), name='static')
templates = Jinja2Templates(directory='templates')

CHATS_FILE = './chats.jsonl'
MESSAGES_DIR = './messages'
chatDAO = ChatDAO(CHATS_FILE, MESSAGES_DIR)

# ---------
# Frontend
# ---------

@app.get('/', name='home_page', response_class=HTMLResponse)
def home_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name='index.html',
        context={}
    )

@app.get('/chats', name='chats', response_class=HTMLResponse)
def chats_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name='chats.html',
        context={}
    )

@app.get('/summarizer', name='summarizer', response_class=HTMLResponse)
def chats_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name='summarizer.html',
        context={}
    )

# ---------
# APIs
# ---------

@app.get('/api/chats', response_class=JSONResponse)
def load_chats():
    pass


@app.get('/api/chats/{id}', response_class=JSONResponse)
def load_chat():
    pass


@app.post('/api/chats')
def add_chat():
    pass


@app.delete('/api/chats/{id}')
def delete_chat():
    pass


@app.patch('/api/chats/{id}')
def rename_chat():
    pass


@app.post('/api/messages/{id}')
def add_message():
    pass


@app.delete('/api/messages/{id}')
def delete_last_message():
    pass

