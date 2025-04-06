import React, { useState, useEffect } from "react";
import { api } from "../api"; // Importar la instancia de api
import "./MFAsetup.css";


const MFASetup = ({ username, onMFASuccess }) => {
  const [qrCode, setQrCode] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener el código QR del backend al montar el componente
  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await api.get(`/mfa/qrcode/${username}`, {
          responseType: "arraybuffer", // Para recibir la imagen en formato binario
        });

        const imageBlob = new Blob([response.data], { type: "image/png" });
        const imageUrl = URL.createObjectURL(imageBlob);
        setQrCode(imageUrl);
      } catch (err) {
        setError("Error al obtener el código QR. Puede que el MFA ya esté activado.");
      }
    };

    fetchQRCode();
  }, [username]);

  // Manejar la verificación del código MFA
  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const formDataEncoded = new URLSearchParams();
        formDataEncoded.append("username", username);
        formDataEncoded.append("password", mfaCode);
        await api.post(
            "/mfa/verify",
            formDataEncoded,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        alert("MFA activado correctamente");
        onMFASuccess(); // Notifica al padre que MFA se activó
        } catch (err) {
        setError("Código incorrecto. Inténtalo de nuevo.");
        } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mfa-setup-container">
      <h2>Configurar Autenticación de Dos Factores</h2>
      {error && <p className="error-message">{error}</p>}
      
      {qrCode ? (
        <div>
          <p>Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)</p>
          <img src={qrCode} alt="Código QR MFA" className="mfa-qrcode" />
          <form onSubmit={handleVerifyMFA} className="mfa-form">
            <label>Introduce el código MFA:</label>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="mfa-button">
              {loading ? "Verificando..." : "Activar MFA"}
            </button>
          </form>
        </div>
      ) : (
        <p>Cargando código QR...</p>
      )}
    </div>
  );
};

export default MFASetup;
