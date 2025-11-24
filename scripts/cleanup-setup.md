# 🧹 Sistema de Limpieza Automática de Pre-registros

## Descripción General

Este sistema optimiza la base de datos eliminando automáticamente los pre-registros que no han sido verificados en el tiempo establecido.

## ⚙️ Configuraciones de Limpieza

### 1. **TTL (Time To Live) Nativo de MongoDB**
- **Ubicación**: `PreRegistration` model
- **Tiempo**: 24 horas desde la creación
- **Funcionamiento**: MongoDB elimina automáticamente los documentos cuando llegan a `expiresAt`

### 2. **Limpieza Manual en Verificación**
- **Ubicación**: API `/api/auth/verify-email`
- **Función**: Elimina registros expirados al intentar verificar
- **Ventaja**: Feedback inmediato al usuario sobre enlaces expirados

### 3. **Cron Job de Limpieza**
- **Endpoint**: `/api/cron/cleanup-preregistrations`
- **Métodos**: POST (limpiar), GET (estadísticas)
- **Autenticación**: Bearer token con `CRON_SECRET_TOKEN`

## 📊 Endpoints Disponibles

### POST `/api/cron/cleanup-preregistrations`
**Función**: Ejecuta limpieza completa de registros expirados

**Headers requeridos**:
```
Authorization: Bearer {CRON_SECRET_TOKEN}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Limpieza completada. X registros eliminados.",
  "stats": {
    "timestamp": "2025-11-24T18:30:00.000Z",
    "expired_deleted": 5,
    "expired_found": 5,
    "active_remaining": 12,
    "oldest_active": "2025-11-24T16:00:00.000Z",
    "newest_active": "2025-11-24T18:25:00.000Z"
  }
}
```

### GET `/api/cron/cleanup-preregistrations`
**Función**: Obtiene estadísticas sin ejecutar limpieza

**Respuesta**:
```json
{
  "success": true,
  "stats": {
    "timestamp": "2025-11-24T18:30:00.000Z",
    "total_preregistrations": 17,
    "active_preregistrations": 12,
    "expired_preregistrations": 5,
    "expiring_soon": 2
  }
}
```

## 🔧 Script Manual

### Ejecución Local
```bash
# Compilar TypeScript
npx tsc scripts/cleanup-preregistrations.ts --target es2020 --module commonjs --outDir temp

# Ejecutar
node temp/scripts/cleanup-preregistrations.js

# Limpiar archivos temporales
rm -rf temp
```

### Funciones del Script
- ✅ Conecta a MongoDB directamente
- ✅ Cuenta registros expirados antes de eliminar
- ✅ Muestra emails que serán eliminados
- ✅ Proporciona estadísticas detalladas
- ✅ Identifica registros próximos a expirar

## ⏰ Programación Automática

### Opción 1: Cron Job del Sistema
```bash
# Ejecutar cada hora
0 * * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://tu-dominio.com/api/cron/cleanup-preregistrations
```

### Opción 2: Servicio Externo (Vercel Cron)
```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-preregistrations",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

### Opción 3: GitHub Actions
```yaml
# .github/workflows/cleanup.yml
name: Database Cleanup
on:
  schedule:
    - cron: '0 */3 * * *'  # Cada 3 horas
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup expired registrations
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}" \
            https://tu-dominio.com/api/cron/cleanup-preregistrations
```

## 🔒 Seguridad

### Variables de Entorno Requeridas
```env
CRON_SECRET_TOKEN="tu_token_super_secreto_aqui"
MONGODB_URI="mongodb+srv://..."
```

### Protección de Endpoints
- ✅ Autenticación Bearer token obligatoria
- ✅ Validación de token en cada request
- ✅ Logs de seguridad para accesos no autorizados

## 📈 Monitoreo y Logs

### Logs Automáticos
```
🧹 Iniciando limpieza automática de pre-registros...
📊 Estadísticas de limpieza: {...}
🗑️  Eliminados 5 pre-registros expirados
✨ No hay registros expirados para eliminar
```

### Métricas Importantes
- **expired_deleted**: Registros eliminados en esta ejecución
- **active_remaining**: Pre-registros válidos restantes
- **expiring_soon**: Registros que expirarán en 2 horas

## 🚀 Beneficios del Sistema

### Rendimiento
- ✅ Base de datos más ligera
- ✅ Consultas más rápidas
- ✅ Menor uso de almacenamiento

### Seguridad
- ✅ Elimina datos sensibles no utilizados
- ✅ Previene acumulación de registros zombie
- ✅ Cumple políticas de retención de datos

### Mantenimiento
- ✅ Completamente automático
- ✅ Auto-documentado con logs
- ✅ Estadísticas en tiempo real

## 🔧 Configuración Personalizada

### Cambiar Tiempo de Expiración
```typescript
// En PreRegistration.ts
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 horas
  expires: 0
}
```

### Frecuencia de Limpieza
Ajustar según volumen de registros:
- **Alto volumen**: Cada 1-2 horas
- **Volumen medio**: Cada 3-6 horas  
- **Bajo volumen**: Cada 12-24 horas