"""
ContadorAI - Backend de envío de correo de prueba
==================================================

Este backend expone un único endpoint:

    POST /enviar-notificacion
    body: { "email": "destinatario@gmail.com" }

Envía un correo de prueba (HTML) a la dirección indicada, usando
una cuenta de Gmail con "Contraseña de aplicación" (App Password).

CÓMO CONFIGURARLO
------------------
1. Necesitás una cuenta de Gmail con verificación en 2 pasos activada.
2. Generá una "Contraseña de aplicación" en:
   https://myaccount.google.com/apppasswords
   (elegí "Correo" / "Otra app" -> te da 16 caracteres, sin espacios)
3. Creá un archivo ".env" en esta misma carpeta (basate en .env.example)
   con:
       GMAIL_USER=tu_cuenta@gmail.com
       GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
       FRONTEND_ORIGIN=http://localhost:5500   (o donde sirvas tu HTML)

4. Instalá dependencias:
       pip install -r requirements.txt

5. Corré el servidor:
       uvicorn main:app --reload --port 8000

   Esto deja el backend escuchando en http://localhost:8000
   que es exactamente lo que espera script.js (API_URL).

NOTA DE SEGURIDAD
------------------
- Nunca subas el archivo .env a un repositorio público (ya viene
  ignorado si usás el .gitignore sugerido).
- Gmail tiene límites de envío (~500 correos/día en cuentas normales),
  suficiente para una demo pero no para un mailing masivo. Para producción
  real con volumen alto, considerá un proveedor transaccional
  (SendGrid, Amazon SES, Resend, Postmark, etc.) en vez de SMTP de Gmail.
"""

import os
import re
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465  # SSL directo (más simple que STARTTLS en 587)

app = FastAPI(title="ContadorAI - Backend de Notificaciones")

# CORS: permite que el HTML (servido desde otro origen) pueda llamar a este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


class NotificacionRequest(BaseModel):
    email: EmailStr


def construir_correo(destinatario: str) -> MIMEMultipart:
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "ContadorAI - Correo de prueba"
    mensaje["From"] = GMAIL_USER
    mensaje["To"] = destinatario

    texto_plano = (
        "¡Hola!\n\n"
        "Este es un correo de prueba enviado desde la demo de ContadorAI.\n"
        "Si lo recibiste, la integración de envío de correos funciona correctamente.\n\n"
        "Saludos,\nEquipo ContadorAI"
    )

    html = f"""
    <html>
      <body style="font-family: Inter, Arial, sans-serif; background:#f4f6f8; padding:24px;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
          <h2 style="color:#111827;">✅ Correo de prueba de ContadorAI</h2>
          <p style="color:#374151;font-size:15px;line-height:1.5;">
            ¡Hola! Este es un correo de prueba enviado desde la demo interactiva
            de <strong>ContadorAI</strong>.
          </p>
          <p style="color:#374151;font-size:15px;line-height:1.5;">
            Si estás leyendo esto, la integración de envío de correos
            está funcionando correctamente para <strong>{destinatario}</strong>.
          </p>
          <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
            Este correo fue generado automáticamente. No es necesario responder.
          </p>
        </div>
      </body>
    </html>
    """

    mensaje.attach(MIMEText(texto_plano, "plain"))
    mensaje.attach(MIMEText(html, "html"))
    return mensaje


def enviar_email_smtp(destinatario: str) -> None:
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        raise RuntimeError(
            "Faltan credenciales: definí GMAIL_USER y GMAIL_APP_PASSWORD en el .env"
        )

    mensaje = construir_correo(destinatario)
    contexto = ssl.create_default_context()

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=contexto) as servidor:
        servidor.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        servidor.sendmail(GMAIL_USER, destinatario, mensaje.as_string())


@app.post("/enviar-notificacion")
def enviar_notificacion(payload: NotificacionRequest):
    destinatario = payload.email.strip()

    # Validación extra por las dudas (Pydantic ya valida el formato con EmailStr)
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", destinatario):
        raise HTTPException(status_code=400, detail="El email indicado no es válido.")

    try:
        enviar_email_smtp(destinatario)
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo autenticar con Gmail. Verificá GMAIL_USER y "
                "GMAIL_APP_PASSWORD (debe ser una contraseña de aplicación, "
                "no la contraseña normal de la cuenta)."
            ),
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"No se pudo enviar el correo: {e}"
        )

    return {"ok": True, "mensaje": f"Correo enviado correctamente a {destinatario}"}


@app.get("/")
def health_check():
    return {"status": "ContadorAI backend activo"}
