# 🏗️ Arquitectura del Agente Virtual Educativo - Cultura Empresarial

## 📋 Resumen Ejecutivo

Sistema educativo basado en **Next.js 16** con **Generación Aumentada por Recuperación (RAG)** que permite a profesores crear clases, subir documentos PDF y a estudiantes interactuar con un agente virtual inteligente alimentado por **Groq AI**.

---

## 🎯 Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Navegador)"
        UI[Componentes React]
        Forms[Formularios de Autenticación]
        Chat[Interfaz de Chat]
    end
    
    subgraph "Enrutador de Aplicación Next.js 16"
        Pages[Páginas/Rutas]
        API[Rutas API]
        Middleware[Middleware]
    end
    
    subgraph "Autenticación"
        NextAuth[NextAuth v4.24.11]
        JWT[Tokens JWT]
        Session[Sesiones de Servidor]
    end
    
    subgraph "Base de Datos"
        MongoDB[(MongoDB Atlas)]
        Models[Modelos Mongoose]
    end
    
    subgraph "IA & Procesamiento"
        Groq[API Groq AI]
        PDF[Procesamiento de PDF]
        Embeddings[Embeddings/RAG]
        ChromaDB[Archivos ChromaDB]
    end
    
    UI --> Pages
    Forms --> NextAuth
    Chat --> API
    Pages --> Session
    API --> Models
    Models --> MongoDB
    API --> Embeddings
    Embeddings --> Groq
    PDF --> ChromaDB
