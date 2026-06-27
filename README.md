# 🆘 S.O.S Venezuela

Plataforma de emergencia para la búsqueda de personas desaparecidas y ayuda humanitaria en Venezuela.

## 🚀 Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (design system con colores de Venezuela)
- **Framer Motion** (animaciones)
- **React Router DOM** (navegación SPA)
- **React Leaflet** + **OpenStreetMap** (mapas)
- **React Hot Toast** (notificaciones)
- **Lucide React** (íconos SVG)

## 📦 Instalación

```bash
npm install
npm run dev
```

## 📱 Funcionalidades

### Páginas
1. **Inicio** — Contadores en tiempo real, accesos rápidos, ticker de últimos reportes
2. **Reportar** — Formulario completo con validación, preview de foto, confirmación y compartir por WhatsApp
3. **Buscar** — Grid de tarjetas con búsqueda, filtros (estado, status, fechas), paginación, modal de detalle y pistas
4. **Noticias** — Feed cronológico con categorías coloreadas, publicar, reportar contenido
5. **Puntos de Ayuda** — Mapa Leaflet con marcadores por tipo, panel lateral, formulario para agregar puntos

### Características globales
- ✅ Modo oscuro con persistencia
- ✅ PWA instalable (manifest.json + service worker)
- ✅ URL única por reporte (`/reporte/[id]`)
- ✅ Compartir por WhatsApp con mensaje pre-armado
- ✅ Responsive completo (móvil, tablet, desktop)
- ✅ Animaciones con Framer Motion
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Estado vacío ilustrado
- ✅ Bandera de Venezuela integrada en el diseño

## 🗄️ Conectar Supabase

La app usa `useState`/`Context` con datos mock. Para conectar Supabase:

### 1. Crear proyecto en Supabase

Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo.

### 2. Crear tablas

```sql
-- Personas desaparecidas
CREATE TABLE missing_persons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  photo_url TEXT,
  last_location TEXT NOT NULL,
  state TEXT NOT NULL,
  lost_at TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Desaparecido',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pistas
CREATE TABLE tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES missing_persons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  contact_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Noticias
CREATE TABLE news_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  photo_url TEXT,
  reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Puntos de ayuda
CREATE TABLE aid_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  schedule TEXT,
  capacity INTEGER
);
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y agrega tus credenciales:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Instalar cliente Supabase

```bash
npm install @supabase/supabase-js
```

### 5. Crear cliente

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 6. Reemplazar datos mock

En `AppContext.tsx`, reemplaza los `useState` con queries de Supabase:

```ts
// Ejemplo para cargar personas
const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);

useEffect(() => {
  supabase
    .from('missing_persons')
    .select('*, tips(*)')
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      if (data) setMissingPersons(data);
    });
}, []);
```

### 7. Habilitar Storage para fotos

En el dashboard de Supabase, crea un bucket llamado `photos` con acceso público para subir las imágenes.

## ⚡ Optimización del Espacio Gratuito (Supabase Free Tier)

Supabase en su plan gratuito limita el almacenamiento de base de datos a **500 MB**, almacenamiento de archivos (Storage) a **1 GB**, y transferencia mensual (egress) a **2 GB**. Para maximizar el uso gratuito, esta app implementa y recomienda las siguientes optimizaciones:

### 1. Compresión de Imágenes del Lado del Cliente (Implementado)
Antes de subir cualquier foto a Supabase Storage (o guardarla temporalmente), la app utiliza la API nativa de `HTML5 Canvas` (`src/utils/helpers.ts`) para redimensionar la imagen a un máximo de **800x800px** y codificarla en **JPEG con calidad del 75%**.
- **Impacto:** Reduce las fotos de smartphones (~3MB - 10MB) a menos de **100 KB** (una reducción del **95% a 98%**).
- **Escala:** 1 GB de almacenamiento gratuito pasa de soportar ~200 imágenes originales a soportar **más de 10,000 imágenes optimizadas**.

### 2. Formato de Almacenamiento Eficiente en Base de Datos
- Las ubicaciones y estados se guardan como cadenas cortas estándar.
- Las coordenadas geográficas de los puntos de ayuda se guardan como tipos de datos numéricos flotantes (`double precision`), ocupando solo 8 bytes por registro en lugar de strings de texto largo.

### 3. Políticas de Retención de Datos / Auto-Eliminación (Implementado en Frontend)
- **Frontend (React):** En `src/context/AppContext.tsx` se limpia y filtra automáticamente el estado en tiempo real para que las publicaciones de la pestaña **Noticias** que tengan más de **3 horas** desaparezcan automáticamente.
- **Backend (Supabase / Postgres):** Para mantener la base de datos totalmente limpia y dentro de las cuotas gratis, puedes ejecutar esta tarea programada (cron) en el SQL Editor de Supabase para eliminar físicamente las filas de la base de datos:

```sql
-- Activar la extensión pg_cron en Supabase
create extension if not exists pg_cron;

-- Programar limpieza cada hora para borrar posts de noticias con más de 3 horas
select cron.schedule(
  'auto-delete-old-news',
  '0 * * * *', -- Cada hora
  $$ delete from news_posts where created_at < now() - interval '3 hours' $$
);
```

### 4. Caché Local (LocalStorage) para Evitar Consumo de Ancho de Banda (Egress)
El plan gratuito limita el ancho de banda de salida. Se puede configurar `localStorage` o `sessionStorage` para guardar en caché la información semiestática (como la lista de estados y puntos de ayuda) por periodos de tiempo razonables antes de volver a solicitarla al servidor.

## 📁 Estructura

```
src/
├── components/        # Componentes compartidos
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── EmptyState.tsx
│   └── Skeletons.tsx
├── context/
│   └── AppContext.tsx  # Estado global
├── data/
│   └── mockData.ts    # Datos mock de Venezuela
├── pages/
│   ├── Home/
│   ├── Report/
│   ├── Search/
│   ├── News/
│   ├── AidPoints/
│   └── ReportDetail/
├── utils/
│   └── helpers.ts     # Funciones utilitarias
├── types.ts           # Tipos TypeScript
├── App.tsx
├── main.tsx
└── index.css          # Tailwind + Design System
```

## 📄 Licencia

MIT — Hecho con ❤️ para Venezuela
