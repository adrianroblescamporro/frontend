import { useState } from "react";
import axios from "axios";
import "./UserCreationModal.css"; // Importar el CSS

const UserCreationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ username: "", password: "", role: "analista" });
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await axios.post("http://127.0.0.1:8000/api/register", formData);
      alert("Usuario creado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setError("Error al crear usuario. Verifica los datos.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Crear Nuevo Usuario</h2>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre de usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="modal-input"
            />
          </div>
          <div>
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="modal-input"
            />
          </div>
          <div>
            <label>Rol</label>
            <select name="role" value={formData.role} onChange={handleInputChange} className="modal-input">
              <option value="admin">Administrador</option>
              <option value="analista">Analista</option>
              <option value="lector">Lector</option>
            </select>
          </div>
          <button type="submit" className="modal-button">Crear Usuario</button>
        </form>
        <button onClick={onClose} className="modal-cancel">Cancelar</button>
      </div>
    </div>
  );
};

export default UserCreationModal;
