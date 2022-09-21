from fastapi import FastAPI,Query,WebSocket
from datetime import date
import csv
import websockets
import logging
import json
from fastapi.middleware.cors import CORSMiddleware
import os

MY_TOKEN = ""
ENVIRONMENT = 'otcapp-UAT'
PROTOCOL = 'wss'


URI = f"{PROTOCOL}://{ENVIRONMENT}.tradias.de/otc/ws"

buying_prices={"BTCEUR":[],"ETHEUR":[],"BNBEUR":[],"XRPEUR":[],"ADAEUR":[],"SOLEUR":[],"DOGEEUR":[],"DOTEUR":[]}
selling_prices={"BTCEUR":[],"ETHEUR":[],"BNBEUR":[],"XRPEUR":[],"ADAEUR":[],"SOLEUR":[],"DOGEEUR":[],"DOTEUR":[]}
# plot_location={"BTCEUR":[0,0],"ETHEUR":[0,1],"BNBEUR":[1,0],"XRPEUR":[1,1],"ADAEUR":[2,0],"SOLEUR":[2,1],"DOGEEUR":[3,0],"DOTEUR":[3,1]}
colors={"BTCEUR":'red',"ETHEUR":'blue',"BNBEUR":'yellow',"XRPEUR":'green',"ADAEUR":'orange',"SOLEUR":'brown',"DOGEEUR":'black',"DOTEUR":'purple'}
timestamp=[]
counter = 0

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

@app.get("/")
async def root():
    return {"message":"Hello World"}

@app.get("/items/")
async def read_item(limit: str | None =Query(default=None, max_length=50)):
    return {"item_id":limit}

@app.websocket("/getData")
async def getData(websocket:WebSocket):
        # print("HEY")
        await websocket.accept()
        global curr_day,counter
        curr_day = str(date.today())

        """
        Function prints the received (& formatted) messages from the Tradias websocket,
        when subscribing to the prices instrument for a specific instrument.
        :param instrument: Instrument for which the prices are streamed
        :return:
        """

        async with websockets.connect(uri=URI, extra_headers=headers, ping_interval=None) as websocket1:

            for i in buying_prices:
                await websocket1.send(json.dumps({
                    "type": "subscribe",
                    "channelname": "prices",
                    "instrument": i,
                    "heartbeat": True
                }))
            coins_response = []
            while True:

                print("counter=",counter)
                if str(date.today()) != curr_day:

                    curr_day = str(date.today())
                    counter += 1
                message = json.loads(await websocket1.recv())
                if 'levels' in message:
                    if message["instrument"] not in coins_response:
                        coins_response.append(message["instrument"])
                        buying_prices[message["instrument"]].append(
                            message["levels"]['buy'][len(message["levels"]['buy']) - 1]['price'])
                        selling_prices[message["instrument"]].append(
                            message["levels"]['sell'][len(message["levels"]['buy']) - 1]['price'])
                    print(coins_response)
                    if len(coins_response) == 8:
                        current_time = message['timestamp'].split("T")[1][:len(message['timestamp'].split("T")[1]) - 1]
                        timestamp.append(str(int(current_time[:2]) + 3) + current_time[2:8])
                        coins_response=[]
                        with open(f'file{counter}.txt', 'a',newline='') as file:
                            writer = csv.writer(file, lineterminator='\n')
                            if os.stat(f"file{counter}.txt").st_size == 0:
                                headerList=["timestamp","BTCEUR","BNBEUR","ETHEUR","DOGEEUR","XRPEUR","DOTEUR","ADAEUR","SOLEUR"]
                                writer.writerow(headerList)
                                print(buying_prices["BTCEUR"])
                            writer.writerow([timestamp[-1], buying_prices["BTCEUR"][-1], buying_prices["BNBEUR"][-1],
                                             buying_prices["ETHEUR"][-1], buying_prices["DOGEEUR"][-1],
                                             buying_prices["XRPEUR"][-1], buying_prices["DOTEUR"][-1],
                                             buying_prices["ADAEUR"][-1], buying_prices["SOLEUR"][-1]])

                        await websocket.send_text(json.dumps([buying_prices,timestamp]))
                else:
                    print(message)
                    with open(f'file{counter}.txt', 'a', newline='') as file:
                        writer = csv.writer(file, lineterminator='\n')
                        if os.stat(f"file{counter}.txt").st_size == 0:
                                headerList=["timestamp","BTCEUR","BNBEUR","ETHEUR","DOGEEUR","XRPEUR","DOTEUR","ADAEUR","SOLEUR"]
                                writer.writerow(headerList)
                        writer.writerow([message])


