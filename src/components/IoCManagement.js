import { useState, useEffect} from "react";
import { api } from "../api"; // Importar la instancia de api
import {
  tipoOpciones,
  clienteOpciones,
  categoriaOpciones,
  tecnologiaOpciones,
  criticidadOpciones,
} from "../constants"; 
import ReactPaginate from "react-paginate";
import IoCChart from "./IoCChart";
import ReportGenerator from "./ReportGenerator";
import EDLGenerator from "./EDLGenerator";
import EnrichmentModal from "./EnrichmentModal";
import AddToIncidentModal from "./AddToIncidentModal";
import IoCIncidentsModal from "./IoCIncidentsModal";
import IoCCharts from "./IoCCharts";
import { jwtDecode } from "jwt-decode";


import "../App.css";

function IoCManagement({ iocs, fetchIoCs, loading }) {
  const token = localStorage.getItem("token");

  // Función para obtener el usuario del token
  const getUserDataFromToken = () => {
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decodifica el JWT
        return [decoded.sub, decoded.role, decoded.enterprise]; // "sub" es el claim que contiene el username y "role" el que contiene el rol
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
    return [null,null,null];
  };

  const [user,role,enterprise] = getUserDataFromToken();
  const [formData, setFormData] = useState({
    tipo: "",
    valor: "",
    cliente: "",
    categoria: "",
    tecnologia_deteccion: "",
    pertenece_a_incidente: false,
    criticidad: "",
    usuario_registro: user,
    fecha_creacion: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8; // Cantidad de IoCs por página
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });
  
    const counts = last7Days.map(date => ({
      date,
      count: iocs.filter(ioc => ioc.fecha_creacion.startsWith(date)).length,
    }));
  
    setChartData(counts);
  }, [iocs]);
  

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
      if (role ==="analista" || role === "admin"){
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
        usuario_registro: user,
        fecha_creacion: "",
      });
      }
      else {
        setErrorMessage("Error: No tiene permisos para esta acción")
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage("Error: El IoC ya existe en la base de datos.");
      } else {
        setErrorMessage("Error al registrar el IoC.");
      }
    }
  };

  const [editingIoCId, setEditingIoCId] = useState(null);
  const [editedIoC, setEditedIoC] = useState({});

  // Manejar cambios en los inputs de edición
  const handleEditChange = (e, field) => {
    setEditedIoC({ ...editedIoC, [field]: e.target.value });
  };

  // Activar modo edición con los valores actuales
  const handleEditClick = (ioc) => {
    setEditingIoCId(ioc.id);
    setEditedIoC({ ...ioc });
  };

  // Guardar cambios en la API
  const handleSave = async (iocId) => {
    try {
      await api.put(`/iocs/${iocId}`, editedIoC);
      setEditingIoCId(null);
      fetchIoCs(); // Recargar datos actualizados
    } catch (error) {
      console.error("Error al actualizar IoC:", error);
    }
  };
  
  // Eliminar IoC
  const handleDelete = async (iocId) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este IoC?");
    if (!confirm) return;
  
    try {
      await api.delete(`/iocs/${iocId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Elimina el IoC del estado
      fetchIoCs();
    } catch (error) {
      console.error("Error al eliminar el IoC:", error);
      alert("No se pudo eliminar el IoC.");
    }
  };

  // Enriquecer IOC

  const [selectedIoC, setSelectedIoC] = useState(null);

  const handleOpenEnrichment = (ioc) => setSelectedIoC(ioc.valor);
  const handleCloseEnrichment = () => setSelectedIoC(null);

  // Mostrar incidentes relacionados
  const [IoCforIncidentList, setIoCforIncidentList] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);


  // Filtrar
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

  //Añadir IoC a Incidente
  const [selectedIoCforIncident, setSelectedIoCforIncident] = useState(null);

  return (
    <div className="page">
      <div className="form-container">
        <h2>Registrar nuevo IoC</h2>
        <form onSubmit={handleSubmit}>
          <label>Tipo:</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            {tipoOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>

          <label>Valor:</label>
          <input type="text" name="valor" value={formData.valor} onChange={handleChange} required />

          <label>Cliente:</label>
          <select name="cliente" value={formData.cliente} onChange={handleChange} required>
            <option value="" disabled>Seleccione...</option>
            {(enterprise === "Todas" ? clienteOpciones : [enterprise]).map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>

          <label>Categoría:</label>
          <select name="categoria" value={formData.categoria} onChange={handleChange} required>
            <option value="" disabled>Seleccione...</option>
            {categoriaOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>

          <label>Tecnología Detección:</label>
          <select name="tecnologia_deteccion" value={formData.tecnologia_deteccion} onChange={handleChange} required>
            <option value="" disabled>Seleccione...</option>
            {tecnologiaOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>

          <label>Pertenece a un incidente:</label>
          <input type="checkbox" name="pertenece_a_incidente" checked={formData.pertenece_a_incidente} onChange={handleChange} />

          <label>Criticidad:</label>
          <select name="criticidad" value={formData.criticidad} onChange={handleChange} required>
            <option value="" disabled>Seleccione...</option>
            {criticidadOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>

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

        <div className="edl-section">
        <h2>Generar EDL</h2>
        <EDLGenerator />
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
            {tipoOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
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
            {(enterprise === "Todas" ? clienteOpciones : [enterprise]).map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
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
            {categoriaOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
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
            {tecnologiaOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Criticidad</label>
          <select
            name="criticidad"
            value={filters.criticidad}
            onChange={(e) => setFilters({ ...filters, criticidad: e.target.value })}
          >
            <option value="">Todas</option>
            {criticidadOpciones.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
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
        </div>


        <h2>Lista de IoCs</h2>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ioc) => (
                <tr key={ioc.id}>
                  {editingIoCId === ioc.id ? (
                    <>
                      <td>
                        <select
                          value={editedIoC.tipo}
                          onChange={(e) => handleEditChange(e, "tipo")}
                        >
                          {tipoOpciones.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedIoC.valor}
                          onChange={(e) => handleEditChange(e, "valor")}
                        />
                      </td>
                      <td>
                        <select
                          value={editedIoC.cliente}
                          onChange={(e) => handleEditChange(e, "cliente")}
                        >
                          {(enterprise === "Todas" ? clienteOpciones : [enterprise]).map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={editedIoC.categoria}
                          onChange={(e) => handleEditChange(e, "categoria")}
                        >
                          {categoriaOpciones.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={editedIoC.tecnologia_deteccion}
                          onChange={(e) => handleEditChange(e, "tecnologia_deteccion")}
                        >
                          {tecnologiaOpciones.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={editedIoC.pertenece_a_incidente}
                          onChange={(e) =>
                            setEditedIoC({ ...editedIoC, pertenece_a_incidente: e.target.value === "true" })
                          }
                        >
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={editedIoC.criticidad}
                          onChange={(e) => handleEditChange(e, "criticidad")}
                        >
                          {criticidadOpciones.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      </td>
                      <td>{ioc.usuario_registro}</td>
                      <td>
                        <input
                          type="datetime-local"
                          value={new Date(editedIoC.fecha_creacion).toISOString().slice(0, 16)}
                          onChange={(e) => handleEditChange(e, "fecha_creacion")}
                        />
                      </td>
                      <td>
                        <button onClick={() => handleSave(ioc.id)}>Guardar</button>
                        <button onClick={() => setEditingIoCId(null)}>Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{ioc.tipo}</td>
                      <td>{ioc.valor}</td>
                      <td>{ioc.cliente}</td>
                      <td>{ioc.categoria}</td>
                      <td>{ioc.tecnologia_deteccion}</td>
                      <td>{ioc.pertenece_a_incidente ? (<>Sí 
                        <button onClick={() => {
                            setIoCforIncidentList(ioc);
                            setShowIncidentModal(true);
                          }}>Ver incidentes</button>

                        {showIncidentModal && IoCforIncidentList && (
                          <IoCIncidentsModal
                            ioc={IoCforIncidentList}
                            onClose={() => {
                              setShowIncidentModal(false);
                              setIoCforIncidentList(null);
                            }}
                          />
                        )}
                      </>)
                      : "No"}</td>
                      <td>{ioc.criticidad}</td>
                      <td>{ioc.usuario_registro}</td>
                      <td>
                        {new Date(ioc.fecha_creacion).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        {(role === "admin" || role === "analista") && (
                          <button onClick={() => handleEditClick(ioc)}>Editar</button>
                        )}
      
                        {role === "admin" && (
                          <button onClick={() => handleDelete(ioc.id)}>
                            Eliminar
                          </button>
                        )}

                        <button onClick={() => handleOpenEnrichment(ioc)}>🔍 Enriquecer</button>
                        {selectedIoC && (
                          <EnrichmentModal ioc={selectedIoC} onClose={handleCloseEnrichment} />
                        )}

                        <button onClick={() => setSelectedIoCforIncident(ioc.id)}>
                            Asociar a Incidente
                        </button>
                        {selectedIoCforIncident && (
                          <AddToIncidentModal
                            iocId={selectedIoCforIncident}
                            onClose={() => setSelectedIoCforIncident(null)}
                            onSuccess={() => {
                              setSelectedIoCforIncident(null);
                              // Si quieres recargar IoCs o refrescar la vista aquí
                            }}
                          />
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
    ) : (
        <p className="no-results">Cargando elementos...</p>
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

        <IoCCharts iocs={iocs} />
        <IoCChart chartData={chartData} />

    </div>
    </div>
  );
}

export default IoCManagement;

