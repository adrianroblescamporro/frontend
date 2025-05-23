import React, { useState } from "react";
import { api } from "../api";
import "./ReportGenerator.css";
import { clienteOpciones } from "../constants";

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientes, setCliente] = useState("");

  const handleDownloadReport = async () => {
    try {
      const response = await api.get("/generate_report", {
        params: { start_date: startDate, end_date: endDate, clientes },
        responseType: "blob", // Recibir el PDF como blob
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_iocs.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
    }
  };

  return (
    <div className="report">
      <div className="report-group">
      <label>Fecha de inicio:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      </div>

      <div className="report-group">
      <label>Fecha de fin:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      </div>

      <div className="report-group">
      <label>Cliente:</label>
      <select value={clientes} onChange={(e) => setCliente(e.target.value)}>
        <option value="">Todos</option>
        {clienteOpciones.map((opcion) => (
          <option key={opcion} value={opcion}>{opcion}</option>
        ))}
      </select>
      </div>

      <button onClick={handleDownloadReport}>Descargar Reporte</button>
    </div>
  );
};

export default ReportGenerator;
