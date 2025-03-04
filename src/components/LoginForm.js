import React, { useState } from "react";
import axios from "axios";
import "./LoginForm.css"; // Importar el CSS

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", formData);
      localStorage.setItem("token", response.data.access_token);
      onLogin(); // Notificar al componente padre que el usuario ha iniciado sesión
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className={`login-form ${isLoading ? "loading" : ""}`}>
        <h2>Iniciar sesión</h2>
        {error && <p className="error-message">{error}</p>}

        <label>Usuario:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
