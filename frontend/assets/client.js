
import {Chat, ChatTitleWrapper, ChatWithMessages, Message, LLM} from "./models.js";

export class Client{

    constructor(api_base_url) {
        this.API_BASE_URL = api_base_url;
    }


    async loadChats(){
        const response = await fetch(`${this.API_BASE_URL}/chats`);
        const responseJson = await response.json();
        const chats = [];
        responseJson.forEach(obj => {
            const chat = new Chat(obj.id_, obj.title);
            chats.push(chat);
        });
        return chats;
    }


    async loadChat(chat_id){
        const response = await fetch(`${this.API_BASE_URL}/chats/${chat_id}`);
        const responseJson = await response.json();
        const messages = [];
        responseJson.messages.forEach(obj => {
            const message = new Message(obj.role, obj.content);
            messages.push(message);
        })
        return new ChatWithMessages(responseJson.id_, responseJson.title, messages);
    }


    async addChat(chat_title){
        const chatTitleWrapper = new ChatTitleWrapper(chat_title);
        const response = await fetch(`${this.API_BASE_URL}/chats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatTitleWrapper)
        });
        const responseJson = await response.json();
        return responseJson.chat_id;
    }


    async deleteChat(chat_id){
        const response = await fetch(`${this.API_BASE_URL}/chats/${chat_id}`, {
            method: 'DELETE'
        });
    }


    async renameChat(chat_id, chat_title){
        const chatTitleWrapper = new ChatTitleWrapper(chat_title);
        const response = await fetch(`${this.API_BASE_URL}/chats/${chat_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatTitleWrapper)
        });
    }


    // sends userMessage to backend + returns assistantMessage from backend
    async addMessage(chat_id, llm_name, message){
        // llm_name = llm_name.replace(' ', '_');
        const response = await fetch(`${this.API_BASE_URL}/messages?chat_id=${chat_id}&llm_name=${llm_name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });
        const responseJson = await response.json();
        return new Message(responseJson.role, responseJson.content);
    }


    async loadLLMs(){
        const response = await fetch(`${this.API_BASE_URL}/llms`);
        const responseJson = await response.json();
        const llms = [];
        responseJson.forEach(obj => {
            const llm = new LLM(obj.name, obj.logo_file);
            llms.push(llm);
        });
        return llms;
    }

}
