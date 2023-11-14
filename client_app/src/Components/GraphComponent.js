import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const GraphComponent = (props) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Shift Counts",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const options = {
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  useEffect(() => {
    const data = props.shifts;
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
  }, [props.shifts]);
  return (
    <div className="text-center">
      {props.shifts && props.shifts.length > 0 && (
        <h4>{format(new Date(props.shifts[0].start_time), "M/dd/yy")}</h4>
      )}
      {chartData.labels.length > 0 && (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};
export default GraphComponent;
