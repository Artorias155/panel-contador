// ==========================================================
// CONFIGURACIÓN
// ==========================================================
// URL de tu backend (main.py). Cambiala según el entorno:
//   - Desarrollo local:  http://localhost:8000/enviar-notificacion
//   - Producción:        https://tu-dominio.com/enviar-notificacion
// OJO: si tu página vive en https://, el backend también debe ser https://
// (los navegadores bloquean fetch de https -> http, se llama "mixed content").
const API_URL = "http://localhost:8000/enviar-notificacion";

// ==========================================================
// ELEMENTOS DEL DOM
// ==========================================================
const emailInput      = document.getElementById("emailInput");
const demoBtn          = document.getElementById("demoBtn");
const heroInputArea    = document.getElementById("hero-input-area");
const loadingArea      = document.getElementById("loading-area");
const emailSentArea    = document.getElementById("email-sent");
const resendBtn         = document.getElementById("resendBtn");
const contactBtn        = document.getElementById("contactBtn");
const footerContactBtn  = document.getElementById("footerContactBtn");
const generateVepBtn    = document.getElementById("generateVepBtn");

let ultimoEmailEnviado = "";

// Estado inicial: solo se ve el input + botón
emailSentArea.style.display = "none";
loadingArea.style.display = "none";

// ==========================================================
// VALIDACIÓN SIMPLE
// ==========================================================
function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==========================================================
// LLAMADA AL BACKEND
// ==========================================================
async function enviarCorreoDemo(email) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(detalle.detail || "No se pudo enviar el correo.");
  }

  return respuesta.json();
}

async function manejarEnvio(email) {
  heroInputArea.style.display = "none";
  emailSentArea.style.display = "none";
  loadingArea.style.display = "flex";

  try {
    await enviarCorreoDemo(email);
    ultimoEmailEnviado = email;
    loadingArea.style.display = "none";
    emailSentArea.style.display = "block";
  } catch (error) {
    loadingArea.style.display = "none";
    heroInputArea.style.display = "flex";
    alert("Hubo un problema al enviar el correo: " + error.message);
  }
}

// ==========================================================
// EVENTOS
// ==========================================================
demoBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  if (!esEmailValido(email)) {
    alert("Por favor ingresá un email válido.");
    return;
  }
  manejarEnvio(email);
});

emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") demoBtn.click();
});

resendBtn.addEventListener("click", () => {
  if (ultimoEmailEnviado) manejarEnvio(ultimoEmailEnviado);
});

contactBtn.addEventListener("click", () => {
  window.location.href = "mailto:tu_correo@gmail.com?subject=Consulta sobre ContadorAI";
});

footerContactBtn.addEventListener("click", () => {
  window.location.href = "mailto:tu_correo@gmail.com?subject=Quiero acceso a ContadorAI";
});

// Botón de VEP: es solo demo visual (no llama al backend, no hay lógica de VEPs real)
generateVepBtn.addEventListener("click", () => {
  generateVepBtn.textContent = "Generando...";
  generateVepBtn.disabled = true;
  setTimeout(() => {
    generateVepBtn.textContent = "✅ VEP Generado";
  }, 1200);
});
