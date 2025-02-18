import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";

const IoCChart = () => {
  const [chartData, setChartData] = useState([]);

  // Función para obtener datos actualizados
  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/iocs"); // Ajusta la URL de tu API
      const iocs = response.data;

      // Obtener los últimos 7 días en orden cronológico
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i)); // Asegura orden correcto
        return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
      });

      // Contar IoCs por día y asegurar que los días sin registros tengan un valor de 0
      const counts = last7Days.map(date => ({
        date,
        count: iocs.filter(ioc => ioc.fecha_creacion.startsWith(date)).length,
      }));

      setChartData(counts);
    } catch (error) {
      console.error("Error cargando datos para la gráfica:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Cargar datos al montar el componente

    // Actualizar datos cada 10 segundos
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval); // Limpiar intervalo al desmontar el componente
  }, []);

  return (
    <div className="chart-container">
      <h3>IoCs Registrados</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#333"
            tickFormatter={(date) => date.split("-").reverse().join("/")} // Formato DD/MM
          />
          <YAxis
            stroke="#333"
            allowDecimals={false} // Solo valores enteros
            tickFormatter={(num) => `${num}`} // Formato número entero
          />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#00AEEF" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IoCChart;
