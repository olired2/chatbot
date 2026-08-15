# 🎓 MentorBot - Plataforma Educativa Inteligente

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

**MentorBot** es una plataforma de educación digital (SaaS) potenciada por Inteligencia Artificial, diseñada para asistir a docentes y estudiantes mediante un entorno de aprendizaje altamente interactivo. El núcleo del sistema es un asistente virtual impulsado por Modelos de Lenguaje de Gran Escala (LLM) que funciona bajo el paradigma **RAG (Generación Aumentada por Recuperación)**, garantizando que el bot ofrezca tutorías estrictamente basadas en el temario proporcionado por el profesor.

---

## 🚀 Arquitectura y Tecnologías

El proyecto está construido bajo una arquitectura moderna, orientada a la escalabilidad y al rendimiento en tiempo real:

- ⚛️ **Frontend y Núcleo:** Next.js 14 (React) con el enrutador de aplicaciones (*App Router*).
- ⚙️ **Backend:** Rutas de API de Next.js (Funciones *Serverless*).
- 🗄️ **Base de Datos:** MongoDB (NoSQL) con Mongoose para la esquematización y validación de datos.
- 🔐 **Autenticación:** NextAuth.js con manejo de credenciales propias, cifrado de contraseñas mediante `bcryptjs` y protección contra falsificación de peticiones entre sitios (CSRF).
- 🧠 **Motor de Inteligencia Artificial:** Groq (Llama 3.3 70B) para las respuestas del chat, con embeddings de Gemini (`embedding-001`) y búsqueda vectorial en MongoDB para el RAG. `persona.ts` arma el system prompt del especialista por clase con memoria conversacional.
- 📧 **Servicio de Correos (SMTP):** Automatización mediante Nodemailer.
- 🎨 **Estilos y Diseño:** Tailwind CSS.

---

## 🔑 Características Principales

### 1. 🤖 Sistema RAG de Chatbot Aislado (*Sandboxed*)
A diferencia de un modelo de lenguaje de propósito general, MentorBot incluye un sistema estricto de restricciones mediante instrucciones de sistema (*System Prompts*). La IA tiene terminantemente prohibido contestar preguntas que no pertenezcan al contexto de los documentos proporcionados por el docente. Si un estudiante intenta desviar la conversación, la IA lo redirige amablemente al enfoque académico.

### 2. 📉 Gestión de Deserción Escolar (Correos Automatizados)
El sistema cuenta con un algoritmo que analiza la base de datos de actividad de los estudiantes.
- **Regla de Negocio:** Todo estudiante con inactividad igual o mayor a 15 días es agrupado en el "Panel de Prevención".
- **Acción:** El docente dispone de una interfaz gráfica para enviar notificaciones masivas de motivación (*Nudges* o recordatorios) con un solo clic. El historial de envíos queda registrado en la base de datos con su respectivo estado de entrega.

### 3. 🎟️ Códigos de Clase Únicos
Los docentes crean entornos virtuales (Clases) que generan un identificador de vinculación criptográfico. Los estudiantes se registran de manera aislada y utilizan estos códigos para obtener acceso a los materiales y al asistente de su respectiva clase, manteniendo los datos completamente segregados.

### 4. 🛡️ Seguridad y Recuperación de Accesos
- Múltiples rondas de cifrado con sal (*salt*) utilizando `bcryptjs` para proteger las contraseñas en la base de datos.
- Recuperación de contraseñas mediante identificadores criptográficos perecederos (1 hora de validez) enviados a través del servicio SMTP.

---

## 👤 Matriz de Control de Acceso Basado en Roles (RBAC)

La plataforma distingue estrictamente tres roles operativos:

### 1. 🛠️ Administrador (Mantenimiento Global)
- Gestiona el backend y la base de datos a un nivel técnico profundo.
- Monitorea el consumo de la API de Inteligencia Artificial para el control de costos operativos.
- Audita la integridad de la base de datos y provee accesos o resoluciones manuales en caso de contingencias.

### 2. 👨‍🏫 Docente (Creador de Contexto)
- Permisos completos de gestión (Crear, Leer, Actualizar, Eliminar) limitados exclusivamente al entorno de las clases de las que es propietario.
- Responsable de alimentar la base de conocimiento vectorial de la Inteligencia Artificial mediante la carga de archivos de texto o documentos PDF.
- Cuenta con un panel exclusivo de métricas para la detección temprana de alumnos inactivos o en riesgo.

### 3. 👨‍🎓 Estudiante (Consumidor de Contexto)
- Su rol está limitado al modo de lectura y a la interacción directa con el Chatbot.
- Entorno completamente aislado: un estudiante no tiene forma dentro del sistema de saber qué otros estudiantes están inscritos en su clase.
- Toda su actividad genera datos de telemetría para las estadísticas del docente (como el cálculo de inactividad).

---

## 🛠️ Instalación y Configuración para Desarrollo

Si deseas ejecutar este proyecto en tu entorno local, sigue las siguientes instrucciones:

### 1. 📋 Prerrequisitos
- Node.js versión 18 o superior.
- Instancia de MongoDB ejecutándose en el puerto 27017 (o URL remota de MongoDB Atlas).

### 2. ⚙️ Variables de Entorno
Clona el archivo `.env.example` a `.env` e incluye las siguientes configuraciones:

```env
MONGODB_URI=mongodb://localhost:27017/mentorbot
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<tu_secreto_generado>
GROQ_API_KEY=<tu_clave_de_groq>
GOOGLE_API_KEY=<tu_clave_de_google_para_embeddings>
CRON_SECRET_TOKEN=<token_para_llamadas_internas>
SMTP_USER=<correo_sistema>
SMTP_PASS=<password_aplicacion>
NEXT_PUBLIC_STORAGE_MODE=local
```

Ver `.env.example` para la lista completa de variables (incluye correo, cron jobs y almacenamiento de documentos).

### 3. 🚀 Puesta en Marcha

```bash
# Instalar todas las dependencias requeridas
npm install

# Iniciar el servidor en modo de desarrollo
npm run dev
```

El proyecto estará disponible en el puerto indicado por la terminal (usualmente `http://localhost:3000`).
