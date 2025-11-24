# Configuración del Cron Job para Correos Automáticos

## Resumen del Sistema
El sistema de correos motivacionales automáticos ya está implementado y listo para usar. Aquí tienes las instrucciones para configurarlo completamente.

## 1. Configuración de Variables de Entorno
Edita el archivo `.env.local` con tus credenciales reales de correo:

```env
EMAIL_FROM="chatbot-mentor@residencia.edu"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="tu-email-real@gmail.com"
EMAIL_PASS="tu-app-password-de-gmail"
CRON_SECRET_TOKEN="mi-token-secreto-super-seguro-2024"
```

## 2. Configuración de Gmail para App Password
1. Ve a tu cuenta de Google
2. Habilita la autenticación de 2 factores
3. Ve a "Contraseñas de aplicaciones"
4. Genera una contraseña específica para esta aplicación
5. Usa esa contraseña en `EMAIL_PASS`

## 3. Endpoints Disponibles

### Manual (Dashboard)
- **URL**: http://localhost:3000/dashboard/emails
- **Función**: Gestión manual de correos motivacionales
- **Características**:
  - Ver estadísticas de correos enviados
  - Enviar correos manualmente
  - Revisar estudiantes inactivos

### Automático (Cron)
- **URL**: http://localhost:3000/api/cron/motivational-emails
- **Método**: POST
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer mi-token-secreto-super-seguro-2024
  ```
- **Función**: Ejecutión automática diaria

## 4. Configuración del Cron Job

### Opción A: Cron Job en Linux/macOS
```bash
# Ejecutar diariamente a las 9:00 AM
0 9 * * * curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mi-token-secreto-super-seguro-2024" \
  http://localhost:3000/api/cron/motivational-emails
```

### Opción B: Programador de Tareas de Windows
1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Configurar para ejecutar diariamente
4. Acción: Iniciar programa
5. Programa: `curl`
6. Argumentos:
```
-X POST -H "Content-Type: application/json" -H "Authorization: Bearer mi-token-secreto-super-seguro-2024" http://localhost:3000/api/cron/motivational-emails
```

### Opción C: Servicio de Cron Online (Recomendado para producción)
Usar servicios como:
- **cron-job.org**: Gratis, fácil configuración
- **EasyCron**: Interfaz web amigable
- **Vercel Cron** (si despliegas en Vercel)

Configuración en cron-job.org:
1. Registro en https://cron-job.org
2. Crear nuevo cron job
3. URL: `http://tu-dominio.com/api/cron/motivational-emails`
4. Método: POST
5. Headers: 
   - `Content-Type: application/json`
   - `Authorization: Bearer mi-token-secreto-super-seguro-2024`
6. Frecuencia: Diaria a las 9:00 AM

## 5. Lógica del Sistema

### Detección de Inactividad
- El sistema revisa todos los estudiantes
- Identifica quienes no han interactuado en 15+ días
- Evita enviar correos duplicados (cooldown de 7 días)

### Plantillas de Correo
El sistema incluye 2 plantillas motivacionales:
1. **Primera interacción**: Para estudiantes nuevos inactivos
2. **Reactivación**: Para estudiantes que ya habían usado el sistema

### Seguimiento
- Todos los correos se registran en MongoDB
- Se pueden ver estadísticas en el dashboard
- Se previenen correos duplicados automáticamente

## 6. Prueba del Sistema

### Prueba Manual
1. Ve a http://localhost:3000/dashboard/emails
2. Click en "Enviar Correos Ahora"
3. Revisa la consola para ver los logs

### Prueba del Cron
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mi-token-secreto-super-seguro-2024" \
  http://localhost:3000/api/cron/motivational-emails
```

## 7. Monitoreo y Logs
- Los logs aparecen en la consola del servidor
- Los errores se registran automáticamente
- El dashboard muestra estadísticas en tiempo real

## Notas Importantes
- ⚠️ **Producción**: Cambia `localhost:3000` por tu dominio real
- 🔒 **Seguridad**: Mantén el `CRON_SECRET_TOKEN` secreto
- 📧 **Límites**: Gmail tiene límites de envío (500 correos/día para cuentas normales)
- 🕒 **Zona Horaria**: Los cron jobs usan UTC, ajusta según tu zona horaria

¡El sistema está listo para funcionar automáticamente!