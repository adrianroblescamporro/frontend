import { useState, useEffect } from "react";
import { api } from "../api"; // Importar la instancia de api

const IoCManagement = () => {
    const [formData, setFormData] = useState({
        tipo: "",                  // Tipo de IoC (URL, IP, etc.)
        valor: "",                 // Valor del IoC (URL, IP, etc.)
        cliente: "",               // Cliente asociado al IoC
        categoria: "",             // Categoría del IoC (Ransomware, Phishing, etc.)
        pertenece_a_incidente: false,  // Indica si el IoC pertenece a un incidente
        criticidad: "baja",        // Criticidad del IoC (baja, media, alta)
        usuario_registro: "",      // Usuario que registra el IoC
    });

    const [iocs, setIocs] = useState([]);
    const [refresh, setRefresh] = useState(false);

    // Obtener IoCs al cargar la página
    useEffect(() => {
        const fetchIoCs = async () => {
            try {
                const response = await api.get("/iocs"); // Usar la instancia api para hacer GET
                setIocs(response.data);
            } catch (error) {
                console.error("Error al cargar IoCs:", error);
            }
        };
        fetchIoCs();
    }, [refresh]); // Dependemos de "refresh" para actualizar la lista

    // Función para manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/iocs", formData); // Usar la instancia api para hacer POST
            alert("IoC agregado correctamente");
            setRefresh(!refresh); // Refrescar la lista de IoCs
        } catch (error) {
            console.error("Error al agregar IoC:", error);
            alert("Hubo un error al agregar el IoC");
        }
    };

    return (
        <div>
            <h1>Gestión de IoCs</h1>
            
            {/* Formulario para agregar IoC */}
            <form onSubmit={handleSubmit} className="p-4 border rounded">
                <label>
                    Tipo de IoC:
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                    >
                        <option value="URL">URL</option>
                        <option value="IP">IP</option>
                        <option value="hash">Hash</option>
                    </select>
                </label>
                <br />
                <label>
                    Valor:
                    <input
                        type="text"
                        name="valor"
                        value={formData.valor}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Cliente:
                    <input
                        type="text"
                        name="cliente"
                        value={formData.cliente}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Categoría:
                    <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        required
                    >
                        <option value="Ransomware">Ransomware</option>
                        <option value="Phishing">Phishing</option>
                        <option value="Malware">Malware</option>
                        <option value="Botnet">Botnet</option>
                    </select>
                </label>
                <br />
                <label>
                    ¿Perteneciente a un incidente?
                    <input
                        type="checkbox"
                        name="pertenece_a_incidente"
                        checked={formData.pertenece_a_incidente}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Criticidad:
                    <select
                        name="criticidad"
                        value={formData.criticidad}
                        onChange={handleChange}
                        required
                    >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                    </select>
                </label>
                <br />
                <label>
                    Usuario que registra:
                    <input
                        type="text"
                        name="usuario_registro"
                        value={formData.usuario_registro}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <button type="submit">Agregar IoC</button>
            </form>
            
            {/* Lista de IoCs */}
            <h2>Lista de IoCs</h2>
            <ul>
                {iocs.map((ioc) => (
                    <li key={ioc.id}>
                        <strong>{ioc.tipo}</strong>: {ioc.valor} - {ioc.cliente} - {ioc.categoria} - 
                        Criticidad: {ioc.criticidad} - Usuario: {ioc.usuario_registro} - 
                        {ioc.pertenece_a_incidente ? "Perteneciente a un incidente" : "No pertenece a un incidente"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default IoCManagement;
