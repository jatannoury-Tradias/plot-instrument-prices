import React, { useEffect, useState } from 'react'
import {Line } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin)
const ChartPlot = ({x,y,instrument,color}) => {
  // console.log(x,y)
  const [state,setState] = useState({labels:x,datasets:[{label:instrument,data:y,borderColor:color}]})
  useEffect(()=>{
    setState({labels:x,datasets:[{label:instrument,data:y,borderColor:color}]})
  },[x,y,instrument])
  return (
    <Line data={state} options={{spanGaps: true,color:color, 
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

    }} />
  
)}

export default ChartPlot