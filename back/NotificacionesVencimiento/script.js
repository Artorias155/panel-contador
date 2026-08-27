
document.addEventListener("DOMContentLoaded", () => {
  
  const API_URL = "https://backends-cvdm.onrender.com/enviar-notificacion";

  // Selectores
  const emailInput       = document.getElementById("emailInput");
  const demoBtn          = document.getElementById("demoBtn");
  const heroInputArea    = document.getElementById("hero-input-area");
  const loadingArea      = document.getElementById("loading-area");
  const emailSentArea    = document.getElementById("email-sent");
  
  const resendBtn        = document.getElementById("resendBtn");
  const contactBtn       = document.getElementById("contactBtn");
  const footerContactBtn = document.getElementById("footerContactBtn");
  const generateVepBtn   = document.getElementById("generateVepBtn");

  if (!emailInput || !demoBtn || !heroInputArea || !loadingArea || !emailSentArea) {
    console.warn("ContadorAI: Faltan elementos clave en el DOM. Deteniendo script para evitar errores.");
    return;
  }

  let ultimoEmailEnviado = "";

  emailSentArea.style.display = "none";
  loadingArea.style.display = "none";

  function esEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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
    demoBtn.disabled = true;
    emailInput.disabled = true;

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
    } finally {
      demoBtn.disabled = false;
      emailInput.disabled = false;
      emailInput.focus();
    }
  }

  demoBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (!esEmailValido(email)) {
      alert("Por favor ingresá un email válido.");
      return;
    }
    manejarEnvio(email);
  });

  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !demoBtn.disabled) {
      e.preventDefault();
      demoBtn.click();
    }
  });

  
  if (resendBtn) {
    resendBtn.addEventListener("click", () => {
      if (ultimoEmailEnviado) manejarEnvio(ultimoEmailEnviado);
    });
  }

  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      window.location.href = "mailto:tu_correo@gmail.com?subject=Consulta sobre ContadorAI";
    });
  }

  if (footerContactBtn) {
    footerContactBtn.addEventListener("click", () => {
      window.location.href = "mailto:tu_correo@gmail.com?subject=Quiero acceso a ContadorAI";
    });
  }

  if (generateVepBtn) {
    generateVepBtn.addEventListener("click", () => {
      if (generateVepBtn.disabled) return;
      
      generateVepBtn.textContent = "Generando...";
      generateVepBtn.disabled = true;
      
      setTimeout(() => {
        generateVepBtn.textContent = "✅ VEP Generado";
      }, 1200);
    });
  }
});
