import React, { useState } from "react";
//import { api } from "../api"; 
import ReactPaginate from "react-paginate";
import IncidentModal from "./IncidentModal";
import IncidentEdit from "./IncidentEdit";
import IoCDetailModal from "./IoCDetailModal";

const IncidentList = ({ incidentes, loading, fetchIoCs, fetchIncidentes }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const offset = currentPage * itemsPerPage;
  const currentItems = incidentes.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(incidentes.length / itemsPerPage);

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedIoC, setSelectedIoC] = useState(null);

  if (loading) {
    return <div>Cargando...</div>;
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="incident-list">
      <h2>Lista de Incidentes</h2>
      {currentItems.map((inc) => (
        <div key={inc.id} className="incident-card">
          <h3>{inc.nombre}</h3>
          <p>{inc.descripcion}</p>
          <p>{inc.cliente}</p>
          <p>Fecha: {new Date(inc.fecha_incidente).toLocaleString()}</p>
          <strong>IoCs relacionados:</strong>
          <ul>
            {inc.iocs.map((ioc) => (
              <li key={ioc.id} onClick={() => setSelectedIoC(ioc)} style={{ cursor: "pointer", color: "#007bff" }}>
                {ioc.tipo} - {ioc.valor}
              </li>
            ))}
          </ul>
          <button onClick={() => setEditId(inc.id)}>Editar IoCs</button>
          {editId && (
            <IncidentEdit
              incidenteId={editId}
              onClose={() => setEditId(null)}
              onUpdated={() => {
                setEditId(null);
                fetchIoCs();
                fetchIncidentes();
              }}
            />
          )}
        </div>
      ))}

      <ReactPaginate
        previousLabel={"← Anterior"}
        nextLabel={"Siguiente →"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />

      <button className="add-incident-button" onClick={() => setIsIncidentModalOpen(true)}>
        Crear Incidente
      </button>

      {isIncidentModalOpen && (
        <IncidentModal
          onClose={() => setIsIncidentModalOpen(false)}
          onCreated={() => {
            fetchIoCs();
            fetchIncidentes();
            setIsIncidentModalOpen(false);
          }}
        />
      )}

      {selectedIoC && (
        <IoCDetailModal ioc={selectedIoC} onClose={() => setSelectedIoC(null)} />
      )}
    </div>
  );
};

export default IncidentList;