```

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **Framework**: Next.js 16.0.0 (Enrutador de Aplicación + Turbopack)
- **React**: 19.2.0 con Componentes de Servidor + Componentes de Cliente
- **Estilos**: Tailwind CSS 4.x
- **TypeScript**: v5 con tipado estricto
- **Formularios**: React Hook Form v7.65.0

### **Backend & API**
- **Entorno de Ejecución**: Node.js con Rutas API de Next.js
- **Autenticación**: NextAuth v4.24.11 (Estrategia JWT)
- **Base de Datos**: MongoDB Atlas + Mongoose 8.19.2
- **Validación**: Zod v4.1.12

### **IA & Procesamiento**
- **LLM**: API Groq (Llama 3.3 70B Versatile)
- **Procesamiento de PDF**: pdf2json v4.0.0
- **RAG**: Embeddings personalizados + Archivos ChromaDB
- **Almacenamiento Vectorial**: Archivos JSON en el sistema de archivos

---

## 📁 Estructura de Directorios

```
residencia/
├── 📂 src/
│   ├── 📂 app/                          # Enrutador de Aplicación Next.js 16
│   │   ├── 📂 api/                      # Rutas API
│   │   │   ├── 📂 auth/                 # Endpoints NextAuth
│   │   │   │   ├── 📂 [...nextauth]/    # Manejador NextAuth
│   │   │   │   └── 📂 register/         # Registro de usuarios
│   │   │   ├── 📂 classes/              # API de clases
│   │   │   │   ├── 📂 [classId]/        # APIs específicas por clase
│   │   │   │   │   ├── 📂 chat/         # Endpoint del agente virtual
│   │   │   │   │   │   └── 📂 history/  # Historial de chat
│   │   │   │   │   └── 📂 documents/    # Gestión de documentos
│   │   │   │   └── route.ts             # Crear/Leer/Actualizar/Borrar de clases
│   │   ├── 📂 auth/                     # Páginas de autenticación
│   │   │   ├── 📂 login/
│   │   │   └── 📂 register/
│   │   ├── 📂 dashboard/                # Panel principal
│   │   │   ├── 📂 classes/              # Gestión de clases
│   │   │   │   └── 📂 [classId]/        # Vista específica de clase
│   │   │   └── 📂 chat/                 # Vista de chat para estudiantes
│   │   ├── layout.tsx                   # Diseño raíz
│   │   ├── page.tsx                     # Página de inicio (redirección)
│   │   └── globals.css                  # Estilos globales
│   ├── 📂 components/                   # Componentes React
│   │   ├── 📂 auth/                     # Formularios de autenticación
│   │   ├── 📂 layouts/                  # Diseños reutilizables
│   │   ├── AgenteVirtual.tsx            # Interfaz de chat principal
│   │   ├── ClassesClient.tsx            # Lista de clases
│   │   ├── CreateClassModal.tsx         # Modal crear clase
│   │   ├── DocumentList.tsx             # Lista de documentos
│   │   └── UploadDocument.tsx           # Componente de subida
│   ├── 📂 lib/                          # Librerías y utilidades
│   │   ├── 📂 ai/                       # Lógica de IA
│   │   │   ├── mongodb-embeddings.ts    # Embeddings + búsqueda vectorial (MongoDB + Gemini)
│   │   │   └── persona.ts               # Personalidad especialista del bot por clase
│   │   ├── 📂 db/                       # Conexiones BD
│   │   │   ├── mongodb.ts               # Conexión MongoDB
│   │   │   └── mongodb-adapter.ts       # Adaptador NextAuth
│   │   └── 📂 utils/                    # Utilidades generales
│   ├── 📂 models/                       # Modelos Mongoose
│   │   ├── User.ts                      # Modelo Usuario
│   │   ├── Class.ts                     # Modelo Clase  
│   │   └── Interaction.ts               # Modelo Interacciones
│   └── 📂 types/                        # Tipos TypeScript
│       ├── next-auth.d.ts               # Tipos NextAuth
│       └── mongodb.ts                   # Tipos MongoDB
│
├── 📂 chroma_db/                        # Almacén de embeddings
│   └── 📂 [classId]/                    # Embeddings por clase
│       └── *.json                       # Fragmentos de documentos
├── 📂 uploads/                          # Archivos subidos
│   └── 📂 [classId]/                    # Archivos por clase
│       └── *.pdf                        # Documentos PDF
├── 📂 scripts/                          # Scripts de utilidad
├── package.json                         # Dependencias del proyecto
├── next.config.ts                       # Configuración Next.js
├── tsconfig.json                        # Configuración TypeScript  
├── tailwind.config.js                   # Configuración Tailwind
├── middleware.ts                        # Middleware Next.js
└── .env.local                           # Variables de entorno
```

---

## 🔐 Sistema de Autenticación

### **Configuración de NextAuth v4.24.11**

```typescript
// Estrategia JWT con credenciales personalizadas
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validación con bcrypt contra MongoDB
        const user = await UserModel.findOne({ email: credentials.email });
        const isValid = await compare(credentials.password, user.password);
        return isValid ? user : null;
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      // Incluir rol e ID en token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasar datos del token a la sesión
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  }
};
```

### **Roles y Permisos**

```typescript
// Tipos definidos en next-auth.d.ts
interface User {
  id: string;
  email: string;
  name: string;
  role: 'Maestro' | 'Estudiante';
}
```

**Maestro**:
- ✅ Crear clases con códigos únicos
- ✅ Subir documentos PDF
- ✅ Ver progreso de estudiantes
- ✅ Gestionar documentos de clase
- ✅ Monitorear interacciones

**Estudiante**:
- ✅ Registrarse en clases con código
- ✅ Chatear con IA usando documentos
- ✅ Ver historial de conversaciones
- ✅ Acceder solo a sus clases asignadas

---

## 🗄️ Modelos de Base de Datos

### **Modelo de Usuario (User)**
```typescript
interface IUser {
  _id: ObjectId;
  nombre: string;           // Nombre completo
  email: string;            // Email único
  password: string;         // Hash bcrypt
  rol: 'Maestro' | 'Estudiante';
  institucion: string;      // Institución educativa
  classes: ObjectId[];      // Referencias a clases
  registeredAt: Date;       // Fecha de registro
}
```

### **Modelo de Clase (Class)**
```typescript
interface IClass {
  _id: ObjectId;
  name: string;             // Nombre de la clase
  code: string;             // Código único de 6 caracteres
  teacher: ObjectId;        // Referencia a User (Maestro)
  students: ObjectId[];     // Arreglo de referencias a Users (Estudiantes)
  documents: {              // Documentos PDF subidos
    filename: string;
    originalName: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
}
```

### **Modelo de Interacción (Interaction)**
```typescript
interface IInteraction {
  _id: ObjectId;
  usuario_id: ObjectId;     // Referencia a User (Estudiante)
  clase_id: ObjectId;       // Referencia a Class
  pregunta: string;         // Pregunta del estudiante
  respuesta: string;        // Respuesta de la IA
  sources: string[];        // Fragmentos de documentos usados
  fecha: Date;              // Marca de tiempo de la interacción
}

// Índices para optimización
// - (usuario_id, fecha): Historial por usuario
// - (clase_id, fecha): Actividad por clase
```

---

## 🤖 Sistema de IA y RAG

### **Flujo de Procesamiento de Documentos**

```mermaid
sequenceDiagram
    participant M as Maestro
    participant API as API de Subida
    participant PDF as pdf2json
    participant FS as Sistema de Archivos
    participant DB as MongoDB
    
