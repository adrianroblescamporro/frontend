import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";


const IoCChart = ({chartData}) => {

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
