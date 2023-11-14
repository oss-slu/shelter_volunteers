import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export const options = {
  responsive: true,
  plugins: {
    title: { display: true, text: "Chart.js Bar Chart" },
  },
  scales: {
    y: {
      beginAtZero: true,
      stepSize: 1,
    },
  },
};

function GraphComponent(shifts) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Shift Counts",
        data: [],
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  });
  useEffect(() => {
    const fetchData = async () => {
      const data = shifts;
      if (data.length > 0) {
        const labels = data.map((item) => {
          const stTime = new Date(item.start_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          });

          const endTime = new Date(item.end_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          });

          return stTime + " - " + endTime;
        });
        const counts = data.map((item) => item.count);
        const highest = Math.max(...counts);
        let colors = [];
        for (let i = 0; i < data.length; i++) {
          let color = "rgba(255,255,0,1)";
          let count = counts[i];
          if (count === highest) color = "rgba(255,0,0,1)";
          else if (count < highest / 2) color = "rgba(0,255,0,1)";
          colors.push(color);
        }
        setChartData({
          labels,
          datasets: [
            {
              label: "Shifts",
              data: counts,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 1,
            },
          ],
        });
      }
    };
    fetchData();
  }, [shifts]);
  return (
    <div>
      {" "}
      {chartData.labels.length > 0 && (
        <Bar
          data={chartData}
          options={{
            scales: {
              xAxes: [
                {
                  type: "time",
                },
              ],
              y: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
          }}
        />
      )}
    </div>
  );
}
export default GraphComponent;
