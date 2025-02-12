import React from "react";
import IoCManagement from "./components/IoCManagement";
import "./App.css";

function App() {
  return (
    <div className="container">
      <nav className="navbar">
        <img src="/logo.png" alt="Be-Sec Logo" className="logo" />
        <h1>Gestión de IoCs</h1>
      </nav>
      <div className="content">
      <IoCManagement />
      </div>
      <footer className="footer">© 2025 BE:SEC. Todos los derechos reservados.</footer>
    </div>
  );
}

export default App;

