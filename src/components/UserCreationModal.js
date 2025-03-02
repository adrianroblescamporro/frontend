import { useState } from "react";
import axios from "axios";
import "./UserCreationModal.css"; // Importar el CSS

const UserCreationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ username: "", password: "", role: "analista" });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
