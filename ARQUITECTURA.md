<<<<<<< HEAD
# 🏗️ Arquitectura del Agente Virtual Educativo - Cultura Empresarial

## 📋 Resumen Ejecutivo

Sistema educativo basado en **Next.js 16** con **RAG (Retrieval Augmented Generation)** que permite a profesores crear clases, subir documentos PDF y a estudiantes interactuar con un agente virtual inteligente alimentado por **Groq AI**.
=======
# 🏗️ Arquitectura del Agente Virtual Educativo - MentorBot

## 📋 Resumen Ejecutivo

Sistema educativo basado en **Next.js 16** con **Generación Aumentada por Recuperación (RAG)** que permite a profesores crear clases, subir documentos PDF y a estudiantes interactuar con un agente virtual inteligente alimentado por **Groq AI**.
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

## 🎯 Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Navegador)"
<<<<<<< HEAD
        UI[React Components]
        Forms[Auth Forms]
        Chat[Chat Interface]
    end
    
    subgraph "Next.js 16 App Router"
        Pages[Pages/Routes]
        API[API Routes]
=======
        UI[Componentes React]
        Forms[Formularios de Autenticación]
        Chat[Interfaz de Chat]
    end
    
    subgraph "Enrutador de Aplicación Next.js 16"
        Pages[Páginas/Rutas]
        API[Rutas API]
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
        Middleware[Middleware]
    end
    
    subgraph "Autenticación"
        NextAuth[NextAuth v4.24.11]
<<<<<<< HEAD
        JWT[JWT Tokens]
        Session[Server Sessions]
=======
        JWT[Tokens JWT]
        Session[Sesiones de Servidor]
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
    end
    
    subgraph "Base de Datos"
        MongoDB[(MongoDB Atlas)]
<<<<<<< HEAD
        Models[Mongoose Models]
    end
    
    subgraph "AI & Procesamiento"
        Groq[Groq AI API]
        PDF[PDF Processing]
        Embeddings[Embeddings/RAG]
        ChromaDB[ChromaDB Files]
=======
        Models[Modelos Mongoose]
    end
    
    subgraph "IA & Procesamiento"
        Groq[API Groq AI]
        Gemini[Gemini Embeddings]
        PDF[Procesamiento de PDF]
        Persona[persona.ts]
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
    end
    
    UI --> Pages
    Forms --> NextAuth
    Chat --> API
    Pages --> Session
    API --> Models
    Models --> MongoDB
<<<<<<< HEAD
    API --> Embeddings
    Embeddings --> Groq
    PDF --> ChromaDB
=======
    API --> Persona
    Persona --> Groq
    PDF --> Gemini
    Gemini --> MongoDB
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

---

## 🛠️ Stack Tecnológico

### **Frontend**
<<<<<<< HEAD
- **Framework**: Next.js 16.0.0 (App Router + Turbopack)
- **React**: 19.2.0 con Server Components + Client Components
- **Styling**: Tailwind CSS 4.x
- **TypeScript**: v5 con tipado estricto
- **Forms**: React Hook Form v7.65.0

### **Backend & API**
- **Runtime**: Node.js con Next.js API Routes
- **Autenticación**: NextAuth v4.24.11 (JWT Strategy)
- **Base de Datos**: MongoDB Atlas + Mongoose 8.19.2
- **Validación**: Zod v4.1.12

### **AI & Procesamiento**
- **LLM**: Groq API (Llama 3.3 70B Versatile)
- **PDF Processing**: pdf2json v4.0.0
- **RAG**: Custom embeddings + ChromaDB files
- **Vector Storage**: JSON files en sistema de archivos
=======
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
- **Personalidad del bot**: `persona.ts` detecta el área de la clase y arma un system prompt de especialista, con memoria conversacional de los últimos intercambios
- **Procesamiento de PDF**: pdf2json v4.0.0
- **RAG**: Embeddings con Gemini (`embedding-001`) vía `mongodb-embeddings.ts`
- **Almacenamiento Vectorial**: Colección de chunks + embeddings en MongoDB Atlas

### **Almacenamiento de Documentos**
- Estrategia dual controlada por `NEXT_PUBLIC_STORAGE_MODE` (ver `.env.example`) y resuelta en `src/lib/storage/documents.ts`:
  - `blob`: subida directa a Vercel Blob desde el cliente (necesario en despliegues serverless de Vercel, sin límite de tamaño de body)
  - `local` (o sin definir): guardado en disco bajo `public/uploads/[classId]/` (solo para desarrollo o un servidor propio con disco persistente)
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

