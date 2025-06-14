import React, { useEffect, useState } from "react";
import { api } from "./api"; 
import IoCManagement from "./components/IoCManagement";
import IncidentManagement from "./components/IncidentManagement";
import UserCreationModal from "./components/UserCreationModal";
import LoginForm from "./components/LoginForm";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isIoC, setIsIoC] = useState(true);
  const [isIncident, setIsIncident] = useState(false);
  const [incidentes, setIncidentes] = useState([]);
  const [iocs, setIocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Iocloading, setIocLoading] = useState(true);

  useEffect(() => {
    const handleTokenExpired = () => {
      setIsAuthenticated(false);
    };
    const token = localStorage.getItem("token");
    if (token){
      setIsAuthenticated(true);
    }
    window.addEventListener("tokenExpired", handleTokenExpired);
    return () => window.removeEventListener("tokenExpired", handleTokenExpired);
  }, []);

  const fetchIoCs = async () => {
    setIocLoading(true);
    try {
      const response = await api.get("/iocs");
      setIocs(response.data);
    } catch (error) {
      console.error("Error cargando IoCs:", error);
    } finally {
      setIocLoading(false);
    }
  };

  const fetchIncidentes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/incidentes");
      setIncidentes(response.data);
    } catch (error) {
      console.error("Error al obtener los incidentes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchIoCs();
      fetchIncidentes();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const token = localStorage.getItem("token");

  // Función para obtener el usuario del token
  const getUserDataFromToken = () => {
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decodifica el JWT
        return [decoded.role]; // "sub" es el claim que contiene el username y "role" el que contiene el rol
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
    return [null,null,null];
  };

  const [role] = getUserDataFromToken();
  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-title">
          <img src="/logo.png" alt="Be-Sec Logo" className="logo" />
          <h1>Gestión de IoCs</h1>
        </div>
        {isAuthenticated && (
          <div className="navbar-actions">
            {role === "admin" && (
              <button className="button1" onClick={() => setIsModalOpen(true)}>Crear Usuario</button>
            )}
            <button className="button1" onClick={handleLogout}>Cerrar sesión</button>
            <button className="button2" onClick={() => { setIsIoC(true); setIsIncident(false); }}>Ver IoCs</button>
            <button className="button2" onClick={() => { setIsIoC(false); setIsIncident(true); }}>Ver Incidentes</button>
          </div>
        )}
      </nav>

      {isModalOpen && <UserCreationModal onClose={() => setIsModalOpen(false)} />}

      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <div className="content">
          {isIoC && (<IoCManagement 
            iocs={iocs}
            loading={Iocloading}
            fetchIoCs={fetchIoCs}
            fetchIncidentes={fetchIncidentes}
            />
          )}
          {isIncident && (
            <IncidentManagement
              incidentes={incidentes}
              loading={loading}
              fetchIoCs={fetchIoCs}
              fetchIncidentes={fetchIncidentes}
            />
          )}
        </div>
      )}
      
      <footer className="footer">© 2025 BE:SEC. Todos los derechos reservados.</footer>
    </div>
  );
}

export default App;
