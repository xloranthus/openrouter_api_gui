
# set host and port
# if you change host/port here, then you also need to change the corresponding HOST/PORT in /static/script.js
host=localhost
port=55001

# start server
cd backend
uvicorn main:app --host $host --port $port
