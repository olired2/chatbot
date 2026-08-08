# Configuración de Variables de Entorno para Vercel

Para desplegar este proyecto en Vercel, necesitas configurar las siguientes variables de entorno en tu panel de control de Vercel:

## Variables Requeridas:

### Base de Datos
- `MONGODB_URI`: Tu cadena de conexión de MongoDB Atlas
- `MONGO_DBNAME`: Nombre de tu base de datos

### Autenticación
- `NEXTAUTH_URL`: URL de producción (ej: https://tu-app.vercel.app)
- `NEXTAUTH_SECRET`: Token secreto para NextAuth (genera uno nuevo para producción)

### APIs Externas
- `GOOGLE_API_KEY`: Clave de API de Google
- `GROQ_API_KEY`: Clave de API de Groq AI (para chat)
- `JINA_API_KEY`: Clave de API de Jina AI (para embeddings - gratuita)

### Supabase (Búsqueda Vectorial)
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de Rol de Servicio de Supabase (para almacenar embeddings)

### Configuración de Correo Electrónico
- `EMAIL_FROM`: Correo electrónico desde el cual enviar correos
- `EMAIL_HOST`: Servidor SMTP (ej: smtp.gmail.com)
- `EMAIL_PORT`: Puerto SMTP (ej: 587)
- `EMAIL_USER`: Usuario del correo electrónico
- `EMAIL_PASS`: Contraseña de aplicación del correo electrónico

### SMTP para Verificación
- `SMTP_HOST`: Servidor SMTP
- `SMTP_PORT`: Puerto SMTP
- `SMTP_USER`: Usuario SMTP
- `SMTP_PASS`: Contraseña SMTP

### Seguridad
- `CRON_SECRET_TOKEN`: Token secreto para trabajos programados (cron jobs)

### Desarrollo
- `NEXT_PRIVATE_DISABLE_TURBO`: Configurar como `1` si es necesario

## Cómo configurar en Vercel:

1. Ve a tu proyecto en el Panel de Control de Vercel
2. Navega a Configuración (Settings) → Variables de Entorno (Environment Variables)
3. Añade cada variable con su valor correspondiente
4. Selecciona los entornos donde aplicar (Producción, Vista Previa, Desarrollo)

## Notas de Seguridad:
- NUNCA subas el archivo `.env.local` al repositorio
- Genera nuevos secretos para producción
- Usa contraseñas de aplicación para Gmail
- Mantén las claves de API seguras