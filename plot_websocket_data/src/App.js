import { useEffect, useRef, useState } from "react";
import ChartPlot from "./Chart";
import './App.css';

export const App = () => {
  const [x, setX] = useState({});
  const [y,setY]=useState([]);
  const [display,setDisplay]=useState("0");
  console.log(display)
  const ws = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/getData");

    socket.onopen = () => {
      console.log("opened");
    };
    socket.onclose=(event)=>{
      console.log("closed");
    }

    socket.onmessage = (event) => {
      console.log("got message", event);
      let data=JSON.parse(event.data)
      setX(data[0]);
      setY(data[1]);
      console.log(x)
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
      <select onChange={(e)=>setDisplay(e.target.value)} className="dropdown">
        <option value="0">8x1</option>
        <option value="1">4x2</option>
        <option value="2">2x4</option>
      </select>
    </div>
    
    </div>
    <div className={display==="0"?"display0":"box1"}>
   {x.length!==0?<ChartPlot x={y} y={x["BTCEUR"]} instrument={"BTCEUR"} color={"#008000"}/>:<></>}
   {x.length!==0 && (display==="1"||display==="2")?<ChartPlot x={y} y={x["ETHEUR"]} instrument={"ETHEUR"} color={"#ffff00"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={y} y={x["XRPEUR"]} instrument={"XRPEUR"} color={"#0000ff"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={y} y={x["DOGEEUR"]} instrument={"DOGEEUR"} color={"#800080"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box2'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["ETHEUR"]} instrument={"ETHEUR"} color={"#ffff00"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={y} y={x["XRPEUR"]} instrument={"XRPEUR"} color={"#0000ff"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={y} y={x["DOGEEUR"]} instrument={"DOGEEUR"} color={"#800080"}/>:<></>}
   {x.length!==0 &&(display==="2")?<ChartPlot x={y} y={x["BNBEUR"]} instrument={"BNBEUR"} color={"#000000"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={y} y={x["SOLEUR"]} instrument={"SOLEUR"} color={"#ffa500"}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={y} y={x["ADAEUR"]} instrument={"ADAEUR"} color={'#663300'}/>:<></>}
   {x.length!==0 && (display==="2")?<ChartPlot x={y} y={x["DOTEUR"]} instrument={"DOTEUR"} color={"#ff0000"}/>:<></>}
 </div>
 <div className={display==="0"?"display0":'box3'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["XRPEUR"]} instrument={"XRPEUR"} color={"#0000ff"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={y} y={x["BNBEUR"]} instrument={"BNBEUR"} color={"#000000"}/>:<></>}
   {x.length!==0 && (display==="1")?<ChartPlot x={y} y={x["SOLEUR"]} instrument={"SOLEUR"} color={"#ffa500"}/>:<></>}
 </div>
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["DOGEEUR"]} instrument={"DOGEEUR"} color={"#800080"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["BNBEUR"]} instrument={"BNBEUR"} color={"#000000"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["SOLEUR"]} instrument={"SOLEUR"} color={"#ffa500"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["ADAEUR"]} instrument={"ADAEUR"} color={"#663300"}/>:<></>}
 </div> 
 <div className={display==="0"?"display0":'box4'}>
   {x.length!==0 && (display==="0")?<ChartPlot x={y} y={x["DOTEUR"]} instrument={"DOTEUR"} color={"#ff0000"}/>:<></>}
 </div> 



    </div> 
  );
};
export default App;


