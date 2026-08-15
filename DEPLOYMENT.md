# Configuración de Variables de Entorno para Vercel

Para desplegar este proyecto en Vercel, necesitas configurar las siguientes variables de entorno en tu panel de control de Vercel. Ver `.env.example` para la referencia completa.

## Variables Requeridas:

### Base de Datos
- `MONGODB_URI`: Tu cadena de conexión de MongoDB Atlas
- `MONGO_DBNAME`: Nombre de tu base de datos

### Autenticación
- `NEXTAUTH_URL`: URL de producción (ej: https://tu-app.vercel.app)
- `NEXTAUTH_SECRET`: Token secreto para NextAuth (genera uno nuevo para producción)

### APIs de IA
- `GROQ_API_KEY`: Clave de API de Groq (motor de las respuestas del chat)
- `GOOGLE_API_KEY`: Clave de API de Google (embeddings con Gemini para el RAG)

### Base URL de la Aplicación (usada en enlaces de correo y en el procesamiento interno de documentos)
- `NEXT_PUBLIC_APP_URL`: URL pública de la app (ej: https://tu-app.vercel.app)
- `BASE_URL`: Igual que la anterior

### Almacenamiento de Documentos
- `NEXT_PUBLIC_STORAGE_MODE`: `blob` en Vercel (el filesystem es de solo lectura en producción); `local` solo sirve para desarrollo o un servidor propio con disco persistente
- `BLOB_READ_WRITE_TOKEN`: Token de Vercel Blob (requerido cuando `NEXT_PUBLIC_STORAGE_MODE=blob`)

### Configuración de Correo Electrónico (correos motivacionales)
- `EMAIL_FROM`: Correo electrónico desde el cual enviar correos
- `EMAIL_HOST`: Servidor SMTP (ej: smtp.gmail.com)
- `EMAIL_PORT`: Puerto SMTP (ej: 587)
- `EMAIL_USER`: Usuario del correo electrónico
- `EMAIL_PASS`: Contraseña de aplicación del correo electrónico
- `EMAIL_SECURE`: `true`/`false` según el puerto SMTP

### SMTP para Verificación de Cuenta
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Igual que arriba; se usan para el correo de verificación de registro

### Seguridad
- `CRON_SECRET_TOKEN`: Token secreto para autenticar las llamadas internas (cron jobs y el procesamiento de documentos en background)

## Cómo configurar en Vercel:

1. Ve a tu proyecto en el Panel de Control de Vercel
2. Navega a Configuración (Settings) → Variables de Entorno (Environment Variables)
3. Añade cada variable con su valor correspondiente
4. Si usas `NEXT_PUBLIC_STORAGE_MODE=blob`, crea un almacén de Vercel Blob desde la pestaña Storage del proyecto — el `BLOB_READ_WRITE_TOKEN` se genera automáticamente
5. Selecciona los entornos donde aplicar (Producción, Vista Previa, Desarrollo)

## Notas de Seguridad:
- NUNCA subas los archivos `.env` o `.env.local` al repositorio
- Genera nuevos secretos (`NEXTAUTH_SECRET`, `CRON_SECRET_TOKEN`) para producción, distintos de los de desarrollo
- Usa contraseñas de aplicación para Gmail, no la contraseña de la cuenta
- Si alguna clave o credencial llegó a commitearse por error, rótala de inmediato y purga el historial de git — cambiar el archivo no es suficiente una vez que el repositorio es público
