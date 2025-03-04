import React from "react";
import { useState } from "react";
import IoCManagement from "./components/IoCManagement";
import UserCreationModal from "./components/UserCreationModal"; // Importa el componente del modal
import LoginForm from "./components/LoginForm";


import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <img src="/logo.png" alt="Be-Sec Logo" className="logo" />
        <h1>Gestión de IoCs</h1>
        <button className="add-user-button" onClick={() => setIsModalOpen(true)}>
          Crear Usuario
        </button>
      </nav>
      {/* Modal para crear usuario */}
      {isModalOpen && <UserCreationModal onClose={() => setIsModalOpen(false)} />}
      {!isAuthenticated ? <LoginForm onLogin={handleLogin} /> : <h1>Bienvenido al sistema</h1>}
      <div className="content">
      <IoCManagement />
      </div>
      <footer className="footer">© 2025 BE:SEC. Todos los derechos reservados.</footer>
    </div>
  );
}

export default App;

