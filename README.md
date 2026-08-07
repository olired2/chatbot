# 🎓 MentorBot - Plataforma Educativa Inteligente

MentorBot es una plataforma de educación digital (SaaS) potenciada por Inteligencia Artificial, diseñada para asistir a maestros y alumnos mediante un entorno de aprendizaje altamente interactivo. El núcleo del sistema es un asistente virtual impulsado por Modelos de Lenguaje Grande (LLM) que funciona bajo el paradigma **RAG (Retrieval-Augmented Generation)**, garantizando que el bot ofrezca tutorías estrictamente basadas en el temario del profesor.

---

## 🚀 Arquitectura y Stack Tecnológico

El proyecto está construido bajo una arquitectura moderna, orientada a la escalabilidad y al rendimiento en tiempo real:
* **Frontend / Framework Core:** Next.js 14 (React) con App Router.
* **Backend:** Next.js API Routes (Serverless Functions).
* **Base de Datos:** MongoDB (NoSQL) con Mongoose para esquematización y validación.
* **Autenticación:** NextAuth.js con manejo de credenciales propias, cifrado de contraseñas con `bcryptjs` y protección CSRF.
* **Motor de IA:** OpenAI API integrado con LangChain (Arquitectura RAG para análisis de PDFs y documentos vectoriales).
* **Servicio de Correos (SMTP):** Nodemailer automatizado.
* **Estilos:** Tailwind CSS.

---

## 🔑 Características Principales

### 1. Sistema RAG de Chatbot "Sandboxed" (Acorralado)
A diferencia de un LLM generalista, MentorBot incluye un sistema estricto de restricciones sistémicas (System Prompts). La IA tiene terminantemente prohibido contestar preguntas que no pertenezcan al contexto de los documentos proporcionados por el maestro. Si un estudiante intenta desviar la conversación, la IA lo redirige amablemente al enfoque académico.

### 2. Gestión de Deserción Escolar (Correos Automatizados)
El sistema cuenta con un algoritmo que escanea la base de datos de actividad de los estudiantes.
* **Regla de Negocio:** Todo estudiante con inactividad igual o mayor a 15 días es agrupado en el "Panel de Prevención".
* **Acción:** El maestro cuenta con una interfaz gráfica para enviar notificaciones masivas de motivación ("Nudges") con un solo clic. El historial de envíos queda registrado en la base de datos con su respectivo estado.

### 3. Códigos de Clase Unívocos
Los maestros crean contenedores virtuales (Clases) que generan un ID de vinculación criptográfico. Los estudiantes se registran de manera aislada y utilizan estos códigos para tener acceso a los materiales y al asistente de su respectiva clase, manteniendo los datos segregados.

### 4. Seguridad y Recuperación de Accesos
* Múltiples rondas de hashing salado (`bcryptjs`) protegiendo las contraseñas en la base de datos.
* Recuperación de contraseñas mediante Tokens criptográficos perecederos (1 hora de validez) enviados vía SMTP.

---

## 👤 Matriz de Control de Acceso Basado en Roles (RBAC)

La plataforma distingue estrictamente 3 roles operativos:

1. **Administrador (Mantenimiento Global)**
   * Gestiona el backend y la base de datos a un nivel técnico.
   * Monitorea el flujo de consumo de la API de Inteligencia Artificial para el control de costos.
   * Audita la integridad de la base de datos y provee accesos o resoluciones manuales en caso de contingencia.

2. **Maestro (Creador de Contexto)**
   * Permisos tipo CRUD (Create, Read, Update, Delete) limitados exclusivamente al contexto de las clases de las que es propietario.
   * Responsable de alimentar el vector de conocimiento de la Inteligencia Artificial mediante subida de archivos de texto o PDFs.
   * Cuenta con un panel exclusivo de métricas para la detección temprana de alumnos inactivos.

3. **Estudiante (Consumidor del Contexto)**
   * Su rol está limitado al modo lectura e interacción con el Chatbot.
   * Entorno completamente asilado: un estudiante no tiene forma sistémica de saber qué otros estudiantes están en su clase.
   * Toda su actividad genera telemetría para las estadísticas del maestro (cálculo de inactividad).

---

## 🛠️ Instalación y Configuración para Desarrollo

Si deseas ejecutar este proyecto en tu entorno local, sigue las siguientes instrucciones:

### 1. Prerrequisitos
* Node.js v18 o superior.
* Instancia de MongoDB ejecutándose en el puerto 27017 (o URL remota de MongoDB Atlas).

### 2. Variables de Entorno
Clonar el archivo `.env.example` (si aplica) a `.env` e incluir:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/mentorbot
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<tu_secreto_generado>
OPENAI_API_KEY=<tu_clave_de_openai>
SMTP_USER=<correo_sistema>
SMTP_PASS=<password_aplicacion>
\`\`\`

### 3. Puesta en Marcha
\`\`\`bash
# Instalar dependencias
npm install

# Correr el entorno de desarrollo
npm run dev
\`\`\`
El proyecto estará disponible en el puerto indicado por la terminal (usualmente \`http://localhost:3000\`).
