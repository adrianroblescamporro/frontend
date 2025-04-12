import React, { useState } from "react";
import { api } from "../api";
import "./EDLGenerator.css"
import { tipoOpciones, clienteOpciones } from "../constants";

const EDLGenerator = () => {
  const [tipo, setTipo] = useState("");
  const [cliente, setCliente] = useState("");

  const handleDownloadEDL = async () => {
    try {
      const response = await api.get("/report/edl", {
        params: { tipo: tipo, cliente },
        responseType: "blob",
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `edl_${tipo}_${cliente}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el EDL:", error);
    }
  };

  return (
    <div className="edl">
      <div className="edl-group">
      <label>Tipo de IoC:</label>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="" disabled>Seleccione...</option>
        {tipoOpciones.map((opcion) => (
          <option key={opcion} value={opcion}>{opcion}</option>
        ))}
      </select>
      </div>

      <div className="edl-group">
      <label>Cliente:</label>
      <select value={cliente} onChange={(e) => setCliente(e.target.value)}>
        <option value="" disabled>Seleccione...</option>
        {clienteOpciones.map((opcion) => (
          <option key={opcion} value={opcion}>{opcion}</option>
        ))}
      </select>
      </div>

      <button onClick={handleDownloadEDL}>Descargar EDL</button>
    </div>
  );
};

export default EDLGenerator;
