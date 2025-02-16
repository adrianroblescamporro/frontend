import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useMemo } from "react";
import "./IoCChart.css";

// Función para agrupar IoCs por fecha
const agruparIoCsPorFecha = (iocList) => {
  const conteoPorFecha = iocList.reduce((acc, ioc) => {
    const fecha = new Date(ioc.fecha_creacion).toISOString().split("T")[0]; // YYYY-MM-DD
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(conteoPorFecha).map(([fecha, cantidad]) => ({ fecha, cantidad }));
};

const IoCChart = ({ iocList }) => {
  // Memoizar los datos para mejorar el rendimiento
  const data = useMemo(() => agruparIoCsPorFecha(iocList), [iocList]);

  return (
    <div className="chart-container">
      <h3>IoCs añadidos por día</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" stroke="#FFFFFF" />
          <YAxis stroke="#FFFFFF"/>
          <Tooltip />
          <Bar dataKey="cantidad" fill="#FFFFFF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IoCChart;
