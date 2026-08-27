document.addEventListener("DOMContentLoaded", () => {
  
  // NOTA: En producción, asegúrate de que esta URL use HTTPS.
  const API_URL = "http://localhost:8000/enviar-notificacion";

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

  // Defensa: Verificamos que los elementos principales existan
  if (!emailInput || !demoBtn || !heroInputArea || !loadingArea || !emailSentArea) {
    console.warn("ContadorAI: Faltan elementos clave en el DOM. Script detenido.");
    return;
  }

  let ultimoEmailEnviado = "";

  // Estado inicial
  emailSentArea.style.display = "none";
  loadingArea.style.display = "none";

  function esEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function enviarCorreoDemo(email) {
    // 1. Capturamos el token inyectado por el widget de Cloudflare Turnstile
    const tokenElement = document.querySelector('[name="cf-turnstile-response"]');
    const turnstileToken = tokenElement ? tokenElement.value : "";

    if (!turnstileToken) {
      throw new Error("Por favor, completa la validación de seguridad (Captcha).");
    }

    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: email,
        turnstile_token: turnstileToken // Enviamos el token al backend
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.json().catch(() => ({}));
      throw new Error(detalle.detail || "No se pudo procesar la solicitud.");
    }

    return respuesta.json();
  }

  async function manejarEnvio(email) {
    // Bloqueamos la interfaz para evitar clicks dobles (Race Conditions)
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
      alert("Hubo un problema: " + error.message);
    } finally {
      // Liberamos los controles independientemente del resultado
      demoBtn.disabled = false;
      emailInput.disabled = false;
      emailInput.focus();

      // 2. Reseteamos el Captcha. Vital para evitar que envíe un token ya consumido
      // si el usuario comete un error y vuelve a intentarlo.
      if (typeof turnstile !== 'undefined') {
        turnstile.reset();
      }
    }
  }

  // --- Event Listeners ---
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

  // Secundarios
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
