
# set host and port
host=localhost
port=55001

# start server
uvicorn app:app --host $host --port $port
