import { useState, useEffect, useCallback } from "react";
import { api } from "../api"; // Importar la instancia de api
import ReactPaginate from "react-paginate";
import IoCChart from "./IoCChart";
import ReportGenerator from "./ReportGenerator";


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
  const [chartData, setChartData] = useState([]);

  const fetchIoCs = useCallback(async () => {
    try {
      const response = await api.get("/iocs");
      const fetchedIoCs = response.data;
      setIocs(fetchedIoCs);
  
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });
  
      const counts = last7Days.map(date => ({
        date,
        count: fetchedIoCs.filter(ioc => ioc.fecha_creacion.startsWith(date)).length,
      }));
      setChartData(counts);
    } catch (error) {
      console.error("Error cargando IoCs:", error);
    }
  }, []); // No cambiará en cada render
  
  useEffect(() => {
    fetchIoCs();
  }, [fetchIoCs]); 

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
  
  const [errorMessage, setErrorMessage] = useState(""); // ← Estado para manejar el error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Resetear error antes de hacer la petición
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
      if (error.response && error.response.status === 400) {
        setErrorMessage("Error: El IoC ya existe en la base de datos.");
      } else {
        setErrorMessage("Error al registrar el IoC.");
      }
    }
  };

  const [filters, setFilters] = useState({
    tipo: "",
    valor:"",
    cliente: "",
    categoria: "",
    tecnologia_deteccion: "",
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
    (filters.tecnologia_deteccion === "" || ioc.tecnologia_deteccion === filters.tecnologia_deteccion) &&
    (filters.criticidad === "" || ioc.criticidad === filters.criticidad) &&
    (filters.pertenece_a_incidente === "" || ioc.pertenece_a_incidente === filters.pertenece_a_incidente) &&
    (filters.valor === "" || ioc.valor.toLowerCase().includes(filters.valor.toLowerCase())) // Buscar por valor
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
        {/* Mensaje de error */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="report-section">
        <h2>Generar Reporte</h2>
        <ReportGenerator />
        </div>

      </div>

      <div className="ioc-list">

        {/* Barra de búsqueda */}
        <div className="filters">
        <div className="filter-group">
          <label>Valor</label>
          <input
            type="text"
            placeholder="Buscar por valor..."
            value={filters.valor}
            onChange={(e) => setFilters({ ...filters, valor: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Tipo</label>
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
        </div>

        <div className="filter-group">
          <label>Cliente</label>
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
        </div>

        <div className="filter-group">
          <label>Categoría</label>
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
        </div>

        <div className="filter-group">
          <label>Tecnología</label>
          <select
            name="tecnologia_deteccion"
            value={filters.tecnologia_deteccion}
            onChange={(e) => setFilters({ ...filters, tecnologia_deteccion: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="NDR">NDR</option>
            <option value="SIEM">SIEM</option>
            <option value="XDR">XDR</option>
            <option value="Correo">Correo</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Pertenece a un Incidente</label>
          <input
            type="checkbox"
            checked={filters.pertenece_a_incidente}
            onChange={(e) => setFilters({ ...filters, pertenece_a_incidente: e.target.checked })}
          />
        </div>

        <div className="filter-group">
          <label>Criticidad</label>
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
      <IoCChart chartData={chartData} />

      </div>

    </div>
  );
}

export default IoCManagement;