## 📁 Estructura de Directorios

```
residencia/
├── 📂 src/
<<<<<<< HEAD
│   ├── 📂 app/                          # App Router de Next.js 16
│   │   ├── 📂 api/                      # API Routes
│   │   │   ├── 📂 auth/                 # NextAuth endpoints
│   │   │   │   ├── 📂 [...nextauth]/    # NextAuth handler
=======
│   ├── 📂 app/                          # Enrutador de Aplicación Next.js 16
│   │   ├── 📂 api/                      # Rutas API
│   │   │   ├── 📂 auth/                 # Endpoints NextAuth
│   │   │   │   ├── 📂 [...nextauth]/    # Manejador NextAuth
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
│   │   │   │   └── 📂 register/         # Registro de usuarios
│   │   │   ├── 📂 classes/              # API de clases
│   │   │   │   ├── 📂 [classId]/        # APIs específicas por clase
│   │   │   │   │   ├── 📂 chat/         # Endpoint del agente virtual
│   │   │   │   │   │   └── 📂 history/  # Historial de chat
│   │   │   │   │   └── 📂 documents/    # Gestión de documentos
<<<<<<< HEAD
│   │   │   │   └── route.ts             # CRUD de clases

│   │   ├── 📂 auth/                     # Páginas de autenticación
│   │   │   ├── 📂 login/
│   │   │   └── 📂 register/
│   │   ├── 📂 dashboard/                # Dashboard principal
│   │   │   ├── 📂 classes/              # Gestión de clases
│   │   │   │   └── 📂 [classId]/        # Vista específica de clase
│   │   │   └── 📂 chat/                 # Vista de chat para estudiantes
│   │   ├── layout.tsx                   # Layout raíz
│   │   ├── page.tsx                     # Página de inicio (redirect)
│   │   └── globals.css                  # Estilos globales
│   ├── 📂 components/                   # Componentes React
│   │   ├── 📂 auth/                     # Formularios de autenticación
│   │   ├── 📂 layouts/                  # Layouts reutilizables
│   │   ├── AgenteVirtual.tsx           # Interfaz de chat principal
│   │   ├── ClassesClient.tsx            # Lista de clases
│   │   ├── CreateClassModal.tsx         # Modal crear clase
│   │   ├── DocumentList.tsx             # Lista de documentos
│   │   └── UploadDocument.tsx           # Componente upload
│   ├── 📂 lib/                         # Librerías y utilidades
│   │   ├── 📂 ai/                      # Lógica de AI
│   │   │   └── embeddings.ts           # RAG + Groq integration
│   │   ├── 📂 db/                      # Conexiones DB
│   │   │   ├── mongodb.ts              # Conexión MongoDB
│   │   │   └── mongodb-adapter.ts      # Adaptador NextAuth
│   │   └── 📂 utils/                   # Utilidades generales
│   ├── 📂 models/                      # Modelos Mongoose
│   │   ├── User.ts                     # Modelo Usuario
│   │   ├── Class.ts                    # Modelo Clase  
│   │   └── Interaction.ts              # Modelo Interacciones
│   └── 📂 types/                       # Tipos TypeScript
│       ├── next-auth.d.ts              # Tipos NextAuth
│       └── mongodb.ts                  # Tipos MongoDB

├── 📂 chroma_db/                       # Almacén de embeddings
│   └── 📂 [classId]/                   # Embeddings por clase
│       └── *.json                      # Fragmentos de documentos
├── 📂 uploads/                         # Archivos subidos
│   └── 📂 [classId]/                   # Archivos por clase
│       └── *.pdf                       # Documentos PDF
├── 📂 scripts/                         # Scripts de utilidad
├── package.json                        # Dependencias del proyecto
├── next.config.ts                      # Configuración Next.js
├── tsconfig.json                       # Configuración TypeScript  
├── tailwind.config.js                  # Configuración Tailwind
├── middleware.ts                       # Middleware Next.js
└── .env.local                          # Variables de entorno
=======
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
├── 📂 public/uploads/                   # Archivos subidos (modo local; en Vercel se usa Blob)
│   └── 📂 [classId]/                    # Archivos por clase
│       └── *.pdf                        # Documentos PDF
├── 📂 scripts/                          # Scripts de utilidad
├── package.json                         # Dependencias del proyecto
├── next.config.ts                       # Configuración Next.js
├── tsconfig.json                        # Configuración TypeScript  
├── tailwind.config.js                   # Configuración Tailwind
├── middleware.ts                        # Middleware Next.js
└── .env.local                           # Variables de entorno
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

---

## 🔐 Sistema de Autenticación

<<<<<<< HEAD
### **NextAuth v4.24.11 Configuration**
=======
### **Configuración de NextAuth v4.24.11**
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

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
<<<<<<< HEAD
- ✅ Chatear con AI usando documentos
=======
- ✅ Chatear con IA usando documentos
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
- ✅ Ver historial de conversaciones
- ✅ Acceder solo a sus clases asignadas

---

## 🗄️ Modelos de Base de Datos

<<<<<<< HEAD
### **User Model**
=======
### **Modelo de Usuario (User)**
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
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

<<<<<<< HEAD
### **Class Model**
=======
### **Modelo de Clase (Class)**
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```typescript
interface IClass {
  _id: ObjectId;
  name: string;             // Nombre de la clase
  code: string;             // Código único de 6 caracteres
<<<<<<< HEAD
  teacher: ObjectId;        // Ref a User (Maestro)
  students: ObjectId[];     // Array de refs a Users (Estudiantes)
=======
  teacher: ObjectId;        // Referencia a User (Maestro)
  students: ObjectId[];     // Arreglo de referencias a Users (Estudiantes)
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  documents: {              // Documentos PDF subidos
    filename: string;
    originalName: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
}
```

<<<<<<< HEAD
### **Interaction Model**
```typescript
interface IInteraction {
  _id: ObjectId;
  usuario_id: ObjectId;     // Ref a User (Estudiante)
  clase_id: ObjectId;       // Ref a Class
  pregunta: string;         // Pregunta del estudiante
  respuesta: string;        // Respuesta de la AI
  sources: string[];        // Fragmentos de documentos usados
  fecha: Date;              // Timestamp de la interacción
}

// Indexes para optimización
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
// - (usuario_id, fecha): Historial por usuario
// - (clase_id, fecha): Actividad por clase
```

---

<<<<<<< HEAD
## 🤖 Sistema de AI y RAG
=======
## 🤖 Sistema de IA y RAG
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

### **Flujo de Procesamiento de Documentos**

```mermaid
sequenceDiagram
<<<<<<< HEAD
    participant T as Teacher
    participant API as Upload API
    participant PDF as pdf2json
    participant FS as File System
    participant DB as MongoDB
    
