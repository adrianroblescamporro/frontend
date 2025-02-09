import { useState, useEffect } from "react";
import { api } from "../api"; // Importar la instancia de api
import "../App.css";

function IoCManagement() {
  const [iocs, setIocs] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "",
    valor: "",
    cliente: "",
    categoria: "",
    pertenece_a_incidente: false,
    criticidad: "",
    usuario_registro: "",
  });

  useEffect(() => {
    fetchIoCs();
  }, []);

  const fetchIoCs = async () => {
    try {
      const response = await api.get("/iocs");
      setIocs(response.data);
    } catch (error) {
      console.error("Error cargando IoCs:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/iocs", formData);
      fetchIoCs();
      setFormData({
        tipo: "",
        valor: "",
        cliente: "",
        categoria: "",
        pertenece_a_incidente: false,
        criticidad: "",
        usuario_registro: "",
      });
    } catch (error) {
      console.error("Error al registrar el IoC:", error);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Registrar nuevo IoC</h2>
        <form onSubmit={handleSubmit}>
          <label>Tipo:</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="IP">IP</option>
            <option value="Dominio">Dominio</option>
            <option value="URL">URL</option>
            <option value="Hash">Hash</option>
          </select>

          <label>Valor:</label>
          <input type="text" name="valor" value={formData.valor} onChange={handleChange} required />

          <label>Cliente:</label>
          <select name="cliente" value={formData.cliente} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="Empresa A">Empresa A</option>
            <option value="Empresa B">Empresa B</option>
            <option value="Empresa C">Empresa C</option>
            <option value="Empresa D">Empresa D</option>
          </select>

          <label>Categoría:</label>
          <select name="categoria" value={formData.categoria} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="Phishing">Phishing</option>
            <option value="Ransomware">Ransomware</option>
            <option value="Malware">Malware</option>
          </select>

          <label>Pertenece a un incidente:</label>
          <input type="checkbox" name="pertenece_a_incidente" checked={formData.pertenece_a_incidente} onChange={handleChange} />

          <label>Criticidad:</label>
          <select name="criticidad" value={formData.criticidad} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>

          <label>Usuario que registra:</label>
          <input type="text" name="usuario_registro" value={formData.usuario_registro} onChange={handleChange} required />

          <button type="submit">Registrar IoC</button>
        </form>
      </div>

      <div className="ioc-list">
        <h2>Lista de IoCs</h2>
        {iocs.length > 0 ? (
          iocs.map((ioc) => (
            <div key={ioc.id} className="ioc-item">
              <strong>{ioc.tipo} - {ioc.valor}</strong> - {ioc.cliente} - {ioc.categoria} ({ioc.criticidad}) -- {ioc.fecha_creacion}
            </div>
          ))
        ) : (
          <p>No hay IoCs registrados.</p>
        )}
      </div>
    </div>
  );
}

export default IoCManagement;

