export type Status = 'Desaparecido' | 'Encontrado' | 'Fallecido';

export interface Tip {
  id: string;
  personId: string;
  content: string;
  contactWhatsApp: string;
  createdAt: string;
}

export interface MissingPerson {
  id: string;
  fullName: string;
  age: number;
  photoUrl: string;
  lastLocation: string;
  state: string;
  lostAt: string;
  description: string;
  reporterName: string;
  reporterContact: string;
  status: Status;
  tips: Tip[];
  createdAt: string;
}

export type NewsCategory = 'Rescate activo' | 'Albergue' | 'Vía bloqueada' | 'Hospital operativo' | 'Otro';

export interface ForumComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface NewsPost {
  id: string;
  content: string;
  category: NewsCategory;
  location: string;
  photoUrl?: string;
  createdAt: string;
  reported?: boolean;
  comments: ForumComment[];
}

export type AidPointType = 'Albergue' | 'Hospital' | 'Acopio' | 'Comedor';

export interface AidPoint {
  id: string;
  name: string;
  type: AidPointType;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  schedule: string;
  capacity?: number;
}

export const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas',
  'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital',
  'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda',
  'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira',
  'Trujillo', 'Vargas', 'Yaracuy', 'Zulia',
] as const;

export const NEWS_CATEGORIES: NewsCategory[] = [
  'Rescate activo', 'Albergue', 'Vía bloqueada', 'Hospital operativo', 'Otro',
];

export const AID_POINT_TYPES: AidPointType[] = [
  'Albergue', 'Hospital', 'Acopio', 'Comedor',
];

export const STATUS_OPTIONS: Status[] = ['Desaparecido', 'Encontrado', 'Fallecido'];

export const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  'Rescate activo': '#CF142B',
  'Albergue': '#003087',
  'Vía bloqueada': '#6B7280',
  'Hospital operativo': '#10B981',
  'Otro': '#FFD700',
};

export const AID_POINT_COLORS: Record<AidPointType, string> = {
  'Albergue': '#003087',
  'Hospital': '#CF142B',
  'Acopio': '#10B981',
  'Comedor': '#F97316',
};

export const STATUS_COLORS: Record<Status, string> = {
  'Desaparecido': '#CF142B',
  'Encontrado': '#10B981',
  'Fallecido': '#6B7280',
};