    T->>API: Upload PDF
    API->>PDF: Process PDF
    PDF->>PDF: Extract text
    PDF->>PDF: Split into chunks (1000 chars)
    PDF->>FS: Save to chroma_db/[classId]/
    API->>DB: Update Class.documents[]
    API->>T: Success response
=======
    participant M as Maestro
    participant API as API de Subida
    participant ST as storage/documents.ts
    participant PDF as pdf2json
    participant Gemini as Gemini Embeddings
    participant DB as MongoDB
    
    M->>API: Subir PDF
    API->>ST: saveDocument() (Blob o disco local)
    API->>PDF: Leer y extraer texto
    PDF->>PDF: Dividir en fragmentos (500 caracteres, solape 100)
    PDF->>Gemini: Generar embedding por fragmento
    Gemini->>DB: Guardar chunks + embeddings (DocumentChunk)
    API->>DB: Actualizar Class.documents[]
    API->>M: Respuesta de éxito
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

### **Flujo de Consulta (RAG)**

```mermaid
sequenceDiagram
<<<<<<< HEAD
    participant S as Student
    participant API as Chat API
    participant FS as File System
    participant Groq as Groq AI
    participant DB as MongoDB
    
    S->>API: Send question
    API->>FS: Load class documents
    FS->>API: Return document chunks
    API->>API: Select top 5 relevant chunks
    API->>Groq: Send context + question
    Groq->>API: Return AI answer
    API->>DB: Save interaction
    API->>S: Return answer + sources
=======
    participant E as Estudiante
    participant API as API de Chat
    participant DB as MongoDB
    participant Persona as persona.ts
    participant Groq as Groq AI
    
    E->>API: Enviar pregunta
    API->>DB: Cargar últimos 6 intercambios (memoria conversacional)
    API->>DB: Buscar chunks por similitud coseno (top 5)
    API->>Persona: buildSystemPrompt(clase, fragmentos, historial)
    Persona->>API: System prompt del especialista
    API->>Groq: Enviar prompt + historial + pregunta
    Groq->>API: Retornar respuesta de la IA
    API->>DB: Guardar interacción
    API->>E: Retornar respuesta + fuentes
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

### **Configuración Groq AI**

```typescript
// Endpoint: https://api.groq.com/openai/v1/chat/completions
const groqConfig = {
  model: 'llama-3.3-70b-versatile',
<<<<<<< HEAD
  temperature: 0.7,           // Balance creatividad/precisión
  max_tokens: 1024,           // Respuestas concisas
  stream: false               // Response completa
};

// Prompt del sistema
const MENTOR_PERSONA = `
Eres un mentor académico especializado en Cultura Empresarial.
Usa los documentos proporcionados como contexto principal.
Responde de manera educativa, clara y con ejemplos cuando sea apropiado.
Si la pregunta no está relacionada con el tema, redirige amablemente.
`;
=======
  temperature: 0.5,           // Balance creatividad/precisión
  max_tokens: 1600,
  stream: false               // Respuesta completa
};

