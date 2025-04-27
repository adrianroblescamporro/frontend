import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./AddToIncidentModal.css";

const AddToIncidentModal = ({ iocId, onClose, onUpdated }) => {
  const [incidentOptions, setIncidentOptions] = useState([]);
  const [selectedIncidentes, setSelectedIncidentes] = useState([]);
  const [initialIncidentes, setInitialIncidentes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener todos los incidentes
        const { data: allIncidentes } = await api.get("/incidentes");

        // Obtener incidentes en los que ya está asociado el IoC
        const { data: associatedIncidentes } = await api.get(`/iocs/${iocId}/incidentes`);

        const associatedIds = associatedIncidentes.map((inc) => inc.id);

        setIncidentOptions(allIncidentes);
        setSelectedIncidentes(associatedIds);
        setInitialIncidentes(associatedIds);
      } catch (err) {
        console.error("Error al cargar incidentes:", err);
        setError("No se pudieron cargar los incidentes.");
      }
    };

    fetchData();
  }, [iocId]);

  const handleChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
    setSelectedIncidentes(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const toAdd = selectedIncidentes.filter((id) => !initialIncidentes.includes(id));
      const toRemove = initialIncidentes.filter((id) => !selectedIncidentes.includes(id));

      // Asociar nuevos
      for (const incidenteId of toAdd) {
        await api.post(`/incidentes/${incidenteId}/add_ioc/${iocId}`);
      }

      // Eliminar de los que ha quitado
      for (const incidenteId of toRemove) {
        await api.delete(`/incidentes/${incidenteId}/remove_ioc/${iocId}`);
      }

      setSuccess("Asociaciones actualizadas correctamente.");
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Error al actualizar asociaciones de IoC:", err);
      setError("Error al actualizar las asociaciones.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Asociar IoC a Incidente</h3>
        <form onSubmit={handleSubmit}>
          <label>Seleccionar Incidentes:</label>
          <select
            multiple
            value={selectedIncidentes}
            onChange={handleChange}
            className="incident-select-multiple"
          >
            {incidentOptions.map((incidente) => (
              <option key={incidente.id} value={incidente.id}>
                {incidente.nombre} - {incidente.cliente}
              </option>
            ))}
          </select>

          <button type="submit">Actualizar</button>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
        <button className="modal-cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AddToIncidentModal;
