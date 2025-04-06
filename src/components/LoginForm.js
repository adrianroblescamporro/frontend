import React, { useState } from "react";
import { api } from "../api"; // Importar la instancia de api
import MFASetup from "./MFAsetup.js";
import "./LoginForm.css"; // Importar el CSS

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "", mfa_code: ""});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false); // Para controlar la configuración de MFA

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
      
      const response = await api.post(
        "/login",
        {
            username: formData.username,
            password: formData.password,
            mfa_code: requiresMFA ? formData.mfa_code : "",  // Ahora se envía en JSON
        },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", response.data.access_token);
      onLogin(); // Notificar al componente padre que el usuario ha iniciado sesión
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setShowMFASetup(true); // Si MFA no está configurado, mostrar configuración
      } else if (err.response && err.response.status === 401) {
        setRequiresMFA(true); // Si MFA está habilitado pero el código es incorrecto, pedir código MFA
      } else {
        setError("Credenciales incorrectas o código MFA inválido");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {showMFASetup ? (
        <MFASetup username={formData.username} onMFAConfigured={() => setShowMFASetup(false)} />
      ) : (
        <form onSubmit={handleSubmit} className={`login-form ${isLoading ? "loading" : ""}`}>
          <h2>Iniciar sesión</h2>
          {error && <p className="error-message">{error}</p>}

          <label>Usuario:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading || requiresMFA}
            required
          />

          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading || requiresMFA}
            required
          />

          {/* Mostrar campo MFA solo si es requerido */}
          {requiresMFA && (
            <>
              <label>Código MFA:</label>
              <input
                type="text"
                name="mfa_code"
                value={formData.mfa_code}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Cargando..." : requiresMFA ? "Verificar MFA" : "Iniciar sesión"}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