// El system prompt no es un template fijo: buildSystemPrompt() en persona.ts
// detecta el área de la clase a partir del nombre, la descripción y los
// fragmentos recuperados, y arma una identidad de especialista + reglas de
// rigor + memoria conversacional para cada llamada.
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

### **Almacenamiento de Embeddings**

<<<<<<< HEAD
```json
// Estructura: chroma_db/[classId]/[documento].json
{
  "documents": [
    {
      "pageContent": "Fragmento de texto del PDF (1000 chars max)",
      "metadata": {
        "source": "nombre_documento.pdf",
        "chunk": 1
      }
    }
  ]
}
```

---

## 🛣️ API Routes y Endpoints

### **Autenticación**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/[...nextauth]` - NextAuth handlers (login/logout)
- `GET /api/auth/csrf` - CSRF token para formularios
=======
Los embeddings se generan con Gemini (`embedding-001`) y se guardan como documentos en una colección de MongoDB (`DocumentChunk`), en vez de archivos en disco:

```typescript
// Estructura de cada chunk (src/models/DocumentChunk.ts)
{
  classId: string;
  documentId: string;
  chunkIndex: number;
  content: string;      // Fragmento de texto del PDF
  embedding: number[];  // Vector de embedding
}
```

La búsqueda (`searchDocuments` en `mongodb-embeddings.ts`) calcula similitud coseno en memoria contra los chunks de la clase.

---

## 🛣️ Rutas API y Endpoints

### **Autenticación**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/[...nextauth]` - Manejadores NextAuth (iniciar sesión/cerrar sesión)
- `GET /api/auth/csrf` - Token CSRF para formularios
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

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

<<<<<<< HEAD


=======
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
---

## 🎨 Componentes Frontend

<<<<<<< HEAD
### **Jerarquía de Layouts**

```
app/layout.tsx (Root Layout)
├── SessionProvider (NextAuth context)
├── globals.css (Tailwind)
└── dashboard/layout.tsx (Protected Layout)
    ├── getServerSession() (Auth check)
    ├── DashboardLayout component
    │   ├── Navigation sidebar
    │   ├── User menu
    │   └── {children} content
    └── Specific page components
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

### **Componentes Principales**

**🤖 AgenteVirtual.tsx** (Cliente)
```typescript
<<<<<<< HEAD
// Features implementadas:
- ✅ Real-time messaging interface
- ✅ Auto-scroll to latest message  
- ✅ Loading states and error handling
- ✅ Chat history loading on mount
- ✅ Reload button for history refresh
- ✅ useEffect + useRef hooks para UX
=======
// Características implementadas:
- ✅ Interfaz de mensajería en tiempo real
- ✅ Desplazamiento automático al último mensaje  
- ✅ Estados de carga y manejo de errores
- ✅ Carga de historial de chat al inicio
- ✅ Botón de recarga para actualizar el historial
- ✅ Ganchos (hooks) useEffect + useRef para experiencia de usuario (UX)
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

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
<<<<<<< HEAD
- Drag & drop interface
- Validación de tipo PDF
- Progress indicator
- Error handling para archivos malformados
=======
- Interfaz de arrastrar y soltar (drag & drop)
- Validación de tipo PDF
- Indicador de progreso
- Manejo de errores para archivos malformados
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

## 🚀 Flujos de Usuario Principales

