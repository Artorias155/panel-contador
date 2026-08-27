# ContadorAI - Backend de envío de correo (demo)

Backend mínimo en **FastAPI** que recibe un email desde el frontend
(`script.js`) y envía un correo de prueba real usando **Gmail SMTP**.

## 1. Instalar dependencias

```bash
cd backend
python -m venv venv
source venv/bin/activate      # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configurar credenciales de Gmail

1. Activá la verificación en 2 pasos en tu cuenta de Gmail.
2. Generá una "Contraseña de aplicación" en:
   https://myaccount.google.com/apppasswords
3. Copiá `.env.example` como `.env`:

```bash
cp .env.example .env
```

4. Completá `GMAIL_USER` y `GMAIL_APP_PASSWORD` con tus datos reales,
   y `FRONTEND_ORIGIN` con la URL desde donde vas a abrir el `index.html`
   (por ejemplo `http://127.0.0.1:5500` si usás Live Server de VS Code).

## 3. Levantar el servidor

```bash
uvicorn main:app --reload --port 8000
```

Vas a ver algo como:

```
Uvicorn running on http://127.0.0.1:8000
```

## 4. Conectar el frontend

En `script.js` ya está apuntando a:

```js
const API_URL = "http://localhost:8000/enviar-notificacion";
```

Con el backend corriendo, abrí tu `index.html` (por ejemplo con Live Server),
escribí un email real en el input y hacé clic en "Ver Demo en Vivo".
Deberías recibir el correo de prueba en esa casilla en pocos segundos.

## 5. Errores comunes

- **"No se pudo autenticar con Gmail"**: revisá que estés usando una
  *contraseña de aplicación* (16 caracteres) y no la contraseña normal
  de tu cuenta.
- **Error de CORS en la consola del navegador**: asegurate de que
  `FRONTEND_ORIGIN` en `.env` coincida exactamente con el origen desde
  el que abrís el HTML (protocolo + dominio + puerto).
- **Mixed content**: si tu HTML se sirve por `https://`, el backend
  también debe estar detrás de `https://` (no se puede llamar a
  `http://` desde una página `https://`).

## 6. Para producción

Gmail SMTP es perfecto para una demo, pero tiene límites de envío
diario y no está pensado para volumen alto. Si esto pasa a producción,
considerá un proveedor transaccional como SendGrid, Amazon SES,
Resend o Postmark, y desplegar este backend detrás de HTTPS (por
ejemplo en Render, Railway, Fly.io o un VPS con Nginx + certificado SSL).
