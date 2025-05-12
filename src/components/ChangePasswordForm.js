import React, { useState } from "react";
import { api } from "../api";
import "./ChangePasswordForm.css"

const ChangePasswordForm = ({ username, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = async (e) => {
    e.preventDefault();
    setError("")

    if (!validatePassword(newPassword)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      return;
    }
    try {
      await api.post(
        "/users/change_password",
        { username, new_password: newPassword },
      );
      setSuccess("Contraseña actualizada correctamente.");
      onPasswordChanged();
    } catch (err) {
      console.error(err);
      setError("Error al cambiar la contraseña.");
    }
  };

  return (
    <form onSubmit={handleChange} className="change-password-form">
      <h2>Cambiar contraseña</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <label>Nueva contraseña:</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <button type="submit">Actualizar</button>
    </form>
  );
};

export default ChangePasswordForm;
