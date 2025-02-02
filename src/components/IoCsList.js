import React, { useEffect, useState } from "react";
import { api } from "../api";

const IoCsList = () => {
  const [iocs, setIocs] = useState([]);

  useEffect(() => {
    api.get("/iocs")
      .then(response => {
        console.log("Datos recibidos:", response.data);  // <-- Agrega esto para depurar
        setIocs(response.data);
      })
      .catch(error => console.error("Error cargando IoCs:", error));
  }, []);

  return (
    <div>
      <h2>Lista de IoCs</h2>
      <ul>
      {iocs.length > 0 ? (
    iocs.map(ioc => (
      <li key={ioc.id}>{ioc.tipo}: {ioc.valor} - {ioc.estado}</li>
    ))
  ) : (
    <p>No hay IoCs disponibles</p>
  )}
      </ul>
    </div>
  );
};

export default IoCsList;
