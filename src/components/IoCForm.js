import { useState } from "react";
import { api } from "../api"; // Importar la instancia de api

const IoCForm = ({ onIoCAdded }) => {
    const [formData, setFormData] = useState({
        indicador: "",
        cliente: "",
        categoria: "",
        incidente: false,
        criticidad: "baja",
        usuario: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/iocs", formData); // Usar la instancia api para hacer POST
            alert("IoC agregado correctamente");
            onIoCAdded(); // Actualiza la lista de IoCs
        } catch (error) {
            console.error("Error al agregar IoC:", error);
            alert("Hubo un error al agregar el IoC");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded">
            <label>
                Indicador:
                <input type="text" name="indicador" value={formData.indicador} onChange={handleChange} required />
            </label>
            <label>
                Cliente:
                <input type="text" name="cliente" value={formData.cliente} onChange={handleChange} required />
            </label>
            <label>
                Categoría:
                <select name="categoria" value={formData.categoria} onChange={handleChange}>
                    <option value="phishing">Phishing</option>
                    <option value="ransomware">Ransomware</option>
                    <option value="malware">Malware</option>
                </select>
            </label>
            <label>
                ¿Perteneciente a un incidente?
                <input type="checkbox" name="incidente" checked={formData.incidente} onChange={handleChange} />
            </label>
            <label>
                Criticidad:
                <select name="criticidad" value={formData.criticidad} onChange={handleChange}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </label>
            <label>
                Usuario:
                <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} required />
            </label>
            <button type="submit">Agregar IoC</button>
        </form>
    );
};

export default IoCForm;