    M->>API: Subir PDF
    API->>PDF: Procesar PDF
    PDF->>PDF: Extraer texto
    PDF->>PDF: Dividir en fragmentos (1000 caracteres)
    PDF->>FS: Guardar en chroma_db/[classId]/
    API->>DB: Actualizar Class.documents[]
    API->>M: Respuesta de éxito
```

### **Flujo de Consulta (RAG)**

```mermaid
sequenceDiagram
    participant E as Estudiante
    participant API as API de Chat
    participant FS as Sistema de Archivos
    participant Groq as Groq AI
    participant DB as MongoDB
    
    E->>API: Enviar pregunta
    API->>FS: Cargar documentos de clase
    FS->>API: Retornar fragmentos de documento
    API->>API: Seleccionar 5 fragmentos más relevantes
    API->>Groq: Enviar contexto + pregunta
    Groq->>API: Retornar respuesta de la IA
    API->>DB: Guardar interacción
    API->>E: Retornar respuesta + fuentes
```

### **Configuración Groq AI**

```typescript
// Endpoint: https://api.groq.com/openai/v1/chat/completions
const groqConfig = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,           // Balance creatividad/precisión
  max_tokens: 1024,           // Respuestas concisas
  stream: false               // Respuesta completa
};

// Prompt del sistema
const MENTOR_PERSONA = `
Eres un mentor académico especializado en Cultura Empresarial.
Usa los documentos proporcionados como contexto principal.
Responde de manera educativa, clara y con ejemplos cuando sea apropiado.
Si la pregunta no está relacionada con el tema, redirige amablemente.
`;
```

### **Almacenamiento de Embeddings**

```json
// Estructura: chroma_db/[classId]/[documento].json
{
  "documents": [
    {
      "pageContent": "Fragmento de texto del PDF (máximo 1000 caracteres)",
      "metadata": {
        "source": "nombre_documento.pdf",
        "chunk": 1
      }
    }
  ]
}
```

---

## 🛣️ Rutas API y Endpoints

### **Autenticación**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/[...nextauth]` - Manejadores NextAuth (iniciar sesión/cerrar sesión)
- `GET /api/auth/csrf` - Token CSRF para formularios

### **Gestión de Clases**
- `POST /api/classes` - Crear nueva clase (Maestro)
- `GET /api/classes` - Listar clases (filtrado por rol)

### **Clases Específicas**
- `GET /api/classes/[classId]` - Detalles de clase
- `POST /api/classes/[classId]/documents` - Subir documento
- `GET /api/classes/[classId]/documents` - Listar documentos
- `DELETE /api/classes/[classId]/documents` - Eliminar documento

### **Agente Virtual**
- `POST /api/classes/[classId]/chat` - Enviar pregunta al agente virtual
- `GET /api/classes/[classId]/chat/history` - Obtener historial

---

## 🎨 Componentes Frontend

### **Jerarquía de Diseños (Layouts)**

```
app/layout.tsx (Diseño Raíz)
├── SessionProvider (Contexto NextAuth)
├── globals.css (Tailwind)
└── dashboard/layout.tsx (Diseño Protegido)
    ├── getServerSession() (Verificación de autenticación)
    ├── Componente DashboardLayout
    │   ├── Barra lateral de navegación
    │   ├── Menú de usuario
    │   └── contenido {children}
    └── Componentes de página específicos
```

### **Componentes Principales**

**🤖 AgenteVirtual.tsx** (Cliente)
```typescript
// Características implementadas:
- ✅ Interfaz de mensajería en tiempo real
- ✅ Desplazamiento automático al último mensaje  
- ✅ Estados de carga y manejo de errores
- ✅ Carga de historial de chat al inicio
- ✅ Botón de recarga para actualizar el historial
- ✅ Ganchos (hooks) useEffect + useRef para experiencia de usuario (UX)

// Estado del componente:
const [messages, setMessages] = useState<Message[]>([]);
const [question, setQuestion] = useState('');
const [loading, setLoading] = useState(false);
const [loadingHistory, setLoadingHistory] = useState(false);
const messagesEndRef = useRef<HTMLDivElement>(null);
```

