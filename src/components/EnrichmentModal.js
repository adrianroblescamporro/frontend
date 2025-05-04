import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./EnrichmentModal.css";

const EnrichmentModal = ({ ioc, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchEnrichment = async () => {
      try {
        const response = await api.get(`/ioc/enrich/${ioc}`);
        setResults(response.data);
      } catch (err) {
        console.error("Error al enriquecer el IoC:", err);
        setResults([{ source: "Error", error: "No se pudo obtener resultados" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichment();
  }, [ioc]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Enriquecimiento para: <span>{ioc}</span></h2>
        <button className="modal-close" onClick={onClose}>✖</button>

        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          results.map((result, idx) => (
            <div key={idx} className="result-block">
              <h3>{result.source}</h3>
              {result.error ? (
                <p className="error-text">⚠️ {result.error}</p>
              ) : (
                <>
                  <p><strong>Resumen:</strong> {result.summary}</p>
                  <details>
                    <summary>Ver detalles</summary>
                    <pre>{JSON.stringify(result.full, null, 2)}</pre>
                  </details>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnrichmentModal;
