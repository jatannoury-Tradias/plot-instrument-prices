import datetime
from fastapi.responses import FileResponse
from fastapi import FastAPI,Query,WebSocket
from datetime import date
import websockets
import logging
import config
import json
from fastapi.middleware.cors import CORSMiddleware
import pickle
import time
import redis
counter=0


def log(message):

    global initial_time
    client = redis.Redis(host='localhost', port=6379, db=1)
    all_warnings=[]
    all_errors=[]
    all_criticals=[]
    client.set("warnings", pickle.dumps(all_warnings))
    client.set("errors", pickle.dumps(all_errors))
    client.set("criticals", pickle.dumps(all_criticals))
    log_file_name = f'Errors.log'
    handler = logging.handlers.TimedRotatingFileHandler(log_file_name, when="m", interval=1)
    logging_level = logging.INFO
    try:
        formatter = logging.Formatter('%(asctime)s %(name)s %(levelname)s %(message)s')

        handler.setFormatter(formatter)
        logger = logging.getLogger()
        # or pass string to give it a name
        logger.addHandler(handler)
        logger.setLevel(logging_level)
        time.sleep(0.1)
        if logging.root.level==logging.WARNING:
            logger.warning( message)
            all_warnings.append(str(message))
            client.set("warnings",pickle.dumps(all_warnings))
        if logging.root.level==logging.ERROR:
            logger.error( message)
            all_errors.append(str(message))
            client.set("errors",pickle.dumps(all_errors))
        if logging.root.level==logging.CRITICAL:
            logger.critical( message)
            all_criticals.append(str(message))
            client.set("criticals",pickle.dumps(all_criticals))
        print(pickle.loads(client.get("warnings")))
    except KeyboardInterrupt:
        # handle Ctrl-C
        logging.warning("Cancelled by user")
    except Exception as ex:
        # handle unexpected script errors
        logging.exception("Unhandled error\n{}".format(ex))
        raise
    finally:
        logging.shutdown()

MY_TOKEN = config.token
ENVIRONMENT = 'otcapp-UAT'
PROTOCOL = 'wss'


URI = f"{PROTOCOL}://{ENVIRONMENT}.tradias.de/otc/ws"

buying_prices={"BTCEUR":"","ETHEUR":"","BNBEUR":"","XRPEUR":"","ADAEUR":"","SOLEUR":"","DOGEEUR":"","DOTEUR":""}
redis_buying_prices={"BTCEUR":{"data":[],"timestamp":[]},"ETHEUR":{"data":[],"timestamp":[]},"BNBEUR":{"data":[],"timestamp":[]},"XRPEUR":{"data":[],"timestamp":[]},"ADAEUR":{"data":[],"timestamp":[]},"SOLEUR":{"data":[],"timestamp":[]},"DOGEEUR":{"data":[],"timestamp":[]},"DOTEUR":{"data":[],"timestamp":[]}}
selling_prices={"BTCEUR":"","ETHEUR":"","BNBEUR":"","XRPEUR":"","ADAEUR":"","SOLEUR":"","DOGEEUR":"","DOTEUR":""}
timestamp=""
headers = {
    "x-token-id": MY_TOKEN
}
origins = [
    "http://localhost",
    "http://localhost:3000",
]
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.websocket("/")
async def root(websocket:WebSocket):
    await websocket.accept()
    global curr_day
    async with websockets.connet(uri=URI, extra_headers=headers, ping_interval=None) as websocket1:
        for i in buying_prices:
            await websocket1.send(json.dumps({
                "type": "subscribe",
                "channelname": "prices",
                "instrument": i,
                "heartbeat": True
            }))

        while True:
            message = json.loads(await websocket1.recv())
            await websocket.send_text(json.dumps([buying_prices, timestamp]))
            log(message)
@app.get("/fetchFromRedis")
async def read_item(interval: str | None):
    client = redis.Redis(host='localhost', port=6379, db=0)
    time_difference=int(interval[:len(interval)-3])*60
    copy=pickle.loads(client.get("redis_buying_prices"))
    timestamps=[]
    data=[]
    for instrument in redis_buying_prices:
        for i in range(len(copy[instrument]["timestamp"])):
            val = copy[instrument]["timestamp"][i]
            val = datetime.datetime.strptime(val, "%Y-%m-%dT%H:%M:%S.%f%z").replace(tzinfo=None) + datetime.timedelta(
                hours=3)
            difference = datetime.datetime.now() - val
            if difference.total_seconds() < time_difference:
                timestamps.append(copy[instrument]["timestamp"][i])
                data.append(copy[instrument]["data"][i])
        copy[instrument]['data']=data
        copy[instrument]['timestamp']=timestamps
        data=[]
        timestamps=[]
    return copy



@app.websocket("/getData")
async def getData(websocket:WebSocket):
        client = redis.Redis(host='localhost', port=6379, db=0)
        data_storage=[]
        global curr_day,redis_buying_prices
        client.set("redis_buying_prices",pickle.dumps(redis_buying_prices))
        await websocket.accept()
        curr_day = str(date.today())
        async with websockets.connect(uri=URI, extra_headers=headers, ping_interval=None) as websocket1:
            for i in buying_prices:
                await websocket1.send(json.dumps({
                    "type": "subscribe",
                    "channelname": "prices",
                    "instrument": i,
                    "heartbeat": True
                }))
            client.set("database", pickle.dumps([]))
            while True:
                message = json.loads(await websocket1.recv())

                if 'levels' in message:
                    data_storage.append(message)
                    client.set("data_storage", pickle.dumps(data_storage))
                    buying_prices[message["instrument"]]=message["levels"]['buy'][len(message["levels"]['buy']) - 1]['price']
                    selling_prices[message["instrument"]]=message["levels"]['sell'][len(message["levels"]['buy']) - 1]['price']
                    redis_buying_prices=pickle.loads(client.get("redis_buying_prices"))
                    redis_buying_prices[message["instrument"]]['data'].append(message["levels"]['buy'][len(message["levels"]['buy']) - 1]['price'])
                    redis_buying_prices[message["instrument"]]['timestamp'].append(message['timestamp'])
                    client.set("redis_buying_prices", pickle.dumps(redis_buying_prices))
                    await websocket.send_text(json.dumps([buying_prices,message['timestamp']]))



@app.get("/upload")
def upload():
    global counter
    client = redis.Redis(host='localhost', port=6379, db=0)
    data = client.get("data_storage")
    data=pickle.loads(data)
    with open(f"responseData{counter}.txt","a") as f:
        for i in data:
            new_date_format=datetime.datetime.strptime(i['timestamp'], "%Y-%m-%dT%H:%M:%S.%f%z").replace(tzinfo=None) + datetime.timedelta(
                hours=3)
            if (datetime.datetime.now()-new_date_format<datetime.timedelta(days=7)):
                new_date_format=str(new_date_format)
                f.write(new_date_format+": "+str(i)+" \n")
            else:
                counter+=1
                break
    try:
        return FileResponse(f"responseData{counter}.txt", media_type="application/x-rar-compressed")
    except:
        return FileResponse(f"responseData{counter}.txt", media_type="application/x-rar-compressed")

