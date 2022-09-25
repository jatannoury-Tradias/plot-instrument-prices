import datetime

from fastapi import FastAPI,Query,WebSocket
from datetime import date
import csv
import websockets
import logging
import config
import json
from fastapi.middleware.cors import CORSMiddleware
import pickle
import time
import redis


def log(message):

    log_file_name = 'TimedRotatingFileHandler.log'
    logging_level = logging.INFO
    try:

        # set TimedRotatingFileHandler for root
        formatter = logging.Formatter('%(asctime)s %(name)s %(levelname)s %(message)s')
        # use very short interval for this example, typical 'when' would be 'midnight' and no explicit interval
        handler = logging.handlers.TimedRotatingFileHandler(log_file_name, when="M", interval=30, backupCount=30)
        handler.setFormatter(formatter)
        logger = logging.getLogger()  # or pass string to give it a name
        logger.addHandler(handler)
        logger.setLevel(logging_level)
        time.sleep(0.1)
        if logging.root.level==logging.ERROR:
            logger.error( "\x1b[31;20m"+message+"\x1b[0m")
        if logging.root.level==logging.CRITICAL:
            logger.critical( message)
    except KeyboardInterrupt:
        # handle Ctrl-C
        logging.warning("Cancelled by user")
    except Exception as ex:
        # handle unexpected script errors
        logging.exception("Unhandled error\n{}".format(ex))
        raise
    finally:
        # perform an orderly shutdown by flushing and closing all handlers; called at application exit and no further use of the logging system should be made after this call.
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
    global curr_day, counter
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
async def read_item(interval: str | None =Query(default=None, max_length=50)):
    client = redis.Redis(host='localhost', port=6379, db=0)
    if interval=="ALL":
        return pickle.loads(client.get("database"))
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
        database=[]
        global curr_day,counter,redis_buying_prices
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
            while True:
                message = json.loads(await websocket1.recv())
                client.set("database",pickle.dumps(database))
                if 'levels' in message:
                    database.append([message['timestamp'],message])
                    buying_prices[message["instrument"]]=message["levels"]['buy'][len(message["levels"]['buy']) - 1]['price']
                    selling_prices[message["instrument"]]=message["levels"]['sell'][len(message["levels"]['buy']) - 1]['price']
                    redis_buying_prices=pickle.loads(client.get("redis_buying_prices"))
                    redis_buying_prices[message["instrument"]]['data'].append(message["levels"]['buy'][len(message["levels"]['buy']) - 1]['price'])
                    redis_buying_prices[message["instrument"]]['timestamp'].append(message['timestamp'])
                    client.set("redis_buying_prices", pickle.dumps(redis_buying_prices))
                    await websocket.send_text(json.dumps([buying_prices,message['timestamp']]))
                log(message)






