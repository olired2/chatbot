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