**📋 ClassesClient.tsx** (Gestión de Clases)
- Lista de clases según rol (Maestro/Estudiante)
- Modal de creación de clase
- Navegación a detalles de clase
- Estadísticas de estudiantes y documentos

**📄 DocumentList.tsx** (Gestión de Documentos)
- Lista de PDFs subidos
- Información de tamaño y fecha
- Botón de eliminación (solo Maestros)
- Estados de carga y error

**📤 UploadDocument.tsx** (Subida de Archivos)
- Interfaz de arrastrar y soltar (drag & drop)
- Validación de tipo PDF
- Indicador de progreso
- Manejo de errores para archivos malformados

---

## 🚀 Flujos de Usuario Principales

### **Flujo Maestro**

```mermaid
sequenceDiagram
    participant M as Maestro
    participant Auth as NextAuth
    participant DB as MongoDB
    participant FS as Sistema de Archivos
    
    M->>Auth: Iniciar sesión (email/contraseña)
    Auth->>DB: Validar credenciales
    DB->>Auth: Retornar datos de usuario
    Auth->>M: Redirigir a /dashboard/classes
    
    M->>DB: Crear nueva clase
    DB->>M: Retornar clase con código único
    
    M->>FS: Subir documento PDF
    FS->>FS: Procesar con pdf2json
    FS->>DB: Actualizar class.documents[]
    
    M->>DB: Ver progreso del estudiante
    DB->>M: Retornar resumen de interacciones
```

### **Flujo Estudiante**

```mermaid
sequenceDiagram
    participant E as Estudiante
    participant Auth as NextAuth
    participant API as API de Chat
    participant Groq as Groq AI
    participant DB as MongoDB
    
    E->>Auth: Registrarse con código de clase
    Auth->>DB: Crear usuario + añadir a class.students[]
    
    E->>Auth: Iniciar sesión
    Auth->>E: Redirigir a /dashboard/chat
    
    E->>API: Enviar pregunta a agente virtual
    API->>API: Cargar fragmentos de documento (RAG)
    API->>Groq: Consultar con contexto
    Groq->>API: Retornar respuesta de IA
    API->>DB: Guardar interacción
    API->>E: Mostrar respuesta + fuentes
    
    E->>API: Cargar historial de chat
    API->>DB: Consultar interacciones por usuario+clase
    API->>E: Mostrar historial de conversación
```

---

## 🔧 Variables de Entorno

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REDACTED_NEXTAUTH_SECRET

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster0.vqye7ir.mongodb.net/chatbot
MONGO_DBNAME=chatbot

# Groq AI (FUNCIONANDO)
GROQ_API_KEY=REDACTED_GROQ_API_KEY

