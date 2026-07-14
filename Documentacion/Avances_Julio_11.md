#  Bitácora de Desarrollo - MentorBot
**Fecha:** 11 de Julio de 2026

## Lo que desarrollé, corregí y mejoré hoy

### 1. Migración a Google Gemini (IA)
* **Mejora:** Reemplacé el sistema de embeddings básico por la API oficial de **Google Generative AI** (`text-embedding-004`). 
* **Impacto:** Ahora el procesamiento de los PDFs de las clases es muchísimo más rápido y preciso. Además, dejé configurado un sistema de respaldo (fallback) por si en algún momento falla la API de Google, para que la plataforma nunca se caiga.

### 2. Flujo de Registro y Verificación de Correos
* **Corrección:** Arreglé el sistema de Pre-Registro. Ahora, cuando alguien marca la casilla "Soy Maestro", el sistema exige correctamente el código secreto (`MentorBot2026`) y asigna el rol correcto en la base de datos.
* **Solución de Bug:** Había un problema donde el enlace de verificación apuntaba a Vercel en lugar del entorno local. Ajusté las variables de entorno (`NEXT_PUBLIC_APP_URL` y `BASE_URL`) a `http://localhost:3001` para que las pruebas locales funcionen perfectamente.
* **Integración Real:** Vinculé mi cuenta de Gmail utilizando una **Contraseña de Aplicación** oficial de Google. Ahora la plataforma envía correos electrónicos *reales* de verificación a los usuarios.

### 3. Panel de Conexión en Vivo para Profesores
* **Desarrollo:** Modifiqué el esquema de la base de datos (`UserModel`) para agregar el campo `lastActive`. Este campo registra el momento exacto en el que un alumno inicia sesión o interactúa con el chatbot.
* **UI/UX:** Agregué un panel visual en la vista de la clase del profesor. Ahora puedo ver exactamente cuándo fue la "Última conexión" de un alumno y programé un indicador visual (una bolita verde parpadeante de **Conectado ahora**) que se activa si el alumno tuvo actividad en los últimos 5 minutos.

### 4. Estabilización de Base de Datos y Servidor
* **Mantenimiento:** Creé scripts de limpieza profunda en MongoDB para vaciar la base de datos `residencia` y hacer pruebas desde cero sin datos residuales.
* **Puertos:** Solucioné un conflicto de procesos fantasma moviendo el servidor de desarrollo seguro al puerto `3001`.
* **Despliegue Vercel:** Corregí errores de "Static Generation" agregando `export const dynamic = 'force-dynamic'` en mis rutas API, preparando el terreno para que Vercel no falle al momento de compilar.

---

## Bugs Críticos Encontrados y Solucionados

Durante las pruebas, Encontre varios problemas:

1. **El Bug de "Credenciales Inválidas" (Cuentas Congeladas):**
   * **El problema:** Al intentar iniciar sesión, el sistema decía "Credenciales inválidas" aunque la contraseña estuviera bien. Esto ocurría porque el enlace de verificación enviado al correo apuntaba a Vercel en vez de a `localhost`. Al hacer clic en el enlace, el servidor local nunca se enteraba y la cuenta se quedaba "atascada" en la colección de `preregistrations` de la base de datos, sin crearse como usuario oficial.
   * **Solución:** Se corrigió el archivo `.env` (`NEXT_PUBLIC_APP_URL` a puerto 3001) y se forzó la verificación de la cuenta manualmente inyectando comandos directos a MongoDB.

2. **El Bug del Rol "Estudiante" Atrapado:**
   * **El problema:** Al intentar volver a registrar una cuenta existente marcando la casilla "Soy Maestro", el sistema simplemente lo ignoraba para evitar duplicados y dejaba a la persona atrapada con el rol de "Estudiante" original.
   * **Solución:** Se arregló reseteando y vaciando completamente la base de datos con scripts para permitir pruebas de registro desde cero con roles limpios.

3. **El Conflicto del Puerto 3000 ("Cannot GET"):**
   * **El problema:** De repente la página dejó de cargar y Chrome mostraba un mensaje plano de `Cannot GET /auth/register`.
   * **Solución:** Descubrimos mediante la consola que un proceso "fantasma" en la computadora se había quedado trabado ocupando el puerto 3000. La solución inmediata fue reconfigurar y levantar Next.js en el puerto **3001**.

4. **Fallo de Google SMTP (`BadCredentials`):**
   * **El problema:** La terminal arrojaba un error 500 al intentar registrar usuarios, diciendo `535-5.7.8 Username and Password not accepted`. Google estaba bloqueando nuestro sistema por seguridad.
   * **Solución:** Tuvimos que activar la Verificación en 2 pasos en Gmail, generar una "Contraseña de Aplicación" especial de 16 caracteres y reconfigurar nuestras variables `SMTP_USER` y `SMTP_PASS`.

---

## Lo que todavía falta (Siguientes Pasos)

Para dar seguir avanzando, me quedan pendientes las siguientes tareas:

1. **Despliegue a Producción (La Nube):**
   * Crear una base de datos real en la nube usando **MongoDB Atlas**.
   * Subir el código fuente a **GitHub**.
   * Desplegar el proyecto final en **Vercel** y configurar todas las variables del `.env` en su panel.

2. **Automatización de Tareas (Cron Jobs):**
   * Una vez en Vercel, probar y verificar que el archivo `vercel.json` dispare exitosamente los **Correos Motivacionales** a los alumnos inactivos todos los días de forma autónoma.

3. **Recuperación de Contraseñas:**
   * Desarrollar la lógica del backend para las rutas de "Olvidé mi contraseña" (`forgot-password` y `reset-password`), permitiendo a los usuarios cambiar sus credenciales de forma segura.

4. **Pruebas de Estrés del Chatbot:**
   * Subir diferentes tipos de documentos PDF complejos para evaluar cómo el modelo extrae el texto y afinar el *System Prompt* de Groq si es necesario para asegurar respuestas siempre perfectas.

