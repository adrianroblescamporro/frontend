import React from "react";
import { useEffect, useState } from "react";
import IoCManagement from "./components/IoCManagement";
import UserCreationModal from "./components/UserCreationModal"; // Importa el componente del modal
import LoginForm from "./components/LoginForm";


import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        <img src="/logo.png" alt="Be-Sec Logo" className="logo" />
        <h1>Gestión de IoCs</h1>
        {isAuthenticated && (
          <div className="navbar-actions">
            <button className="add-user-button" onClick={() => setIsModalOpen(true)}>
              Crear Usuario
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
      {/* Modal para crear usuario */}
      {isModalOpen && <UserCreationModal onClose={() => setIsModalOpen(false)} />}
      {!isAuthenticated ? <LoginForm onLogin={handleLogin} /> : 
        <div className="content">
        <IoCManagement />
        </div>
      }
      <footer className="footer">© 2025 BE:SEC. Todos los derechos reservados.</footer>
    </div>
  );
}

export default App;

