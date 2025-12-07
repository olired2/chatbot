# Configuración de Variables de Entorno para Vercel

Para desplegar este proyecto en Vercel, necesitas configurar las siguientes variables de entorno en tu dashboard de Vercel:

## Variables Requeridas:

### Base de Datos
- `MONGODB_URI`: Tu string de conexión de MongoDB Atlas
- `MONGO_DBNAME`: Nombre de tu base de datos

### Autenticación
- `NEXTAUTH_URL`: URL de producción (ej: https://tu-app.vercel.app)
- `NEXTAUTH_SECRET`: Token secreto para NextAuth (genera uno nuevo para producción)

### APIs Externas
- `GOOGLE_API_KEY`: API Key de Google
- `GROQ_API_KEY`: API Key de Groq AI (para chat)
- **Jina AI**: Embeddings gratis (no requiere API key)

### Supabase (Vector Search)
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key de Supabase (para almacenar embeddings)

### Configuración de Email
- `EMAIL_FROM`: Email desde el cual enviar correos
- `EMAIL_HOST`: Servidor SMTP (ej: smtp.gmail.com)
- `EMAIL_PORT`: Puerto SMTP (ej: 587)
- `EMAIL_USER`: Usuario del email
- `EMAIL_PASS`: Contraseña de aplicación del email

### SMTP para Verificación
- `SMTP_HOST`: Servidor SMTP
- `SMTP_PORT`: Puerto SMTP
- `SMTP_USER`: Usuario SMTP
- `SMTP_PASS`: Contraseña SMTP

### Seguridad
- `CRON_SECRET_TOKEN`: Token secreto para cron jobs

### Desarrollo
- `NEXT_PRIVATE_DISABLE_TURBO`: Configurar como `1` si es necesario

## Cómo configurar en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a Settings → Environment Variables
3. Añade cada variable con su valor correspondiente
4. Selecciona los entornos donde aplicar (Production, Preview, Development)

## Notas de Seguridad:
- NUNCA subas el archivo `.env.local` al repositorio
- Genera nuevos secretos para producción
- Usa contraseñas de aplicación para Gmail
- Mantén las API keys seguras