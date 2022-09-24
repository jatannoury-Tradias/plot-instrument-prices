import { useEffect, useRef, useState } from "react";
import ChartPlot from "./Chart";
import './App.css';

export const App = () => {
  const [x, setX] = useState({"BTCEUR":{data:[],timestamp:[]},"ETHEUR":{data:[],timestamp:[]},"BNBEUR":{data:[],timestamp:[]},"XRPEUR":{data:[],timestamp:[]},"ADAEUR":{data:[],timestamp:[]},"SOLEUR":{data:[],timestamp:[]},"DOGEEUR":{data:[],timestamp:[]},"DOTEUR":{data:[],timestamp:[]}});
  const [y,setY]=useState([]);
  const [display,setDisplay]=useState("0");
  const ws = useRef(null);
  const [storage,setStorage]=useState({"BTCEUR":{data:[],timestamp:[]},"ETHEUR":{data:[],timestamp:[]},"BNBEUR":{data:[],timestamp:[]},"XRPEUR":{data:[],timestamp:[]},"ADAEUR":{data:[],timestamp:[]},"SOLEUR":{data:[],timestamp:[]},"DOGEEUR":{data:[],timestamp:[]},"DOTEUR":{data:[],timestamp:[]}})

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/getData");

    socket.onopen = () => {
      console.log("opened");
    };
    socket.onclose=(event)=>{
      console.log("closed");
    }

    socket.onmessage = (event) => {
      let data=JSON.parse(event.data)
      // console.log("got message", data);
      let newX={...x}
      for (let i in data[0]){
        newX[i]["data"].push(data[0][i])
        newX[i]["timestamp"].push(data[1])
        if (newX[i]["data"].length>=100){
          let storageCopy={...storage}
          storageCopy[i]["data"].push(newX[i]["data"].pop())
          storageCopy[i]["timestamp"].push(newX[i]["timestamp"].pop())
          newX=newX[i]["timestamp"].pop()
          newX=newX[i]["data"].pop()
          setStorage(storageCopy)
        }
          
      
      setX(newX)
      console.log(x["BTCEUR"]['data'].length)
      console.log(x["BTCEUR"]['timestamp'].length)
      // console.log(storage["BTCEUR"]['data'].length)
    }};

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
      <select onChange={(e)=>setDisplay(e.target.value)} className="dropdown">
        <option value="0">8x1</option>
        <option value="1">4x2</option>
        <option value="2">2x4</option>
      </select>
    </div>
    
    </div>
    <div className={display==="0"?"display0":"box1"}>
   {x.length!==0?<ChartPlot x={x["BTCEUR"]['timestamp']} y={x["BTCEUR"]['data']} instrument={"BTCEUR"} color={"#008000"}/>:<></>}
   {x.length!==0 && (display==="1"||display==="2")?<ChartPlot x={x["ETHEUR"]['timestamp']} y={x["ETHEUR"]['data']} instrument={"ETHEUR"} color={"#ffff00"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["XRPEUR"]['timestamp']} y={x["XRPEUR"]['data']} instrument={"XRPEUR"} color={"#0000ff"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["DOGEEUR"]['timestamp']} y={x["DOGEEUR"]['data']} instrument={"DOGEEUR"} color={"#800080"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box2'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["ETHEUR"]['timestamp']} y={x["ETHEUR"]['data']} instrument={"ETHEUR"} color={"#ffff00"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["XRPEUR"]['timestamp']} y={x["XRPEUR"]['data']} instrument={"XRPEUR"} color={"#0000ff"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["DOGEEUR"]['timestamp']} y={x["DOGEEUR"]['data']} instrument={"DOGEEUR"} color={"#800080"}/>:<></>}
   {x.length!==0 &&(display==="2")?<ChartPlot x={x["BNBEUR"]['timestamp']} y={x["BNBEUR"]['data']} instrument={"BNBEUR"} color={"#000000"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["SOLEUR"]['timestamp']} y={x["SOLEUR"]['data']} instrument={"SOLEUR"} color={"#ffa500"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["ADAEUR"]['timestamp']} y={x["ADAEUR"]['data']} instrument={"ADAEUR"} color={'#663300'}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={x["DOTEUR"]['timestamp']} y={x["DOTEUR"]['data']} instrument={"DOTEUR"} color={"#ff0000"}/>:<></>}
 </div>
 <div className={display==="0"?"display0":'box3'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["XRPEUR"]['timestamp']} y={x["XRPEUR"]['data']} instrument={"XRPEUR"} color={"#0000ff"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["BNBEUR"]['timestamp']} y={x["BNBEUR"]['data']} instrument={"BNBEUR"} color={"#000000"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={x["SOLEUR"]['timestamp']} y={x["SOLEUR"]['data']} instrument={"SOLEUR"} color={"#ffa500"}/>:<></>}
 </div>
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["DOGEEUR"]['timestamp']} y={x["DOGEEUR"]['data']} instrument={"DOGEEUR"} color={"#800080"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["BNBEUR"]['timestamp']} y={x["BNBEUR"]['data']} instrument={"BNBEUR"} color={"#000000"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["SOLEUR"]['timestamp']} y={x["SOLEUR"]['data']} instrument={"SOLEUR"} color={"#ffa500"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["ADAEUR"]['timestamp']} y={x["ADAEUR"]['data']} instrument={"ADAEUR"} color={"#663300"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={x["DOTEUR"]['timestamp']} y={x["DOTEUR"]['data']} instrument={"DOTEUR"} color={"#ff0000"}/>:<></>}
 </div> 



    </div> 
  );
};
export default App;


