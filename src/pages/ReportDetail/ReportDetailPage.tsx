import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { timeAgo, formatDate, generateWhatsAppLink, generateShareMessage } from '../../utils/helpers';
import { STATUS_COLORS, STATUS_OPTIONS, type Status } from '../../types';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Share2,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getPersonById, updatePersonStatus } = useApp();
  const person = id ? getPersonById(id) : undefined;

  const [showUpdate, setShowUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>(person?.status || 'Desaparecido');
  const [whatsappVerif, setWhatsappVerif] = useState('');

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Reporte no encontrado</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">El ID del reporte no existe o fue eliminado.</p>
          <Link to="/buscar" className="inline-flex items-center gap-2 px-4 py-2 bg-sos-blue text-white rounded-xl text-sm font-medium hover:bg-sos-blue-light transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a buscar
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const message = generateShareMessage(person.fullName, person.lastLocation, person.id);
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const handleUpdateStatus = () => {
    if (!whatsappVerif.trim()) {
      toast.error('Ingresa el WhatsApp del reportante');
      return;
    }
    const cleanDb = person.reporterContact.replace(/[^0-9]/g, '');
    const cleanUser = whatsappVerif.replace(/[^0-9]/g, '');

    if (cleanDb.slice(-7) === cleanUser.slice(-7)) {
      updatePersonStatus(person.id, newStatus);
      setShowUpdate(false);
      setWhatsappVerif('');
      toast.success('Estado actualizado correctamente');
    } else {
      toast.error('Número de WhatsApp incorrecto. No autorizado.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-surface-dark">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <Link to="/buscar" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-sos-red transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-6"
      >
        <div className="bg-white dark:bg-surface-dark-card rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/30 shadow-xl">
          <div className="relative h-64 sm:h-80">
            <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute bottom-4 left-4 right-4">
              <span
                className="text-xs font-bold uppercase px-3 py-1 rounded-full text-white inline-block mb-2"
                style={{ backgroundColor: STATUS_COLORS[person.status] }}
              >
                {person.status}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{person.fullName}</h1>
              <p className="text-sm text-white/70">{person.age} años</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-sos-red/5 dark:bg-sos-red/10 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">ID del reporte</p>
              <p className="text-lg font-mono font-bold text-sos-red">{person.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Ubicación</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sos-red shrink-0" /> {person.lastLocation}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Estado</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{person.state}</p>
              </div>
              <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Último contacto</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sos-blue shrink-0" /> {timeAgo(person.lostAt)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Reportado por</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <User className="w-3 h-3 shrink-0" /> {person.reporterName}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Descripción física
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{person.description}</p>
            </div>

            <p className="text-xs text-gray-400">
              Fecha: {formatDate(person.lostAt)} · Reportado: {formatDate(person.createdAt)}
            </p>

            <div className="bg-slate-50 dark:bg-surface-dark rounded-2xl p-4 border border-gray-200/50 dark:border-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    ¿Cambiar estado del reporte?
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Solo el creador del reporte puede cambiar su estado.
                  </p>
                </div>
                <button
                  onClick={() => setShowUpdate(!showUpdate)}
                  className="px-3 py-1.5 bg-sos-blue text-white font-bold text-[11px] rounded-lg shadow-sm hover:bg-sos-blue-light cursor-pointer active:scale-95 transition-all"
                >
                  {showUpdate ? 'Cancelar' : 'Actualizar'}
                </button>
              </div>

              {showUpdate && (
                <div className="mt-4 pt-3 border-t border-gray-200/30 dark:border-gray-800/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                        Nuevo Estado
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as Status)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-card text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                        WhatsApp del reportante
                      </label>
                      <input
                        type="tel"
                        value={whatsappVerif}
                        onChange={(e) => setWhatsappVerif(e.target.value)}
                        placeholder="Ej: +58 412 123 4567"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-card text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateStatus}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Confirmar Cambio
                  </button>
                </div>
              )}
            </div>

            {person.tips.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Pistas ({person.tips.length})
                </h3>
                <div className="space-y-2">
                  {person.tips.map((tip) => (
                    <div key={tip.id} className="bg-sos-blue/5 dark:bg-sos-blue/10 rounded-xl p-3 border border-sos-blue/10">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{tip.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(tip.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Share2 className="w-5 h-5" />
              Compartir por WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
