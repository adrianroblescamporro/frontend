import React from "react";
import "./IoCDetailModal.css";

const IoCDetailModal = ({ ioc, onClose }) => {
  if (!ioc) return null;

  return (
    <div className="ioc-modal-overlay">
      <div className="ioc-modal-container">
        <h3>Detalle del IoC</h3>
        <ul>
          <li><strong>Tipo:</strong> {ioc.tipo}</li>
          <li><strong>Valor:</strong> {ioc.valor}</li>
          <li><strong>Cliente:</strong> {ioc.cliente}</li>
          <li><strong>Categoría:</strong> {ioc.categoria}</li>
          <li><strong>Tecnología:</strong> {ioc.tecnologia_deteccion}</li>
          <li><strong>Criticidad:</strong> {ioc.criticidad}</li>
          <li><strong>Usuario:</strong> {ioc.usuario_registro}</li>
          <li><strong>Fecha detección:</strong> {new Date(ioc.fecha_creacion).toLocaleString()}</li>
        </ul>
        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default IoCDetailModal;
