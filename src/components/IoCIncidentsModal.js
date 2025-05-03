import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./IoCIncidentsModal.css";

const IoCIncidentsModal = ({ ioc, onClose }) => {
  const [incidentes, setIncidentes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncidentes = async () => {
      try {
        const response = await api.get(`/iocs/${ioc.id}/incidentes`);
        setIncidentes(response.data);
      } catch (err) {
        console.error("Error al cargar los incidentes:", err);
        setError("No se pudieron cargar los incidentes relacionados.");
      }
    };

    fetchIncidentes();
  }, [ioc]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Incidentes relacionados con: {ioc.tipo} - {ioc.valor}</h3>
        {error && <p className="error">{error}</p>}
        <ul className="incident-list">
          {incidentes.length > 0 ? (
            incidentes.map((inc) => (
              <li key={inc.id}>
                <strong>{inc.nombre}</strong> – {inc.descripcion}
              </li>
            ))
          ) : (
            <li>No hay incidentes relacionados.</li>
          )}
        </ul>
        <button className="close-button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default IoCIncidentsModal;
