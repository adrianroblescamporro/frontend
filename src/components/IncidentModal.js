import React from "react";
import "./IncidentModal.css";
import IncidentForm from "./IncidentForm";

const IncidentModal = ({ onClose, onCreated }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Nuevo Incidente</h2>
        <IncidentForm onCreated={onCreated} />
        <button onClick={onClose} className="modal-cancel">Cancelar</button>
      </div>
    </div>
  );
};

export default IncidentModal;
