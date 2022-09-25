import React, { useEffect, useState } from 'react'
import {Line } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import "./App.css"
Chart.register(zoomPlugin)
Chart.register(annotationPlugin)

const ChartPlot = ({x,y,instrument,color,timeDisplay}) => {
  const [state,setState] = useState({labels:x,datasets:[{label:instrument,data:y,borderColor:color}]})
  const [appliedPlugins,setappliedPlugins]=useState({})
  useEffect(()=>{
    setState({labels:x,datasets:[{label:instrument,data:y,borderColor:color}]})
  },[x,instrument])

  useEffect(()=>{
    debugger
    console.log(appliedPlugins)
    if (timeDisplay==="0"){
      setappliedPlugins({})
    }
    if (timeDisplay!=="0"){
      setappliedPlugins({
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
          
          
            mode: 'x',
          }
        }
      })
    }
    
    console.log(appliedPlugins)
  },[timeDisplay])

  return (
    <div className='chartWrapper'>
    <span className='priceWrapper'><p className='latestPrice'>{instrument} : {y[y.length-1]}€</p></span>
    <Line data={state} options={{spanGaps: true,color:color, 
      animation: {
        duration: 0
    },
      
    xAxes: [{
      ticks: {
          autoSkip: false,
      },
  }],
  
    scales:{
      x:{
        ticks:{
          maxTicksLimit:15
        }
      }
    },
    plugins: {...appliedPlugins,
      autocolors: false,
      
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yMin: y[y.length-1],
          yMax: y[y.length-1],
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
        }
      }
    },
    }
  }

    } />
  

    </div>
    )}

export default ChartPlot