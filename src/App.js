import React from "react";
import { useEffect, useState } from "react";
import IoCManagement from "./components/IoCManagement";
import IncidentManagement from "./components/IncidentManagement";
import UserCreationModal from "./components/UserCreationModal"; // Importa el componente del modal
import LoginForm from "./components/LoginForm";


import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isIoC, setIsIoC] = useState(true);
  const [isIncident, setIsIncident] = useState(false);


  //Comprobar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-title">
        <img src="/logo.png" alt="Be-Sec Logo" className="logo" />
        <h1>Gestión de IoCs</h1>
        </div>
        {isAuthenticated && (
          <div className="navbar-actions">
            <button className="button1" onClick={() => setIsModalOpen(true)}>
              Crear Usuario
            </button>
            <button className="button1" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <button className="button2" onClick={() => {
              setIsIoC(true);
              setIsIncident(false);
            }}>
              Ver IoCs
            </button>

            <button className="button2" onClick={() => {
              setIsIoC(false);
              setIsIncident(true);
            }}>
              Ver Incidentes
            </button>
          </div>
        )}
      </nav>
      {/* Modal para crear usuario */}
      {isModalOpen && <UserCreationModal onClose={() => setIsModalOpen(false)} />}
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <div className="content">
          {isIoC && <IoCManagement />}
          {isIncident && <IncidentManagement />}
        </div>
      )}
      <footer className="footer">© 2025 BE:SEC. Todos los derechos reservados.</footer>
    </div>
  );
}

export default App;

