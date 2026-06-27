import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { AID_POINT_TYPES, AID_POINT_COLORS, type AidPointType } from '../../types';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Phone,
  Clock,
  Users,
  Plus,
  X,
  Send,
  Navigation,
  Home,
  Heart,
  Package,
  UtensilsCrossed,
  List,
  Map as MapIcon,
} from 'lucide-react';

const TYPE_ICONS: Record<AidPointType, React.ElementType> = {
  'Albergue': Home,
  'Hospital': Heart,
  'Acopio': Package,
  'Comedor': UtensilsCrossed,
};

function createMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px ${color}60;
      display: flex; align-items: center; justify-content: center;
    "><div style="
      width: 10px; height: 10px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function FlyToPoint({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.flyTo([lat, lng], 14, { duration: 1 });
  return null;
}

export default function AidPointsPage() {
  const { aidPoints, addAidPoint } = useApp();
  const [filterType, setFilterType] = useState<AidPointType | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<AidPointType>('Albergue');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSchedule, setFormSchedule] = useState('');
  const [formCapacity, setFormCapacity] = useState('');

  const filtered = useMemo(() => {
    if (!filterType) return aidPoints;
    return aidPoints.filter((p) => p.type === filterType);
  }, [aidPoints, filterType]);

  const handleGeolocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormLat(pos.coords.latitude.toFixed(4));
          setFormLng(pos.coords.longitude.toFixed(4));
          toast.success('Ubicación obtenida');
        },
        () => toast.error('No se pudo obtener la ubicación')
      );
    }
  };

  const handleSubmit = () => {
    if (!formName.trim() || !formAddress.trim() || !formLat || !formLng) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    addAidPoint({
      name: formName.trim(),
      type: formType,
      address: formAddress.trim(),
      lat: parseFloat(formLat),
      lng: parseFloat(formLng),
      phone: formPhone.trim(),
      schedule: formSchedule.trim() || 'Por definir',
      capacity: formCapacity ? parseInt(formCapacity) : undefined,
    });
    setFormName(''); setFormAddress(''); setFormLat(''); setFormLng('');
    setFormPhone(''); setFormSchedule(''); setFormCapacity('');
    setShowForm(false);
    toast.success('Punto de ayuda agregado');
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-sos-blue focus:ring-2 focus:ring-sos-blue/20 transition-all";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-surface-dark">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-white/80" />
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Asistencia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Puntos de Ayuda
          </h1>
          <p className="text-sm text-white/60">
            Albergues, hospitales, centros de acopio y comedores en Venezuela
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('')}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${!filterType
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-surface-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}
            >
              Todos ({aidPoints.length})
            </button>
            {AID_POINT_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type];
              const count = aidPoints.filter((p) => p.type === type).length;
              const isActive = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(isActive ? '' : type)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${isActive ? 'text-white shadow-md' : 'bg-white dark:bg-surface-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  style={isActive ? {
                    backgroundColor: AID_POINT_COLORS[type],
                    borderColor: AID_POINT_COLORS[type],
                  } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {type} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'map' ? 'bg-white dark:bg-surface-dark-card shadow text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark-card shadow text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-2 bg-sos-red hover:bg-sos-red-dark text-white font-medium text-xs rounded-xl shadow-lg transition-all"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cerrar' : 'Agregar'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-surface-dark-card rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/30 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Agregar punto de ayuda</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nombre del punto *" className={inputClass} />
                  <select value={formType} onChange={(e) => setFormType(e.target.value as AidPointType)} className={inputClass}>
                    {AID_POINT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Dirección *" className={inputClass + ' sm:col-span-2'} />
                  <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <input type="number" step="0.0001" value={formLat} onChange={(e) => setFormLat(e.target.value)} placeholder="Latitud *" className={inputClass} />
                    <input type="number" step="0.0001" value={formLng} onChange={(e) => setFormLng(e.target.value)} placeholder="Longitud *" className={inputClass} />
                  </div>
                  <button type="button" onClick={handleGeolocate} className="sm:col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Navigation className="w-4 h-4" /> Usar mi ubicación actual
                  </button>
                  <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Teléfono" className={inputClass} />
                  <input type="text" value={formSchedule} onChange={(e) => setFormSchedule(e.target.value)} placeholder="Horario" className={inputClass} />
                  <input type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} placeholder="Capacidad (personas)" className={inputClass} />
                </div>
                <button onClick={handleSubmit} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sos-blue hover:bg-sos-blue-light text-white font-semibold text-sm rounded-xl transition-colors">
                  <Send className="w-4 h-4" /> Agregar punto
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={viewMode === 'map' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {viewMode === 'map' ? (
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200/60 dark:border-gray-700/30 h-[400px] lg:h-[600px]">
                <MapContainer
                  center={[8.0, -66.0]}
                  zoom={6}
                  className="w-full h-full"
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {flyTo && <FlyToPoint lat={flyTo.lat} lng={flyTo.lng} />}
                  {filtered.map((point) => (
                    <Marker
                      key={point.id}
                      position={[point.lat, point.lng]}
                      icon={createMarkerIcon(AID_POINT_COLORS[point.type])}
                    >
                      <Popup maxWidth={280}>
                        <div className="font-sans p-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: AID_POINT_COLORS[point.type] }}
                            >
                              {point.type}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1">{point.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{point.address}</p>
                          <div className="space-y-1">
                            {point.phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {point.phone}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {point.schedule}
                            </p>
                            {point.capacity && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Capacidad: {point.capacity}
                              </p>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.length > 0 ? filtered.map((point, i) => {
                  const Icon = TYPE_ICONS[point.type];
                  return (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white dark:bg-surface-dark-card rounded-2xl p-4 border border-gray-200/60 dark:border-gray-700/30 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => { setViewMode('map'); setFlyTo({ lat: point.lat, lng: point.lng }); }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${AID_POINT_COLORS[point.type]}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: AID_POINT_COLORS[point.type] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: AID_POINT_COLORS[point.type] }}
                            >
                              {point.type}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{point.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{point.address}</span>
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {point.phone && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {point.phone}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {point.schedule}
                            </span>
                            {point.capacity && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users className="w-3 h-3" /> {point.capacity} personas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <EmptyState title="Sin puntos de ayuda" description="No hay puntos de ayuda de este tipo." />
                )}
              </div>
            )}
          </div>

          {viewMode === 'map' && (
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {filtered.length} punto{filtered.length !== 1 ? 's' : ''} de ayuda
              </h3>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {filtered.map((point) => {
                  const Icon = TYPE_ICONS[point.type];
                  return (
                    <button
                      key={point.id}
                      onClick={() => setFlyTo({ lat: point.lat, lng: point.lng })}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-surface-dark-card border border-gray-200/60 dark:border-gray-700/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${AID_POINT_COLORS[point.type]}15` }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: AID_POINT_COLORS[point.type] }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {point.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate pl-8">{point.address}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