### **Flujo Maestro**

```mermaid
sequenceDiagram
    participant M as Maestro
    participant Auth as NextAuth
    participant DB as MongoDB
<<<<<<< HEAD
    participant FS as File System
    
    M->>Auth: Login (email/password)
    Auth->>DB: Validate credentials
    DB->>Auth: Return user data
    Auth->>M: Redirect to /dashboard/classes
    
    M->>DB: Create new class
    DB->>M: Return class with unique code
    
    M->>FS: Upload PDF document
    FS->>FS: Process with pdf2json
    FS->>DB: Update class.documents[]
    
    M->>DB: View student progress
    DB->>M: Return interactions summary
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

### **Flujo Estudiante**

```mermaid
sequenceDiagram
<<<<<<< HEAD
    participant S as Estudiante
    participant Auth as NextAuth
    participant API as Chat API
    participant Groq as Groq AI
    participant DB as MongoDB
    
    S->>Auth: Register with class code
    Auth->>DB: Create user + add to class.students[]
    
    S->>Auth: Login
    Auth->>S: Redirect to /dashboard/chat
    
    S->>API: Send question to agente virtual
    API->>API: Load document chunks (RAG)
    API->>Groq: Query with context
    Groq->>API: Return AI response
    API->>DB: Save interaction
    API->>S: Display answer + sources
    
    S->>API: Load chat history
    API->>DB: Query interactions by user+class
    API->>S: Display conversation history
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
```

---

## 🔧 Variables de Entorno

```bash
<<<<<<< HEAD
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=chatbotMentor2025Secret

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster0.vqye7ir.mongodb.net/chatbot
MONGO_DBNAME=chatbot

# Groq AI (WORKING)
GROQ_API_KEY=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

# Google AI (BACKUP - no funciona)
GOOGLE_API_KEY=AIzaSyALYoHdzlkDTBboX6lWUpg7mL04IqQTsh0
=======
# .env.local — ver .env.example para la lista completa y actualizada
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<genera-un-secreto-propio>

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@<tu-cluster>.mongodb.net/<db>
MONGO_DBNAME=residencia

# Groq AI (respuestas del chat)
GROQ_API_KEY=<tu-clave-de-groq>

# Google AI (embeddings con Gemini)
GOOGLE_API_KEY=<tu-clave-de-google>
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
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
<<<<<<< HEAD
- Tiempo de respuesta de Groq API
- Tasa de éxito de procesamiento PDF
- Errores de autenticación
- Uso de almacenamiento (uploads/ y chroma_db/)

### **Dashboard del Maestro**
=======
- Tiempo de respuesta de API Groq
- Tasa de éxito de procesamiento de PDF
- Errores de autenticación
- Uso de almacenamiento de documentos (disco local o Vercel Blob) y de la colección de embeddings en MongoDB

### **Panel del Maestro**
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

```typescript
// Información mostrada en /dashboard/classes/[classId]
interface ClassStats {
<<<<<<< HEAD
  totalStudents: number;
  activeStudents: number;           // Activos en últimos 15 días
  inactiveStudents: number;         // Sin actividad >15 días
  totalInteractions: number;
  documentsCount: number;
=======
  totalStudents: number;            // Total de estudiantes
  activeStudents: number;           // Activos en últimos 15 días
  inactiveStudents: number;         // Sin actividad >15 días
  totalInteractions: number;        // Interacciones totales
  documentsCount: number;           // Cantidad de documentos
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  recentActivity: Interaction[];    // Últimas 10 interacciones
}
```

---

## 🚦 Estados y Manejo de Errores

### **Estados de la Aplicación**

**Autenticación:**
<<<<<<< HEAD
- ✅ Authenticated (con rol y permisos)
- ❌ Unauthenticated (redirect a /auth/login)
- ⏳ Loading (verificando sesión)

**Documentos:**
- ✅ Processed (fragmentado y guardado)
- ⚠️ Processing (pdf2json en progreso)
- ❌ Failed (error en procesamiento)

**Chat:**
- ✅ Ready (documentos disponibles)
- ⚠️ No Documents (clase sin materiales)
- ❌ API Error (Groq no disponible)
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

### **Manejo de Errores**

