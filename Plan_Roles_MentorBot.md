# Plan de Roles y Permisos - MentorBot

Este documento define estratégicamente la arquitectura de roles del sistema, estableciendo claramente las fronteras, responsabilidades y permisos de cada actor dentro de la plataforma educativa.

---

## 1. Rol: Administrador (Gestor Global de la Plataforma)
**Enfoque Principal:** Mantenimiento, seguridad, escalabilidad y gestión a nivel de base de datos de la plataforma entera.

### 🛡️ Permisos y Accesos
* **Acceso Total (Superusuario):** Puede ver, modificar y eliminar cualquier registro en la base de datos (clases, usuarios, correos, registros de chat).
* **Gestión de Roles:** Es el único capaz de promover a un usuario común al rol de "Maestro" (para evitar que cualquier persona cree clases sin autorización).
* **Supervisión del Sistema:** Acceso a métricas globales de la plataforma.

### ⚙️ Responsabilidades y Funciones Clave
* **Control de Costos y API:** Monitorear el uso del Chatbot (tokens de OpenAI) para asegurar que el sistema sea rentable.
* **Soporte Técnico:** Resolver problemas de cuentas bloqueadas, correos mal escritos o eliminación de cuentas.
* **Moderación:** Eliminar clases o suspender maestros/estudiantes si se detecta un mal uso de la plataforma.

---

## 2. Rol: Maestro (Creador de Contenido y Facilitador)
**Enfoque Principal:** Gestión del aprendizaje, estructuración de la clase y seguimiento del progreso de los alumnos.

### 🛡️ Permisos y Accesos
* **Gestión de Clases:** Permiso absoluto (CRUD: Crear, Leer, Actualizar, Borrar) **solo sobre las clases que él mismo ha creado**. No tiene acceso a las clases de otros maestros.
* **Alimentación de la IA:** Único rol con permiso para subir documentos, temarios y material bibliográfico que servirán como "cerebro" para el MentorBot de su clase.
* **Gestión de Estudiantes:** Puede ver la lista de alumnos inscritos en su clase y su última fecha de conexión.

### ⚙️ Responsabilidades y Funciones Clave
* **Contextualización de la IA:** Proveer material de alta calidad para que las respuestas del bot sean precisas y académicamente correctas.
* **Emisión de Accesos:** Generar y compartir el "Código de Clase" a sus alumnos físicos o virtuales.
* **Retención Escolar (Dashboard de Correos):** Usar el panel de correos motivacionales para detectar qué estudiantes llevan más de 15 días inactivos y enviar alertas masivas o individuales para evitar la deserción.

---

## 3. Rol: Estudiante (Aprendiz y Consumidor)
**Enfoque Principal:** Interacción con el material didáctico, estudio activo y resolución de dudas.

### 🛡️ Permisos y Accesos
* **Acceso Restringido:** Solo puede leer e interactuar. No puede borrar, editar ni crear clases.
* **Aislamiento de Datos:** Solo puede ver las clases a las que se ha unido explícitamente mediante un código. No puede ver quiénes más están inscritos en la clase ni acceder a los datos del profesor.
* **Interacción Controlada:** Puede conversar con MentorBot, pero sus comandos de IA están confinados en un *Sandbox* (solo puede hablar sobre el temario).

### ⚙️ Responsabilidades y Funciones Clave
* **Aprendizaje Continuo:** Utilizar a MentorBot como un tutor 24/7 para aclarar dudas específicas antes de un examen o proyecto.
* **Asistencia:** Mantenerse activo en la plataforma para evitar activar los triggers (disparadores) de inactividad que alertan al profesor.
