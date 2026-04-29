
# OPENROUTER API GUI

A web application to chat with LLMs available at OpenRouter using an API key.

## Requirements

* Python version 3.12
* Node Package Manager (npm) version 11.12.1
* [OpenRouter](https://openrouter.ai) API key


## Installation

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


## Changing LLMs

You can extend/update the list of LLMs available in the app by editing the backend/llms.jsonl file.