```typescript
<<<<<<< HEAD
// Estrategia de fallback en queryDocuments()
=======
// Estrategia de respaldo en queryDocuments()
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
try {
  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions');
  return groqResponse.json();
} catch (embeddingError) {
<<<<<<< HEAD
  // Fallback a respuesta predeterminada
=======
  // Respaldo a respuesta predeterminada
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  return {
    answer: 'Lo siento, hay problemas técnicos. Los documentos están siendo procesados.',
    sources: []
  };
}
```

**Errores Comunes y Soluciones:**

| Error | Causa | Solución |
|-------|--------|----------|
<<<<<<< HEAD
| `401 Unauthorized` | Sesión expirada | Re-login automático |
| `404 Class Not Found` | ID inválido o sin permisos | Verificar acceso |
| `PDF Processing Failed` | Archivo malformado | Try-catch con decodeURIComponent |
| `Groq API Timeout` | Red lenta | Retry con exponential backoff |
| `MongoDB Connection` | DB no disponible | Reconnection pool |
=======
| `401 No Autorizado` | Sesión expirada | Re-inicio de sesión automático |
| `404 Clase No Encontrada` | ID inválido o sin permisos | Verificar acceso |
| `Fallo Procesamiento de PDF` | Archivo malformado | Try-catch con decodeURIComponent |
| `Tiempo de Espera de API Groq`| Red lenta | Reintentar con retroceso exponencial |
| `Conexión MongoDB` | BD no disponible | Pool de reconexión |
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

## 🔒 Seguridad Implementada

### **Autenticación y Autorización**
<<<<<<< HEAD
- ✅ **Password hashing**: bcrypt con salt rounds
- ✅ **JWT Tokens**: Firmados con NEXTAUTH_SECRET
- ✅ **Role-based access**: Middleware por rutas
- ✅ **Session validation**: getServerSession() en cada API
- ✅ **CSRF Protection**: NextAuth built-in

### **Validación de Datos**
- ✅ **Schema validation**: Zod para request bodies
- ✅ **File type checking**: Solo PDFs permitidos
- ✅ **Size limits**: 10MB máximo por archivo
- ✅ **Path sanitization**: Prevenir directory traversal

### **API Security**
- ✅ **Rate limiting**: Control de frecuencia de requests
- ✅ **CORS headers**: Configurado en next.config.ts
- ✅ **Environment variables**: Secrets en .env.local
- ✅ **Error sanitization**: No exposer stack traces
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

## 🎯 Próximas Mejoras Identificadas

<<<<<<< HEAD
### **Performance**
- [ ] Implementar Redis para caching de embeddings
- [ ] Lazy loading de componentes grandes
- [ ] Optimización de queries MongoDB con agregación
- [ ] CDN para archivos estáticos

### **Features**
- [ ] Notificaciones push para nuevos documentos
- [ ] Sistema de tags para documentos
- [ ] Analytics dashboard avanzado
- [ ] Export de conversaciones a PDF
- [ ] Modo offline con Service Workers

### **AI Enhancements**
- [ ] Fine-tuning del modelo con conversaciones históricas
- [ ] Embeddings vectoriales reales (vs. simple text matching)
- [ ] Multi-modal support (imágenes en PDFs)
- [ ] Respuestas con citas directas y páginas

### **Developer Experience**
- [ ] Docker containerization
- [ ] CI/CD pipeline con GitHub Actions
- [ ] Storybook para componentes
- [ ] Monitoreo de performance con métricas
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

## 📈 Métricas de Éxito Actual

### **Sistema Completo**
- ✅ **Arquitectura Escalable**: Preparado para múltiples clases y usuarios
- ✅ **Autenticación Robusta**: NextAuth con roles y permisos
<<<<<<< HEAD
- ✅ **AI Integration**: Groq respondiendo correctamente
- ✅ **PDF Processing**: pdf2json manejando archivos complejos

### **Performance**
- ⚡ **Next.js 16**: Turbopack mejorando build times ~4.8s
- ⚡ **MongoDB**: Queries optimizadas con indexes
- ⚡ **Groq API**: Respuestas <2s promedio
- ⚡ **File Upload**: Procesamiento streaming de PDFs

### **User Experience**
- 🎨 **Responsive**: Tailwind CSS mobile-first
- 🔄 **Real-time**: Chat interface con auto-scroll
- 💾 **Persistent**: Historial completo de conversaciones
- 🚀 **Fast**: Server Components + Client optimizado
=======
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
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

---

*Documentación generada: Octubre 2025*  
*Versión: 1.0.0*  
*Stack: Next.js 16 + React 19 + MongoDB + Groq AI*