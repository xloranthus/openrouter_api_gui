
export {createModelEl, createChatEl, toModelElId, fromModelElId, toChatElId, fromChatElId, createActiveChatTitleEl, createActiveChatMessageEl, assert};

function createModelEl(llm, id){

    const divEl = document.createElement('div');
    divEl.id = toModelElId(id);
    divEl.className = 'model';

        const imgEl = document.createElement('img');
        imgEl.className = 'model-logo';
        imgEl.src = `assets/img/${llm.logo_file}`;

        const spanEl = document.createElement('span');
        spanEl.textContent = llm.name;

    divEl.append(imgEl, spanEl);

    return divEl;
}


function createChatEl(chat){

    const chatEl = document.createElement('div');
    chatEl.id = toChatElId(chat.id_);
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




function toModelElId(id){
    return `model-${id}`;
}

function fromModelElId(modelElId){
    return Number(modelElId.replace('model-', ''));
}

function toChatElId(id){
    return `chat-${id}`;
}

function fromChatElId(chatElId){
    return Number(chatElId.replace('chat-', ''));
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

function assert(condition, message){
    if(!condition){
        throw new Error(message || 'Assertion failed.');
    }
}

