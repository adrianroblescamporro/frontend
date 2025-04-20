import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./IncidentEdit.css";

const IncidentEdit = ({ incidenteId, onClose, onUpdated }) => {
  const [iocOptions, setIocOptions] = useState([]);
  const [selectedIoCs, setSelectedIoCs] = useState([]);
  const [initialIoCs, setInitialIoCs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchIoCs = async () => {
      try {
        const [allIoCs, incidentIoCs] = await Promise.all([
          api.get("/iocs"),
          api.get(`/incidentes/${incidenteId}/iocs`),
        ]);

        setIocOptions(allIoCs.data);
        const iocIds = incidentIoCs.data.map((ioc) => ioc.id);
        setSelectedIoCs(iocIds);
        setInitialIoCs(iocIds);
      } catch (err) {
        console.error("Error al cargar IoCs:", err);
        setError("No se pudieron cargar los IoCs.");
      }
    };

    fetchIoCs();
  }, [incidenteId]);

  const handleChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
    setSelectedIoCs(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const toAdd = selectedIoCs.filter((id) => !initialIoCs.includes(id));
      const toRemove = initialIoCs.filter((id) => !selectedIoCs.includes(id));

      for (const iocId of toAdd) {
        await api.post(`/incidentes/${incidenteId}/add_ioc/${iocId}`);
      }

      for (const iocId of toRemove) {
        await api.delete(`/incidentes/${incidenteId}/remove_ioc/${iocId}`);
      }

      setSuccess("Asociaciones actualizadas correctamente.");
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      setError("Error al actualizar asociaciones de IoCs.");
    }
  };

  return (
    <div className="incident-edit-container">
      <h3>Editar IoCs del Incidente</h3>
      <form onSubmit={handleSubmit} className="incident-edit-form">
        <label>IoCs relacionados:</label>
        <select multiple value={selectedIoCs} onChange={handleChange} className="incident-edit-select">
          {iocOptions.map((ioc) => (
            <option key={ioc.id} value={ioc.id}>
              {ioc.tipo} - {ioc.valor}
            </option>
          ))}
        </select>

        <button type="submit">Actualizar</button>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
      <button className="modal-cancel" onClick={onClose}>Cancelar</button>
    </div>
  );
};

export default IncidentEdit;
