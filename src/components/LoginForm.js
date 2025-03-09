import React, { useState } from "react";
import axios from "axios";
import "./LoginForm.css"; // Importar el CSS

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Validar usuario (entre 4 y 20 caracteres, solo letras, números y "_")
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    return usernameRegex.test(username);
  };

  // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo)
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validar usuario y contraseña antes de enviar la solicitud
    if (!validateUsername(formData.username)) {
      setError("El nombre de usuario debe tener entre 4 y 20 caracteres y solo puede contener letras, números y '_'.");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      return;
    }
    
    try {
      // Convertir los datos a `application/x-www-form-urlencoded`
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append("username", formData.username);
      formDataEncoded.append("password", formData.password);

      const response = await axios.post("http://127.0.0.1:8000/api/login", formDataEncoded, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

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
