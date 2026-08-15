# 🗺️ Roadmap del Proyecto: MentorBot

![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-F5A623?style=for-the-badge)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)

El siguiente documento detalla la hoja de ruta (*roadmap*) estratégica para el desarrollo continuo de **MentorBot**. Las fases están organizadas para priorizar el lanzamiento de valor temprano, seguido de mejoras iterativas en inteligencia artificial y la expansión de la plataforma a largo plazo.

---

## 🟢 Fase 1: Corto Plazo (MVP y Estabilización)
*Objetivo: Lanzar un Producto Mínimo Viable (MVP) estable y funcional para los primeros usuarios (Early Adopters).*

- [ ] **Despliegue y CI/CD:** Configurar la integración y despliegue continuo (por ejemplo, Vercel para el frontend y MongoDB Atlas para la base de datos).
- [ ] **Optimización del RAG:** Mejorar la precisión del modelo en la recuperación de información mediante la segmentación (*chunking*) inteligente de los documentos PDF.
- [ ] **Gestión de Errores y Logs:** Implementar un sistema de monitoreo como Sentry para la captura de errores en tiempo real y asegurar la estabilidad de la plataforma.
- [ ] **Refinamiento de UI/UX:** Mejorar la interfaz de usuario en dispositivos móviles y pulir el diseño usando Tailwind CSS para una experiencia más inmersiva.
- [ ] **Auditoría de Seguridad Inicial:** Validar la protección contra vulnerabilidades comunes (XSS, inyecciones) y asegurar el correcto funcionamiento de los tokens de recuperación.

---

## 🟡 Fase 2: Mediano Plazo (Análisis Avanzado y Gamificación)
*Objetivo: Aumentar la retención de los estudiantes y proporcionar mejores herramientas analíticas a los docentes.*

- [ ] **Panel de Analíticas Avanzadas:** Gráficos interactivos para que los docentes visualicen el progreso, las preguntas más frecuentes y el nivel de comprensión general de la clase.
- [ ] **Soporte Multimedia en el Chat:** Capacidad para que la Inteligencia Artificial procese y genere no solo texto, sino que recomiende imágenes o diagramas basándose en el material del docente.
- [ ] **Sistema de Logros y Gamificación:** Implementar insignias y recompensas visuales para los estudiantes con alta participación y consistencia en el aprendizaje.
- [ ] **Exportación de Reportes:** Permitir a los docentes y administradores descargar informes en formato PDF y CSV sobre el rendimiento de las clases.
- [ ] **Notificaciones Push y Web:** Integrar alertas en tiempo real dentro de la aplicación, complementando el sistema actual de correos electrónicos.

---

## 🔴 Fase 3: Largo Plazo (Escalabilidad y Multi-Institución)
*Objetivo: Transformar la plataforma en un producto SaaS empresarial capaz de albergar múltiples instituciones (Multi-Tenant).*

- [ ] **Arquitectura Multi-Tenant:** Soporte completo para múltiples escuelas o universidades, permitiendo dominios personalizados y personalización de marca (*White Labeling*).
- [ ] **Integración con LMS Existentes:** Desarrollar APIs o conectores LTI para integrarse con sistemas como Moodle, Canvas o Blackboard.
- [ ] **Modelos de IA Personalizados (Fine-Tuning):** Entrenar modelos de lenguaje específicos para ciertas disciplinas académicas, reduciendo la dependencia exclusiva del sistema RAG.
- [ ] **Asistencia Multilingüe:** Capacidad de que el Chatbot detecte el idioma del estudiante y ofrezca traducciones y tutorías en diferentes idiomas de manera automática.
- [ ] **Escalabilidad de Infraestructura:** Migración parcial a microservicios si el flujo de peticiones lo requiere, optimizando el uso de recursos y reduciendo la latencia a nivel global.

---

*Nota: Este documento es dinámico y está sujeto a cambios basados en la retroalimentación de los usuarios y las necesidades del mercado.*
