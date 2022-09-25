import { useEffect, useRef, useState } from "react";
import ChartPlot from "./Chart";
import './App.css';
import { time } from "highcharts";
import { fetchFromRedis } from "./http";


let time_filter="0"

export const App = () => {
  const [x, setX] = useState({"BTCEUR":{data:[],timestamp:[]},"ETHEUR":{data:[],timestamp:[]},"BNBEUR":{data:[],timestamp:[]},"XRPEUR":{data:[],timestamp:[]},"ADAEUR":{data:[],timestamp:[]},"SOLEUR":{data:[],timestamp:[]},"DOGEEUR":{data:[],timestamp:[]},"DOTEUR":{data:[],timestamp:[]}});
  const [display,setDisplay]=useState("0");
  const [timeDisplay,setTimeDisplay]=useState("0");
  const ws = useRef(null);

  
  useEffect(()=>{
    time_filter=timeDisplay
    // setX({"BTCEUR":{data:[],timestamp:[]},"ETHEUR":{data:[],timestamp:[]},"BNBEUR":{data:[],timestamp:[]},"XRPEUR":{data:[],timestamp:[]},"ADAEUR":{data:[],timestamp:[]},"SOLEUR":{data:[],timestamp:[]},"DOGEEUR":{data:[],timestamp:[]},"DOTEUR":{data:[],timestamp:[]}});
    if (timeDisplay!=="0"){
      async function getData(){
        const response=await fetchFromRedis(time_filter)
        for (let i in response){
          for (let j in response[i]['timestamp']){
            response[i]['timestamp'][j]=new Date(response[i]['timestamp'][j]).toString().slice(0,24)
          }
        }
        setX(response)
      }getData()
    }
  },[timeDisplay])

  
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/getData");

    socket.onopen = () => {
      console.log("opened");
    };
    socket.onclose=(event)=>{
      console.log("closed");
    }

    socket.onmessage = (event) => {
      // console.log(time_filter)
    
      let data=JSON.parse(event.data)
      let newX={...x}
      for (let i in data[0]){
        if (time_filter==="0"){
          newX[i]["data"].push(data[0][i])
          newX[i]["timestamp"].push((new Date(data[1])).toString().slice(0,24))
          setX(newX)
        }
        if (newX[i]["data"].length>=300 ){
          
          newX[i]["data"]=newX[i]["data"].slice(150)
          newX[i]["timestamp"]=newX[i]["timestamp"].slice(150)
        }
      // console.log(x["BTCEUR"]['data'].length)
      // console.log(x["BTCEUR"]['timestamp'].length)
      // console.log(storage[i].length)
      // console.log(storage["BTCEUR"]['data'].length)
    }
      };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="mainWrapper">
    <div className="box5">
    <p>Display</p>
    <div>
    <select onChange={(e)=>setDisplay(e.target.value)} className="dropdown">
        <option value="0">8x1</option>
        <option value="1">4x2</option>
        <option value="2">2x4</option>
      </select>
      <select onChange={(e)=>setTimeDisplay(e.target.value)} className="dropdown">
        <option value="0">Live Data</option>
        <option value="1min">1min</option>
        <option value="5min">5min</option>
        <option value="10min">10min</option>
      </select>
    </div>
    
    </div>
    <div className={display==="0"?"display0":"box1"}>
  
   {x.length!==0?<ChartPlot x={x["BTCEUR"]['timestamp']} y={x["BTCEUR"]['data']} instrument={"BTCEUR"} color={"#008000"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="1"||display==="2")?<ChartPlot x={x["ETHEUR"]['timestamp']} y={x["ETHEUR"]['data']} instrument={"ETHEUR"} color={"#ffff00"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["XRPEUR"]['timestamp']} y={x["XRPEUR"]['data']} instrument={"XRPEUR"} color={"#0000ff"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["DOGEEUR"]['timestamp']} y={x["DOGEEUR"]['data']} instrument={"DOGEEUR"} color={"#800080"} timeDisplay={timeDisplay}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box2'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["ETHEUR"]['timestamp']} y={x["ETHEUR"]['data']} instrument={"ETHEUR"} color={"#ffff00"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["XRPEUR"]['timestamp']} y={x["XRPEUR"]['data']} instrument={"XRPEUR"} color={"#0000ff"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["DOGEEUR"]['timestamp']} y={x["DOGEEUR"]['data']} instrument={"DOGEEUR"} color={"#800080"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 &&(display==="2")?<ChartPlot x={x["BNBEUR"]['timestamp']} y={x["BNBEUR"]['data']} instrument={"BNBEUR"} color={"#000000"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["SOLEUR"]['timestamp']} y={x["SOLEUR"]['data']} instrument={"SOLEUR"} color={"#ffa500"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["ADAEUR"]['timestamp']} y={x["ADAEUR"]['data']} instrument={"ADAEUR"} color={'#663300'} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["DOTEUR"]['timestamp']} y={x["DOTEUR"]['data']} instrument={"DOTEUR"} color={"#ff0000"} timeDisplay={timeDisplay}/>:<></>}
 </div>
 <div className={display==="0"?"display0":'box3'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["XRPEUR"]['timestamp']} y={x["XRPEUR"]['data']} instrument={"XRPEUR"} color={"#0000ff"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["BNBEUR"]['timestamp']} y={x["BNBEUR"]['data']} instrument={"BNBEUR"} color={"#000000"} timeDisplay={timeDisplay}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["SOLEUR"]['timestamp']} y={x["SOLEUR"]['data']} instrument={"SOLEUR"} color={"#ffa500"} timeDisplay={timeDisplay}/>:<></>}
 </div>
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["DOGEEUR"]['timestamp']} y={x["DOGEEUR"]['data']} instrument={"DOGEEUR"} color={"#800080"} timeDisplay={timeDisplay}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["BNBEUR"]['timestamp']} y={x["BNBEUR"]['data']} instrument={"BNBEUR"} color={"#000000"} timeDisplay={timeDisplay}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["SOLEUR"]['timestamp']} y={x["SOLEUR"]['data']} instrument={"SOLEUR"} color={"#ffa500"} timeDisplay={timeDisplay}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["ADAEUR"]['timestamp']} y={x["ADAEUR"]['data']} instrument={"ADAEUR"} color={"#663300"} timeDisplay={timeDisplay}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["DOTEUR"]['timestamp']} y={x["DOTEUR"]['data']} instrument={"DOTEUR"} color={"#ff0000"} timeDisplay={timeDisplay}/>:<></>}
 </div> 



    </div> 
  );
};
export default App;


