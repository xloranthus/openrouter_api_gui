
export {Message, Chat, ChatWithMessages, ChatTitleWrapper, LLM};

class Message{
    constructor(role, content) {
        if(!role in ['user', 'assistant']){
            throw TypeError(`Invalid role ${role}. Role must be either user or assistant.`);
        }
        this.role = role;

        if(content.trim() === ''){
            throw TypeError('Message is missing content.');
        }
        this.content = content;
    }
}


class Chat {
    constructor(id_, title, last_modified) {
        if(typeof id_ !== 'number'){
            throw TypeError(`Invalid chat ID ${id_}. Chat ID must be an integer.`);
        }
        if(id_ < 0){
            throw TypeError(`Invalid chat ID ${id_}. Chat ID must be a non-negative integer.`);
        }
        this.id_ = id_;

        if(title.trim() === ''){
            throw TypeError('Chat is missing title.');
        }
        this.title = title;

        if(last_modified.trim() === ''){
            throw TypeError('Chat is missing last modified datetime.');
        }
        this.last_modified = last_modified;
    }
}

function validateMessages(messages){
    if(!Array.isArray(messages)){
        throw TypeError('Messages must be an array.');
    }
    messages.forEach(message => {
        if(!message instanceof Message){
            throw TypeError('Each message must be an instance of the Message class.');
        }
    });
}

class ChatWithMessages{
    constructor(id_, title, messages) {
        if(typeof id_ !== 'number'){
            throw TypeError(`Invalid chat ID ${id_}. Chat ID must be an integer.`);
        }
        if(id_ < 0){
            throw TypeError(`Invalid chat ID ${id_}. Chat ID must be a non-negative integer.`);
        }
        this.id_ = id_;

        if(title.trim() === ''){
            throw TypeError('Chat is missing title.');
        }
        this.title = title;

        validateMessages(messages);
        this.messages = messages;
    }
}

class ChatTitleWrapper{
    constructor(chat_title) {
        if(chat_title.trim() === ''){
            throw TypeError('Chat is missing title.');
        }
        this.chat_title = chat_title;
    }
}

class LLM{
    constructor(name, logo_file) {
        if(name.trim() === ''){
            throw TypeError('LLM is missing name.');
        }
        this.name = name;

        if(logo_file.trim() === ''){
            throw TypeError('LLM is missing logo file.');
        }
        this.logo_file = logo_file;
    }
}
