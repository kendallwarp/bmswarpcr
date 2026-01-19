# 📅 Warp CR - Cronograma de Publicaciones

**Warp CR** es una aplicación moderna de gestión de contenido para redes sociales diseñada para equipos de marketing. Permite planificar, organizar y gestionar publicaciones en múltiples plataformas sociales con un calendario visual intuitivo.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## ✨ Características Principales

### 🗓️ Gestión de Contenido
- **Calendario Visual**: Vista mensual con drag-and-drop para reorganizar publicaciones
- **Vista de Lista**: Alternar entre vista de calendario y lista para mejor organización
- **Gestión de Marcas**: Manejo de múltiples marcas con colores personalizados
- **Multi-Plataforma**: Soporte para Facebook, Instagram, TikTok, LinkedIn, WhatsApp y más

### 📊 Analytics y KPIs
- **Dashboard de KPIs**: Visualización de métricas clave de rendimiento
- **Análisis de Presupuesto**: Control de inversión publicitaria
- **Métricas por Plataforma**: Estadísticas detalladas por red social
- **Reportes Exportables**: Genera reportes en PDF y CSV

### 🔐 Seguridad y Colaboración
- **Autenticación Segura**: Sistema de login/signup con Supabase
- **Modo Equipo**: Datos compartidos entre todos los usuarios autenticados
- **Row Level Security (RLS)**: Políticas de seguridad a nivel de base de datos
- **Roles de Usuario**: Administrador y Editor

### 🎨 Experiencia de Usuario
- **Tema Oscuro/Claro**: Interfaz adaptable con toggle de tema
- **Multi-Idioma**: Soporte para español e inglés
- **Diseño Responsivo**: Optimizado para desktop, tablet y mobile
- **Exportación Visual**: Genera PDFs con diseño profesional

### 🚀 Integración con APIs
- **Meta/Facebook**: Integración con Meta Business API
- **TikTok**: Conexión con TikTok Ads API
- **LinkedIn**: Integración con LinkedIn Marketing API
- **WhatsApp**: Soporte para WhatsApp Business API

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de CSS
- **Lucide React** - Iconos

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
- **PostgreSQL** - Base de datos principal
- **Row Level Security** - Políticas de seguridad

### Almacenamiento Local
- **Dexie.js** - IndexedDB wrapper para caché local

### Librerías Adicionales
- **date-fns** - Manipulación de fechas
- **html2canvas** - Captura de pantalla
- **jsPDF** - Generación de PDFs
- **papaparse** - Parser de CSV
- **recharts** - Gráficas y visualizaciones

---

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita disponible)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/cronograma.git
cd cronograma
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` basado en `.env.example`:
```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. Configurar Base de Datos
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al SQL Editor
3. Ejecuta las migraciones en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_share_data.sql`

### 5. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🏗️ Estructura del Proyecto

```
cronograma/
├── src/
│   ├── components/         # Componentes de React
│   │   ├── Calendar.tsx    # Vista de calendario
│   │   ├── KPIDashboard.tsx# Dashboard de métricas
│   │   ├── ContentModal.tsx# Modal de creación/edición
│   │   ├── BrandSelector.tsx
│   │   └── ...
│   ├── context/           # Context Providers
│   │   ├── AuthContext.tsx
│   │   ├── BrandContext.tsx
│   │   ├── PostContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── services/          # Servicios y APIs
│   │   ├── api/           # Clientes de API
│   │   │   ├── metaApiClient.ts
│   │   │   ├── tiktokApiClient.ts
│   │   │   ├── linkedinApiClient.ts
│   │   │   └── whatsappApiClient.ts
│   │   └── dataFetchingService.ts
│   ├── utils/             # Utilidades
│   │   ├── pdfGenerator.ts
│   │   ├── imageHelper.ts
│   │   ├── backupService.ts
│   │   └── ...
│   ├── db/                # IndexedDB (Dexie)
│   ├── types/             # Tipos de TypeScript
│   ├── pages/             # Páginas principales
│   └── lib/               # Configuraciones
├── supabase/
│   └── migrations/        # Migraciones de DB
├── public/                # Archivos estáticos
└── package.json
```

---

## 📖 Uso

### Crear una Marca
1. Haz clic en el selector de marcas
2. Selecciona "Crear Nueva Marca"
3. Ingresa nombre, color y credenciales de API (opcional)

### Crear una Publicación
1. Haz clic en "Nueva Publicación"
2. Completa los detalles:
   - Fecha y hora
   - Plataforma social
   - Objetivo de la campaña
   - Copy y contenido visual
   - Presupuesto (si es pagado)
3. Guarda como borrador o programa

### Exportar Reportes
1. Ve al Dashboard de KPIs
2. Selecciona el rango de fechas
3. Haz clic en "Exportar"
4. Elige formato: PDF o CSV

---

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio**
   ```bash
   # Push a GitHub
   git push origin main
   ```

2. **Crear proyecto en Vercel**
   - Importa tu repositorio de GitHub
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Agregar variables de entorno**
   ```
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_key
   ```

4. **Configurar dominio personalizado**
   - Ve a Settings → Domains
   - Agrega tu dominio (ej: `warpcr.com`)
   - Configura DNS según instrucciones

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas.

---

## 🔒 Seguridad

- **RLS Habilitado**: Todas las tablas usan Row Level Security
- **Autenticación JWT**: Tokens seguros de Supabase
- **HTTPS Only**: Conexiones encriptadas
- **Credenciales Encriptadas**: API keys almacenadas de forma segura

---

## 🧪 Testing

```bash
# Ejecutar linter
npm run lint

# Build de producción
npm run build

# Preview de build
npm run preview
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y está bajo la licencia de Warp CR.

---

## 📧 Soporte

Para soporte y consultas:
- **Email**: soporte@warpcr.com
- **Documentación**: [DEPLOY.md](./DEPLOY.md)
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 🎯 Roadmap

- [ ] Publicación automática programada
- [ ] Integración con más plataformas (Twitter/X, YouTube)
- [ ] Analytics en tiempo real desde APIs
- [ ] Editor de imágenes integrado
- [ ] Sistema de aprobaciones multi-nivel
- [ ] Notificaciones push
- [ ] Mobile app (React Native)

---

**Desarrollado con ❤️ por el equipo de Warp CR**
