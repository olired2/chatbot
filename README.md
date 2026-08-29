<<<<<<< HEAD
# 🤖 MentorBot - Sistema de Chat Educativo con IA

Sistema educativo inteligente que permite a estudiantes interactuar con documentos de clase a través de un agente virtual con inteligencia artificial.

## ✨ Características Principales

- 🎓 **Gestión de Clases**: Profesores pueden crear clases y subir documentos
- 📚 **Chat Inteligente**: IA que responde basándose en documentos de clase
- 👥 **Roles de Usuario**: Sistema completo para maestros y estudiantes
- 📊 **Analytics**: Reportes y estadísticas de participación
- 📧 **Emails Automatizados**: Sistema de correos motivacionales
- 🔐 **Autenticación Completa**: Login, registro, verificación de email, recuperación de contraseña

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB con Mongoose
- **IA**: GROQ API (LLama 3.3), Google Generative AI, ChromaDB
- **Autenticación**: NextAuth.js
- **Email**: Nodemailer
- **Procesamiento**: PDF parsing, embeddings semánticos

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone [URL_DEL_REPO]
cd residencia
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:

```env
# Base Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_super_seguro_de_32_caracteres_minimo

# Database
MONGODB_URI=mongodb://localhost:27017/mentorbot

# AI Services
GROQ_API_KEY=tu_groq_api_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

### 4. Ejecutar el proyecto
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## 🎯 Funcionalidades por Rol

### 👨‍🏫 Maestro
- Crear y gestionar clases
- Subir documentos (PDF)
- Ver analytics de participación
- Generar reportes
- Gestionar correos motivacionales

### 🎓 Estudiante  
- Unirse a clases con código
- Chat inteligente con documentos
- Ver clases disponibles
- Recibir correos motivacionales

## 🔒 Características de Seguridad

- Autenticación completa con NextAuth.js
- Verificación de email obligatoria
- Tokens seguros para reset de contraseña
- Validación de roles y permisos
- Protección de endpoints de API

## 📊 Sistema de IA

- **Embeddings Semánticos**: Procesamiento inteligente de documentos
- **ChromaDB**: Base de datos vectorial para búsquedas semánticas
- **GROQ API**: Generación de respuestas con LLama 3.3
- **Análisis Contextual**: IA adaptativa según la materia y documentos

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno
3. Deploy automático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Desarrollado con ❤️ para la educación**
=======
# 🎓 MentorBot - Plataforma Educativa Inteligente

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