# Google AI (RESPALDO - no funciona)
GOOGLE_API_KEY=REDACTED_GOOGLE_API_KEY
```

---

## 📊 Métricas y Monitoreo

### **Datos Rastreados**

**Por Estudiante:**
- Número total de interacciones
- Última fecha de actividad
- Promedio de preguntas por sesión
- Temas más consultados

**Por Clase:**
- Documentos procesados
- Total de fragmentos generados
- Estudiantes activos/inactivos
- Alertas de inactividad (+15 días)

**Por Sistema:**
- Tiempo de respuesta de API Groq
- Tasa de éxito de procesamiento de PDF
- Errores de autenticación
- Uso de almacenamiento (uploads/ y chroma_db/)

### **Panel del Maestro**

```typescript
// Información mostrada en /dashboard/classes/[classId]
interface ClassStats {
  totalStudents: number;            // Total de estudiantes
  activeStudents: number;           // Activos en últimos 15 días
  inactiveStudents: number;         // Sin actividad >15 días
  totalInteractions: number;        // Interacciones totales
  documentsCount: number;           // Cantidad de documentos
  recentActivity: Interaction[];    // Últimas 10 interacciones
}
```

---

## 🚦 Estados y Manejo de Errores

### **Estados de la Aplicación**

**Autenticación:**
- ✅ Autenticado (con rol y permisos)
- ❌ No autenticado (redirección a /auth/login)
- ⏳ Cargando (verificando sesión)

**Documentos:**
- ✅ Procesado (fragmentado y guardado)
- ⚠️ Procesando (pdf2json en progreso)
- ❌ Fallido (error en procesamiento)

**Chat:**
- ✅ Listo (documentos disponibles)
- ⚠️ Sin Documentos (clase sin materiales)
- ❌ Error de API (Groq no disponible)

### **Manejo de Errores**

```typescript
// Estrategia de respaldo en queryDocuments()
try {
  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions');
  return groqResponse.json();
} catch (embeddingError) {
  // Respaldo a respuesta predeterminada
  return {
    answer: 'Lo siento, hay problemas técnicos. Los documentos están siendo procesados.',
    sources: []
  };
}
```

**Errores Comunes y Soluciones:**

| Error | Causa | Solución |
|-------|--------|----------|
| `401 No Autorizado` | Sesión expirada | Re-inicio de sesión automático |
| `404 Clase No Encontrada` | ID inválido o sin permisos | Verificar acceso |
| `Fallo Procesamiento de PDF` | Archivo malformado | Try-catch con decodeURIComponent |
| `Tiempo de Espera de API Groq`| Red lenta | Reintentar con retroceso exponencial |
| `Conexión MongoDB` | BD no disponible | Pool de reconexión |

---

## 🔒 Seguridad Implementada

### **Autenticación y Autorización**
- ✅ **Hashing de contraseñas**: bcrypt con salt rounds
- ✅ **Tokens JWT**: Firmados con NEXTAUTH_SECRET
- ✅ **Acceso basado en roles**: Middleware por rutas
- ✅ **Validación de sesión**: getServerSession() en cada API
- ✅ **Protección CSRF**: Integrado en NextAuth

### **Validación de Datos**
- ✅ **Validación de esquema**: Zod para cuerpos de solicitud
- ✅ **Verificación de tipo de archivo**: Solo PDFs permitidos
- ✅ **Límites de tamaño**: 10MB máximo por archivo
- ✅ **Sanitización de rutas**: Prevenir salto de directorios (directory traversal)

### **Seguridad de API**
- ✅ **Límite de tasa**: Control de frecuencia de solicitudes
- ✅ **Cabeceras CORS**: Configurado en next.config.ts
- ✅ **Variables de entorno**: Secretos en .env.local
- ✅ **Sanitización de errores**: No exponer rastros de pila (stack traces)

---

## 🎯 Próximas Mejoras Identificadas

### **Rendimiento**
- [ ] Implementar Redis para caché de embeddings
- [ ] Carga diferida (lazy loading) de componentes grandes
- [ ] Optimización de consultas MongoDB con agregación
- [ ] CDN para archivos estáticos

### **Características**
- [ ] Notificaciones push para nuevos documentos
- [ ] Sistema de etiquetas para documentos
- [ ] Panel de analíticas avanzado
- [ ] Exportación de conversaciones a PDF
- [ ] Modo sin conexión con Service Workers

### **Mejoras de IA**
- [ ] Ajuste fino (fine-tuning) del modelo con conversaciones históricas
- [ ] Embeddings vectoriales reales (vs. simple coincidencia de texto)
- [ ] Soporte multimodal (imágenes en PDFs)
- [ ] Respuestas con citas directas y páginas

### **Experiencia del Desarrollador**
- [ ] Contenerización con Docker
- [ ] Tubería (Pipeline) CI/CD con GitHub Actions
- [ ] Storybook para componentes
- [ ] Monitoreo de rendimiento con métricas

---

## 📈 Métricas de Éxito Actual

### **Sistema Completo**
- ✅ **Arquitectura Escalable**: Preparado para múltiples clases y usuarios
- ✅ **Autenticación Robusta**: NextAuth con roles y permisos
- ✅ **Integración IA**: Groq respondiendo correctamente
- ✅ **Procesamiento de PDF**: pdf2json manejando archivos complejos

### **Rendimiento**
- ⚡ **Next.js 16**: Turbopack mejorando tiempos de compilación ~4.8s
- ⚡ **MongoDB**: Consultas optimizadas con índices
- ⚡ **API Groq**: Respuestas <2s promedio
- ⚡ **Subida de Archivos**: Procesamiento en flujo (streaming) de PDFs

### **Experiencia de Usuario**
- 🎨 **Adaptable (Responsive)**: Tailwind CSS orientado a móviles
- 🔄 **Tiempo Real**: Interfaz de chat con desplazamiento automático
- 💾 **Persistente**: Historial completo de conversaciones
- 🚀 **Rápido**: Componentes de Servidor + Cliente optimizado

---

*Documentación generada: Octubre 2025*  
*Versión: 1.0.0*  
*Stack: Next.js 16 + React 19 + MongoDB + Groq AI*