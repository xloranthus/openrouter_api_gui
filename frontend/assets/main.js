
import {Message, Chat, ChatWithMessages, ChatTitleWrapper, LLM} from './models.js';
import {Client} from './client.js';
import {createModelEl, createChatEl, toModelElId, fromModelElId, toChatElId, fromChatElId, createActiveChatTitleEl, createActiveChatMessageEl, assert} from './utils.js';

const HOST = 'localhost';
const PORT = 55001;
const API_BASE_URL = `http://${HOST}:${PORT}/api`;

const client = new Client(API_BASE_URL);

const ACTIVE_CHAT_EL_DEFAULT_TITLE = 'Create a new or load an existing chat to begin.';
const WAITING_FOR_LLM_RESPONSE_MESSAGE = 'Please wait, the AI 🤖 is thinking...';

// globalis valtozok
const modelDropdownEl = document.getElementById('model-dropdown');
const chatsEl = document.getElementById('chats');
const activeChatEl = document.getElementById('active-chat');
const inputBoxEl = document.getElementById('inputBox');
let activeDropdownEl = null;
let activeChatId = -1; // -1 means no active chat


// fentrol lefele, balrol jobbra haladva ezek a funkciok
const actionMap = {
    "select-model": selectModel,
    "add-chat": addChat,
    "load-chat": loadChat,
    "rename-chat": renameChat,
    "delete-chat": deleteChat,
    "send-message": sendMessage
};

init();

function init(){
    /*
    init -> loadLLMs alapjan feltolti model-dropdownt,
    loadChats alapjan feltolti chats-et,
    active-chat-title-be beirja hogy "Create new or load an existing chat to begin"
    globalClickListener-t felveszi document.addEventListener-el.
     */

    initModelDropdownEl();

    initChatsEl();

    setActiveChatEl(ACTIVE_CHAT_EL_DEFAULT_TITLE);

    document.addEventListener('click', globalClickListener);

    inputBoxEl.addEventListener('keydown', inputBoxEnterListener);
}

async function initModelDropdownEl(){

    const llms = await client.loadLLMs();

    const selectedModelEl = createModelEl(llms[0], 0);
    selectedModelEl.classList.add('selected');
    modelDropdownEl.prepend(selectedModelEl);

    for(let i = 1; i <llms.length; ++i){
        const modelOptionEl = createModelEl(llms[i], i);
        modelOptionEl.classList.add('option');
        modelOptionEl.dataset.action = 'select-model';
        modelDropdownEl.querySelector('.options').append(modelOptionEl);
    }

}

async function initChatsEl(){

    const chats = await client.loadChats();

    chats.forEach(chat => {
        const chatEl = createChatEl(chat);
        chatsEl.append(chatEl);
    });
}


function setActiveChatEl(title, messages){

    activeChatEl.innerHTML = '';
    activeChatEl.append(createActiveChatTitleEl(title));
    if(messages){
        messages.forEach(message => {
            activeChatEl.append(createActiveChatMessageEl(message));
        });
    }
}

function setActiveChatElTitle(title){
    activeChatEl.querySelector('.title').textContent = title;
}


function globalClickListener(event){

    const clickedDropdownEl = event.target.closest('.dropdown');
    activeDropdownEl = toggleDropdowns(clickedDropdownEl, activeDropdownEl);

    const actionEl = event.target.closest('[data-action]');
    if(actionEl){
        actionMap[actionEl.dataset.action](actionEl);
    }

}

function inputBoxEnterListener(event){
    if (event.key === 'Enter' && !event.shiftKey){
        event.preventDefault();
        sendMessage();
    }
}

function toggleDropdowns(clickedDropdownEl, activeDropdownEl){
    /*
    lehetseges esetek:
    * null - null -> nem kell tenni semmit
    * null - activeDropdownEl -> toggleOff activeDropdownEl, activeDropdownEl = null
    * clickedDropdownEl - null -> toggleOn clickedDropdownEl, activeDropdownEl = clickedDropdownEl
    * clickedDropdownEl == activeDropdownEl -> toggleOff activeDropdownEl, activeDropdownEl = null
    * clickedDropdownEl != activeDropdownEl -> toggleOff activeDropdownEl, toggleOn clickedDropdownEl, activeDropdownEl = clickedDropdownEl
    */

    // null - null
    if(!clickedDropdownEl && !activeDropdownEl){
        return activeDropdownEl;
    }

    // null - activeDropdownEl OR clickedDropdownEl == activeDropdownEl
    if(!clickedDropdownEl && activeDropdownEl || clickedDropdownEl === activeDropdownEl){
        toggleDropdownOff(activeDropdownEl);
        activeDropdownEl = null;
        return activeDropdownEl;
    }

    // clickedDropdownEl - null
    if(!activeDropdownEl){
        toggleDropdownOn(clickedDropdownEl);
        activeDropdownEl = clickedDropdownEl;
        return activeDropdownEl;
    }

    // clickedDropdownEl != activeDropdownEl
    toggleDropdownOff(activeDropdownEl);
    toggleDropdownOn(clickedDropdownEl);
    activeDropdownEl = clickedDropdownEl;
    return activeDropdownEl;
}

