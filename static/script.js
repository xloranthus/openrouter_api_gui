
// TODO delete last message

import {Message, Chat, ChatWithMessages, ChatTitleWrapper, LLM, Prompt} from '/static/models.js';
import {Client} from '/static/client.js';

const PORT = 55001;
const API_BASE_URL = `http://localhost:${PORT}/api`;

const client = new Client(API_BASE_URL);

const ACTIVE_CHAT_EL_DEFAULT_TITLE = 'Create a new or load an existing chat to begin.';

// globalis valtozok
const modelDropdownEl = document.getElementById('model-dropdown');
const chatsEl = document.getElementById('chats');
const activeChatEl = document.getElementById('active-chat');
const inputBoxEl = document.getElementById('inputBox');
let activeDropdownEl = null;
let activeChat = null;


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

function createModelEl(llm, id){

    const divEl = document.createElement('div');
    divEl.id = `model-${id}`;
    divEl.className = 'model';

        const imgEl = document.createElement('img');
        imgEl.className = 'model-logo';
        imgEl.src = `/img/${llm.logo_file}`;

        const spanEl = document.createElement('span');
        spanEl.textContent = llm.name;

    divEl.append(imgEl, spanEl);

    return divEl;
}

async function initChatsEl(){

    const chats = await client.loadChats();

    chats.forEach(chat => {
        const chatEl = createChatEl(chat);
        chatsEl.append(chatEl);
    });
}

