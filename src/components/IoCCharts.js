import React from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import "./IoCCharts.css";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const IoCCharts = ({ iocs }) => {
  const colorPalette = ["#007BFF", "#339CFF", "#66BFFF", "#99D6FF", "#CCEFFF"];

  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});

  const createChartData = (groupedData, label) => {
    const labels = Object.keys(groupedData);
    const counts = Object.values(groupedData);
    return {
      labels,
      datasets: [
        {
          label,
          data: counts,
          backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
          borderColor: "#ffffff",
          borderWidth: 1,
        },
      ],
    };
  };

  const tipoData = createChartData(groupBy(iocs, "tipo"), "IoCs por Tipo");
  const tecnologiaData = createChartData(groupBy(iocs, "tecnologia_deteccion"), "IoCs por Tecnología");
  const categoriaData = createChartData(groupBy(iocs, "categoria"), "IoCs por Categoría");

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="charts-container">
      <div className="chart-box">
        <Bar data={tipoData} options={options} />
      </div>
      <div className="chart-box">
        <Pie data={tecnologiaData} options={options} />
      </div>
      <div className="chart-box">
        <Doughnut data={categoriaData} options={options} />
      </div>
    </div>
  );
};

export default IoCCharts;
