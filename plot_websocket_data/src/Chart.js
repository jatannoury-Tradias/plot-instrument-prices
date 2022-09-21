import React from 'react'
import {Line } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin)
const ChartPlot = ({x,y,instrument,color}) => {
  return (
    <Line data={{labels:x,datasets:[{label:instrument,data:y,borderColor:color}]}} options={{spanGaps: true,color:color, pan: {
      enabled: true,
      mode: "x",
      speed: 10,
      threshold: 10
    },
    zoom: {
      enabled: true,
      drag: false,
      mode: "xy",
     speed: 0.01,
     // sensitivity: 0.1,
      limits: {
        max: 10,
        min: 0.5
      }}}} />
  
)}

export default ChartPlot