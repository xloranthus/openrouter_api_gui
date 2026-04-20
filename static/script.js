
// TODO delete last message

import {Message, Chat, ChatWithMessages, ChatTitleWrapper, LLMs, Prompt} from './models';
import {Client} from './client';

const PORT = 55001;
const API_BASE_URL = `http://localhost:${PORT}/api`;

const client = new Client(API_BASE_URL);

const chatsContainer = document.getElementById('chats-container');
let activeChat = null;
const chatTitle = document.getElementById('chat-title');
const messagesContainer = document.getElementById('messages-container');


async function _activateChat(el){

    if(el === activeChat){
        return;
    }

    activeChat.classList.remove('active-chat');
    el.classList.add('active-chat');
    activeChat = el;

    const chatWithMessages = await client.loadChat(el.id);

    chatTitle.textContent = chatWithMessages.title;
    messagesContainer.innerHTML = '';
    chatWithMessages.messages.forEach(message => {
        const p = document.createElement('p');
        p.role = message.role;
        p.textContent = message.content;
        messagesContainer.appendChild(p);
    });
}


function _deleteChat(){

}


function onChatsContainerClick(e){

    const el = e.target;
    if('chat' in el.classList){
        _activateChat(el);
    }else if('delete-chat' in el.classList){
        _deleteChat(el);
    }else if('rename-chat' in el.classList){
        _renameChat(el);
    }else{
        // random mas helyre ment a kattintas
    }
}


function _createChatNode(chat){
    const li = document.createElement('li');
    li.id = chat.id_;
    li.textContent = chat.title;
    return li;
}


async function initChatsContainer(){

    const chats = await client.loadChats();

    chats.forEach(chat => {
        const chatNode = _createChatNode(chat);
        chatsContainer.prepend(chatNode);
    });

    chatsContainer.addEventListener('click', onChatsContainerClick);
}


async function onAddChat(){

    let chatTitle, chatTitleOk;
    do{
        chatTitle = window.prompt('Chat title:');
        chatTitleOk = chatTitle.trim() !== '';
        if(!chatTitleOk){
            window.alert('Chat is missing title.');
        }
    }while(!chatTitleOk);

    const chatId = await client.addChat(chatTitle);

    const chat = new Chat(chatId, chatTitle);
    const chatNode = _createChatNode(chat);
    chatsContainer.prepend(chatNode);
    chatNode.click();

}


function onAddMessage(){

}

function onDeleteLastMessage(){

}