function toggleDropdownOff(dropdownEl){
    dropdownEl.querySelector('.options').classList.remove('open');
}

function toggleDropdownOn(dropdownEl){
    dropdownEl.querySelector('.options').classList.add('open');
}

function selectModel(actionEl){

    const selectedModelEl = modelDropdownEl.querySelector('.selected');

    // swap id, name and logo_file
    [actionEl.id, selectedModelEl.id] = [selectedModelEl.id, actionEl.id];
    [actionEl.querySelector('span').textContent, selectedModelEl.querySelector('span').textContent] = [selectedModelEl.querySelector('span').textContent, actionEl.querySelector('span').textContent];
    [actionEl.querySelector('img').src, selectedModelEl.querySelector('img').src] = [selectedModelEl.querySelector('img').src, actionEl.querySelector('img').src];

    sortModelOptionEls();

}

function sortModelOptionEls(){
    // sort model options by id
    const modelOptionEls = Array.from(modelDropdownEl.querySelector('.options').children);
    modelOptionEls.sort((el1, el2) => fromModelElId(el1.id) - fromModelElId(el2.id));
    modelDropdownEl.querySelector('.options').innerHTML = '';
    modelDropdownEl.querySelector('.options').append(...modelOptionEls);
}


async function addChat() {

    const title = window.prompt('Enter chat title', 'Untitled');
    if(!title || title.trim() === ''){
        return;
    }

    const chatId = await client.addChat(title.trim());

    chatsEl.append(createChatEl(new Chat(chatId, title)));
    setActiveChatEl(title);
    activeChatId = chatId;
}


async function loadChat(actionEl){

    const chatEl = actionEl.closest('.chat');

    if(fromChatElId(chatEl.id) === activeChatId){
        return;
    }

    const chatWithMessages = await client.loadChat(fromChatElId(chatEl.id));

    setActiveChatEl(chatWithMessages.title, chatWithMessages.messages);
    if(chatWithMessages.messages.length > 0 && chatWithMessages.messages[chatWithMessages.messages.length - 1].role === 'user'){
        activeChatEl.append(createActiveChatMessageEl(new Message('assistant', WAITING_FOR_LLM_RESPONSE_MESSAGE)));
    }
    activeChatEl.scrollTop = activeChatEl.scrollHeight;

    activeChatId = chatWithMessages.id_;
}


function renameChat(actionEl){

    const chatEl = actionEl.closest('.chat');

    const newTitle = window.prompt('Enter new chat title', chatEl.querySelector('.title').textContent);
    if(!newTitle || newTitle.trim() === ''){
        return;
    }

    client.renameChat(fromChatElId(chatEl.id), newTitle);
    chatEl.querySelector('.title').textContent = newTitle;
    if(fromChatElId(chatEl.id) === activeChatId){
        setActiveChatElTitle(newTitle);
    }
}

function deleteChat(actionEl){
    const chatEl = actionEl.closest('.chat');

    const confirmed = window.confirm(`Delete chat "${chatEl.querySelector('.title').textContent}"?`);
    if(!confirmed){
        return;
    }

    client.deleteChat(fromChatElId(chatEl.id));
    chatsEl.removeChild(chatEl);
    if(fromChatElId(chatEl.id) === activeChatId){
        setActiveChatEl(ACTIVE_CHAT_EL_DEFAULT_TITLE);
        activeChatId = -1;
    }
}


async function sendMessage() {

    const input = inputBoxEl.value;
    inputBoxEl.value = '';

    if(input.trim() === '' || activeChatId === -1){
        return;
    }

    const userMessage = new Message('user', input.trim());
    const selectedModelName = modelDropdownEl.querySelector('.selected span').textContent;

    activeChatEl.append(createActiveChatMessageEl(userMessage));
    activeChatEl.append(createActiveChatMessageEl(new Message('assistant', WAITING_FOR_LLM_RESPONSE_MESSAGE)));
    activeChatEl.scrollTop = activeChatEl.scrollHeight;

    const chatIdBefore = activeChatId;
    const assistantMessage = await client.addMessage(activeChatId, selectedModelName, userMessage);
    // if the user has already switched chat
    if(chatIdBefore !== activeChatId){
        return;
    }

    const lastActiveChatMessageEl = activeChatEl.children[activeChatEl.children.length - 1];
    assert(lastActiveChatMessageEl.className === 'message assistant' && lastActiveChatMessageEl.textContent === WAITING_FOR_LLM_RESPONSE_MESSAGE);
    activeChatEl.removeChild(lastActiveChatMessageEl);
    activeChatEl.append(createActiveChatMessageEl(assistantMessage));
    // ide nem kell scroll, mert az LLM uzenetet az elejetol szeretnenk olvasni

}