function createChatEl(chat){

    const chatEl = document.createElement('div');
    chatEl.id = `chat-${chat.id_}`;
    chatEl.className = 'chat';

        const titleEl = document.createElement('span');
        titleEl.className = 'title';
        titleEl.dataset.action = 'load-chat';
        titleEl.textContent = chat.title;

        const chatDropdownEl = document.createElement('div');
        chatDropdownEl.className = 'dropdown';

            const buttonEl = document.createElement('button');
            buttonEl.className = 'selected';
            buttonEl.textContent = '...';

            const optionsEl = document.createElement('div');
            optionsEl.className = 'options';

                const renameChatEl = document.createElement('div');
                renameChatEl.className = 'option';
                renameChatEl.dataset.action = 'rename-chat';
                renameChatEl.textContent = 'Rename';

                const deleteChatEl = document.createElement('div');
                deleteChatEl.className = 'option';
                deleteChatEl.dataset.action = 'delete-chat';
                deleteChatEl.textContent = 'Delete';

            optionsEl.append(renameChatEl, deleteChatEl);

        chatDropdownEl.append(buttonEl, optionsEl);

    chatEl.append(titleEl, chatDropdownEl);

    return chatEl;
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

function createActiveChatTitleEl(title){

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = title;

    return titleEl;
}

function createActiveChatMessageEl(message){

    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.classList.add(message.role);
    messageEl.textContent = message.content;

    return messageEl;
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
    modelOptionEls.sort((el1, el2) => el1.id.replace('model-', '') - el2.id.replace('model-', ''));
    modelDropdownEl.querySelector('.options').innerHTML = '';
    modelDropdownEl.querySelector('.options').append(...modelOptionEls);
}


async function addChat() {

    const title = window.prompt('Enter chat title', 'Untitled');
    if(!title || title.trim() === ''){
        return;
    }

    const chat_id = await client.addChat(title.trim());

    chatsEl.append(createChatEl(new Chat(chat_id, title)));
    setActiveChatEl(title);
    activeChat = new ChatWithMessages(chat_id, title, []);
}


async function loadChat(actionEl){

    const chatEl = actionEl.closest('.chat');

    if(activeChat && Number(chatEl.id.replace('chat-', '')) === activeChat.id_){
        return;
    }

    const chatWithMessages = await client.loadChat(Number(chatEl.id.replace('chat-', '')));

    setActiveChatEl(chatWithMessages.title, chatWithMessages.messages);
    activeChat = chatWithMessages;
}


function renameChat(actionEl){

    const chatEl = actionEl.closest('.chat');

    const newTitle = window.prompt('Enter new chat title', chatEl.querySelector('.title').textContent);
    if(!newTitle || newTitle.trim() === ''){
        return;
    }

    client.renameChat(Number(chatEl.id.replace('chat-', '')), newTitle);
    chatEl.querySelector('.title').textContent = newTitle;
    if(activeChat && Number(chatEl.id.replace('chat-', '')) === activeChat.id_){
        setActiveChatElTitle(newTitle);
        activeChat.title = newTitle;
    }
}

function deleteChat(actionEl){
    const chatEl = actionEl.closest('.chat');

    const confirmed = window.confirm(`Delete chat "${chatEl.querySelector('.title').textContent}"?`);
    if(!confirmed){
        return;
    }

    client.deleteChat(Number(chatEl.id.replace('chat-', '')));
    chatsEl.removeChild(chatEl);
    if(activeChat && Number(chatEl.id.replace('chat-', '')) === activeChat.id_){
        setActiveChatEl(ACTIVE_CHAT_EL_DEFAULT_TITLE);
        activeChat = null;
    }
}


async function sendMessage() {

    const input = inputBoxEl.value;
    inputBoxEl.value = '';

    if(input.trim() === '' || !activeChat){
        return;
    }

    const userMessage = new Message('user', input.trim());
    await client.addMessage(activeChat.id_, userMessage);
    activeChatEl.append(createActiveChatMessageEl(userMessage));
    activeChatEl.scrollTop = activeChatEl.scrollHeight;
    activeChat.messages.push(userMessage);

    const selectedModelName = modelDropdownEl.querySelector('.selected span').textContent;
    const assistantMessage = await client.promptLLM(new Prompt(selectedModelName, activeChat.messages));
    await client.addMessage(activeChat.id_, assistantMessage);
    activeChatEl.append(createActiveChatMessageEl(assistantMessage));
    activeChatEl.scrollTop = activeChatEl.scrollHeight;
    activeChat.messages.push(assistantMessage);

}



/*

init -> loadLLMs alapjan feltolti model-dropdownt,
loadChats alapjan feltolti chats-et,
active-chat-title-be beirja hogy "Create new or load an existing chat to begin"
globalClickListener-t felveszi document.addEventListener-el.

loadChat/addChat -> activeChatID-t tartsuk szamon h tudjuk h hova kell konyvelni az uziket,
ha pont az aktiv chatet toroljuk, akkor active-chat-title visszaallitasa alapallapotba,
ha pont az aktiv chatet rename-eljuk, akkor active-chat-title-t is at kell irni

globalClickListener -> .closest()-el megnezi a .dropdown-t.
toggleDropdowns() fuggvenynek atadja a .closest() eredmenyet es az activeDropdownEl-t.
vegul pedig lejatssza az event.target actionMap[data-action] fuggvenyet,
ami lehet: selectModel, addChat, loadChat, renameChat, deleteChat, sendMessage

toggleDropdowns() fv mukodesehez lehetseges esetek:
* null - null -> nem kell tenni semmit
* null - activeDropdownEl -> toggleOff activeDropdownEl, activeDropdownEl = null
* clickedDropdownEl - null -> toggleOn clickedDropdownEl, activeDropdownEl = clickedDropdownEl
* clickedDropdownEl == activeDropdownEl -> toggleOff activeDropdownEl, activeDropdownEl = null
* clickedDropdownEl != activeDropdownEl -> toggleOff activeDropdownEl, toggleOn clickedDropdownEl, activeDropdownEl = clickedDropdownEl


extra funkcio lehetne:
chat-ek sorrendjet dateLastModified szerint DESC-ben tartani,
tehat uj chat a lista elejere kerul,
renamed chat a lista elejere kerul,
sentMessage chat a lista elejere kerul
es ezt szinkronizalni kell backend-el is.

 */





