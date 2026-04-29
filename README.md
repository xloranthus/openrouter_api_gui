
# OPENROUTER API GUI

A web application to chat with LLMs available at OpenRouter using an API key.

## Why choose OpenRouter API GUI over other AI chat apps? 🤔

* Access the newest, most performant LLMs 📈🦾🤖 without any limits or restrictions as opposed to free accounts
* An API key is cheaper 🤑💰 than a monthly subscription
* Store all your chats in one place 📚
* Choose from hundreds of different LLMs - if a model couldn't get your problem solved, you can switch to another one even mid-chat 🔄 

## Requirements 🛠

* Python version 3.12
* Node Package Manager (npm) version 11.12.1
* [OpenRouter](https://openrouter.ai) API key 🔑


## Installation ⚙️

```commandline
git clone https://github.com/xloranthus/openrouter_api_gui

cd openrouter_api_gui/backend

python3.12 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

echo OPENROUTER_API_KEY=\"<YOUR_OPENROUTER_API_KEY>\" > .env

cd ../frontend

npm i

npm run build
```


## Usage

Start server
```commandline
cd backend

uvicorn main:app --host <host> --port <port>
```

or

```commandline
sh run.sh
```

You can test the server at `<host>:<port>/docs`.


## Changing LLMs 🤖

You can extend/update the list of LLMs available in the app by editing the backend/llms.jsonl file.
