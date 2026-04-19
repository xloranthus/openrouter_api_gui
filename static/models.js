
export {Message, Chat, ChatWithMessages, ChatTitleWrapper, LLMs, Prompt};

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
    constructor(id_, title) {
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

class ChatWithMessages extends Chat{
    constructor(id_, title, messages) {
        super(id_, title);

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


const LLMs = [
    'Claude Sonnet 4.6',
    'Claude Opus 4.6',
    'DeepSeek V3.2',
    'Gemini 3 Flash Preview',
    'MiMo-V2-Pro',
    'MiniMax M2.5',
    'MiniMax M2.7',
    'Grok 4.1 Fast',
    'GPT-5.4'
];

class Prompt{
    constructor(model, messages) {
        if(!model in LLMs){
            throw TypeError(`Invalid model ${model}.`);
        }
        this.model = model;

        validateMessages(messages);
        if(!messages){
            throw TypeError('Prompt is missing message.');
        }
        if(messages[messages.length - 1].role !== 'user'){
            throw TypeError('This model does not support assistant message prefill. The conversation must end with a user message.');
        }
        this.messages = messages;
    }
}

