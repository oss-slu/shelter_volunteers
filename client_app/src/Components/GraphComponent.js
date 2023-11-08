import React, { useState, useEffect } from 'react';
import { Chart as ChartJS,
   CategoryScale, 
   LinearScale, 
   BarElement, 
   Title, 
   Tooltip, 
   Legend, } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );
export const options = { 
  responsive: true, 
  plugins: { 
    title: { display: true, text: 'Chart.js Bar Chart', }, 
  }, 
  scales: {
    y: {
      beginAtZero: true,
      stepSize: 1, // Set the step/increment for the Y-axis
    },
  },
}; 
function GraphComponent() {
   const [chartData, setChartData] = useState({
     labels: [],
     datasets: [ { 
      label: 'Shift Counts', 
      data: [], backgroundColor: 'rgba(75,192,192,0.2)', 
      borderColor: 'rgba(75,192,192,1)', 
      borderWidth: 1 } ] }); 
      useEffect(() => { 
        const fetchData = async () => { 
          const data = [ {
             "start_time": 1696352400000, 
             "end_time": 1696359600000, 
             "count": 1 }, 
             { "start_time": 1696359600000, 
             "end_time": 1696366800000, 
             "count": 1 } ]; 
            if(data.length > 0) {
              const labels = data.map(item => {

                const stTime = new Date(item.start_time).toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'});
                
                const endTime = new Date(item.end_time).toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'});
              
                return stTime + ' - ' + endTime; 
              });
             const counts = data.map(item => item.count); 
             setChartData({ labels, datasets: [ {
               label: 'Shift Counts', 
               data: counts } ] });
               } 
          }; 
        fetchData(); }, []); 
        return ( 
        <div> {chartData.labels.length > 0 && 
        <Bar 
          data={chartData} 
          options={{
            scales: {
              xAxes: [{ 
                type: 'time' 
              }] 
            } 
          }} 
        /> } 
        </div> 
        ); } 
export default GraphComponent;