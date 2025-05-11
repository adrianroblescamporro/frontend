import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./IncidentForm.css";
import { jwtDecode } from "jwt-decode";
import { clienteOpciones } from "../constants"; 

// Función para obtener el usuario del token
  const getUserDataFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decodifica el JWT
        return [decoded.sub, decoded.enterprise]; // "sub" es el claim que contiene el username y "role" el que contiene el rol
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
    return [null,null];
  };

const [user,enterprise]= getUserDataFromToken();

const IncidentForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cliente: "",
    fecha_incidente: "",
    usuario_creador: user,
  });
  const [iocOptions, setIocOptions] = useState([]);
  const [selectedIoCs, setSelectedIoCs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchIoCs = async () => {
      try {
        const response = await api.get("/iocs");
        setIocOptions(response.data);
      } catch (err) {
        console.error("Error al obtener IoCs:", err);
      }
    };

    fetchIoCs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIoCSelection = (e) => {
    const options = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setSelectedIoCs(options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      console.log("Payload enviado:", formData);
      const { data: incidente } = await api.post("/incidentes", formData);

      for (const iocId of selectedIoCs) {
        await api.post(`/incidentes/${incidente.id}/add_ioc/${iocId}`);
      }

      setSuccess("Incidente creado correctamente.");
      setFormData({
        nombre: "",
        descripcion: "",
        cliente: "",
        fecha_incidente: "",
        usuario_creador: user,
      });
      setSelectedIoCs([]);
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      setError("Error al crear el incidente.");
    }
  };

  return (
    <div className="incident-form-container">
      <h3>Nuevo Incidente</h3>
      <form onSubmit={handleSubmit} className="incident-form">
        <label>Nombre:</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

        <label>Descripción:</label>
        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />

        <label>Cliente:</label>
        <select name="cliente" value={formData.cliente} onChange={handleChange} required>
        <option value="" disabled>Seleccione...</option>
        {(enterprise === "Todas" ? clienteOpciones : [enterprise]).map((opcion) => (
          <option key={opcion} value={opcion}>{opcion}</option>
        ))}
        </select>

        <label>Fecha del incidente:</label>
        <input type="datetime-local" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleChange} required/>


        <label>Seleccionar IoCs relacionados:</label>
        <select multiple value={selectedIoCs} onChange={handleIoCSelection} className="incident-select-multiple">
          {iocOptions.map((ioc) => (
            <option key={ioc.id} value={ioc.id}>
              {ioc.tipo} - {ioc.valor}
            </option>
          ))}
        </select>

        <button type="submit">Crear Incidente</button>

        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default IncidentForm;
