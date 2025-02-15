import { useState, useEffect } from "react";
import { api } from "../api"; // Importar la instancia de api
import ReactPaginate from "react-paginate";

import "../App.css";

function IoCManagement() {
  const [iocs, setIocs] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "",
    valor: "",
    cliente: "",
    categoria: "",
    tecnologia_deteccion: "",
    pertenece_a_incidente: false,
    criticidad: "",
    usuario_registro: "",
    fecha_creacion: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8; // Cantidad de IoCs por página

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

  const validateValor = (valor) => {
    // Permite solo caracteres alfanuméricos, puntos, barras y guiones en URLs/IPs/Dominios
    const regex = /^[a-zA-Z0-9._\-/:]+$/;
    return regex.test(valor);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Si el campo modificado es "valor", validar antes de actualizar
    if (name === "valor") {
      if (!validateValor(newValue)) {
        alert("El campo 'valor' contiene caracteres no permitidos.");
        return; // No actualiza el estado si la validación falla
      }
    }
  
    // Actualizar el estado del formulario
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: newValue };
  
      // Si cambia la categoría o si pertenece a un incidente, recalcular criticidad
      if (name === "categoria" || name === "pertenece_a_incidente") {
        updatedData.criticidad = calcularCriticidad(
          updatedData.categoria,
          updatedData.pertenece_a_incidente
        );
      }
  
      return updatedData;
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
        tecnologia_deteccion: "",
        pertenece_a_incidente: false,
        criticidad: "",
        usuario_registro: "",
        fecha_creacion: "",
      });
    } catch (error) {
      console.error("Error al registrar el IoC:", error);
    }
  };

  const [filters, setFilters] = useState({
    tipo: "",
    cliente: "",
    categoria: "",
    pertenece_a_incidente: "",
    criticidad: "",
  });
  
   // Filtrar IoCs solo si hay un término de búsqueda
  const filteredIoCs = iocs.filter((ioc) => {
  const sinFiltros = Object.values(filters).every((value) => value === "" || value === false);
  
  return sinFiltros || (
    (filters.tipo === "" || ioc.tipo === filters.tipo) &&
    (filters.cliente === "" || ioc.cliente === filters.cliente) &&
    (filters.categoria === "" || ioc.categoria === filters.categoria) &&
    (filters.criticidad === "" || ioc.criticidad === filters.criticidad) &&
    (filters.pertenece_a_incidente === "" || ioc.pertenece_a_incidente === filters.pertenece_a_incidente)
  );
  });
  

  // Calcular los IoCs de la página actual
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredIoCs.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredIoCs.length / itemsPerPage);

  // Función para calcular la criticidad (en base a categoria y pertenencia a incidente)
  const calcularCriticidad = (categoria, pertenece_a_incidente) => {
    if (pertenece_a_incidente) {
      return "Crítica";
    }
    if (categoria === "Ransomware" || categoria === "Malware") {
      return "Crítica";
    }
    if (categoria === "Phishing") {
      return "Media";
    }
    return "Baja";
  };

  // Función para cambiar de página
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  

  return (
    <div className="page">
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
            <option value="Otro">Otro</option>
          </select>

          <label>Tecnología Detección:</label>
          <select name="tecnologia_deteccion" value={formData.tecnologia_deteccion} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="NDR">NDR</option>
            <option value="SIEM">SIEM</option>
            <option value="XDR">XDR</option>
            <option value="Correo">Correo</option>
            <option value="Otros">Otros</option>
          </select>

          <label>Pertenece a un incidente:</label>
          <input type="checkbox" name="pertenece_a_incidente" checked={formData.pertenece_a_incidente} onChange={handleChange} />

          <label>Criticidad:</label>
          <select name="criticidad" value={formData.criticidad} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>

          <label>Usuario que registra:</label>
          <input type="text" name="usuario_registro" value={formData.usuario_registro} onChange={handleChange} required />

          <label>Fecha de Detección:</label>
          <input
            type="datetime-local"
            name="fecha_creacion"
            value={formData.fecha_creacion}
            onChange={handleChange}
            required
          />


          <button type="submit">Registrar IoC</button>
        </form>
      </div>

      <div className="ioc-list">

        {/* Barra de búsqueda */}
        <div className="filters">
          <label>Tipo:</label>
          <select
            name="tipo"
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="IP">IP</option>
            <option value="Dominio">Dominio</option>
            <option value="URL">URL</option>
            <option value="Hash">Hash</option>
          </select>

          <label>Cliente:</label>
          <select
            name="cliente"
            value={filters.cliente}
            onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="Empresa A">Empresa A</option>
            <option value="Empresa B">Empresa B</option>
            <option value="Empresa C">Empresa C</option>
          </select>

          <label>Categoría:</label>
          <select
            name="categoria"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="Phishing">Phishing</option>
            <option value="Ransomware">Ransomware</option>
            <option value="Malware">Malware</option>
          </select>

          <label>Pertenece a un Incidente:</label>
          <input
            type="checkbox"
            checked={filters.pertenece_a_incidente}
            onChange={(e) => setFilters({ ...filters, pertenece_a_incidente: e.target.checked })}
          />

          <label>Criticidad:</label>
          <select
            name="criticidad"
            value={filters.criticidad}
            onChange={(e) => setFilters({ ...filters, criticidad: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>


        <h2>Lista de IoCs</h2>
        {/* Tabla de IoCs */}
        {filteredIoCs.length > 0 ? (
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Cliente</th>
            <th>Categoría</th>
            <th>Tecnología</th>
            <th>Incidente</th>
            <th>Criticidad</th>
            <th>Usuario</th>
            <th>Fecha Detección</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((ioc) => (
            <tr key={ioc.id}>
              <td>{ioc.tipo}</td>
              <td>{ioc.valor}</td>
              <td>{ioc.cliente}</td>
              <td>{ioc.categoria}</td>
              <td>{ioc.tecnologia_deteccion}</td>
              <td>{ioc.pertenece_a_incidente ? "Sí" : "No"}</td>
              <td>{ioc.criticidad}</td>
              <td>{ioc.usuario_registro}</td>
              <td>{new Date(ioc.fecha_creacion).toLocaleString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
        <p className="no-results">Elementos no encontrados</p>
      )}

        {/* Paginación */}
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
      </div>
    </div>
  );
}

export default IoCManagement;

