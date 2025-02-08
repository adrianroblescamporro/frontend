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
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Cliente</th>
            <th>Categoría</th>
            <th>Incidente</th>
            <th>Criticidad</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {iocs.map((ioc) => (
            <tr key={ioc.id}>
              <td>{ioc.tipo}</td>
              <td>{ioc.valor}</td>
              <td>{ioc.cliente}</td>
              <td>{ioc.categoria}</td>
              <td>{ioc.pertenece_a_incidente ? "Sí" : "No"}</td>
              <td>{ioc.criticidad}</td>
              <td>{ioc.usuario_registro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

};

export default IoCsList;
