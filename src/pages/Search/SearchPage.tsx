import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { timeAgo, formatDate, generateWhatsAppLink, generateShareMessage } from '../../utils/helpers';
import { VENEZUELAN_STATES, STATUS_OPTIONS, STATUS_COLORS, type Status } from '../../types';
import type { MissingPerson } from '../../types';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import {
  Search,
  MapPin,
  Clock,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  Phone,
  User,
  Send,
  Eye,
  AlertTriangle,
  Users,
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function SearchPage() {
  const { missingPersons, addTip } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipContent, setTipContent] = useState('');
  const [tipWhatsApp, setTipWhatsApp] = useState('');

  const filtered = useMemo(() => {
    let result = [...missingPersons];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.lastLocation.toLowerCase().includes(term)
      );
    }
    if (filterState) result = result.filter((p) => p.state === filterState);
    if (filterStatus) result = result.filter((p) => p.status === filterStatus);
    if (filterDateFrom) result = result.filter((p) => new Date(p.lostAt) >= new Date(filterDateFrom));
    if (filterDateTo) result = result.filter((p) => new Date(p.lostAt) <= new Date(filterDateTo));
    return result;
  }, [missingPersons, searchTerm, filterState, filterStatus, filterDateFrom, filterDateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setFilterState('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(1);
  };

  const hasActiveFilters = filterState || filterStatus || filterDateFrom || filterDateTo;

  const handleSendTip = () => {
    if (!selectedPerson || !tipContent.trim() || !tipWhatsApp.trim()) {
      toast.error('Completa todos los campos');
      return;
    }
    addTip(selectedPerson.id, { content: tipContent.trim(), contactWhatsApp: tipWhatsApp.trim() });
    toast.success('Pista enviada. Gracias por tu ayuda.');
    setTipContent('');
    setTipWhatsApp('');
    setShowTipForm(false);
    // Refresh selected person data
    setSelectedPerson((prev) => prev ? { ...prev } : null);
  };

  const handleShare = (person: MissingPerson) => {
    const message = generateShareMessage(person.fullName, person.lastLocation, person.id);
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const selectClass = "px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-card text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-sos-blue focus:ring-2 focus:ring-sos-blue/20 transition-all";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-surface-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-sos-blue to-sos-blue-dark py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-sos-yellow" />
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Búsqueda</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Buscar Desaparecidos
          </h1>
          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre o ubicación..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm outline-none focus:bg-white/20 focus:border-white/40 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-sos-red hover:underline">
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-sos-blue text-white border-sos-blue'
                  : 'bg-white dark:bg-surface-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-sos-blue'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-sos-yellow text-[10px] font-bold text-gray-900 rounded-full flex items-center justify-center">
                  {[filterState, filterStatus, filterDateFrom, filterDateTo].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white dark:bg-surface-dark-card rounded-2xl border border-gray-200/60 dark:border-gray-700/30">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</label>
                  <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setPage(1); }} className={selectClass + ' w-full'}>
                    <option value="">Todos los estados</option>
                    {VENEZUELAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as Status | ''); setPage(1); }} className={selectClass + ' w-full'}>
                    <option value="">Todos</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desde</label>
                  <input type="date" value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }} className={selectClass + ' w-full'} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
                  <input type="date" value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }} className={selectClass + ' w-full'} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((person, i) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPerson(person)}
                  className="group cursor-pointer bg-white dark:bg-surface-dark-card rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/30 hover:border-sos-red/30 dark:hover:border-sos-red/30 hover:shadow-xl transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={person.photoUrl}
                      alt={person.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full text-white shadow-lg"
                        style={{ backgroundColor: STATUS_COLORS[person.status] }}
                      >
                        {person.status}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(person.lostAt)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {person.fullName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {person.age} años
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {person.lastLocation}
                    </p>
                    {person.tips.length > 0 && (
                      <p className="text-[10px] text-sos-blue dark:text-blue-400 mt-2 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {person.tips.length} pista{person.tips.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Sin resultados"
            description="No se encontraron personas con los criterios de búsqueda. Intenta con otros filtros."
          />
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => { setSelectedPerson(null); setShowTipForm(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark-alt w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
            >
              {/* Modal Header Image */}
              <div className="relative h-56 sm:h-64">
                <img
                  src={selectedPerson.photoUrl}
                  alt={selectedPerson.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <button
                  onClick={() => { setSelectedPerson(null); setShowTipForm(false); }}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <span
                    className="text-xs font-bold uppercase px-3 py-1 rounded-full text-white inline-block mb-2"
                    style={{ backgroundColor: STATUS_COLORS[selectedPerson.status] }}
                  >
                    {selectedPerson.status}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {selectedPerson.fullName}
                  </h2>
                  <p className="text-sm text-white/70">{selectedPerson.age} años</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-surface-dark-card rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Ubicación</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sos-red shrink-0" />
                      {selectedPerson.lastLocation}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-surface-dark-card rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Estado</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {selectedPerson.state}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-surface-dark-card rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Último contacto</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sos-blue shrink-0" />
                      {timeAgo(selectedPerson.lostAt)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-surface-dark-card rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Reportado por</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <User className="w-3 h-3 shrink-0" />
                      {selectedPerson.reporterName}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Descripción física
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedPerson.description}
                  </p>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400">
                  Fecha último contacto: {formatDate(selectedPerson.lostAt)}
                </p>

                {/* Tips */}
                {selectedPerson.tips.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Pistas recibidas ({selectedPerson.tips.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedPerson.tips.map((tip) => (
                        <div key={tip.id} className="bg-sos-blue/5 dark:bg-sos-blue/10 rounded-xl p-3 border border-sos-blue/10">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{tip.content}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(tip.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tip Form */}
                <AnimatePresence>
                  {showTipForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 bg-gray-50 dark:bg-surface-dark-card rounded-xl p-4 border border-gray-200/60 dark:border-gray-700/30">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          ¿Tienes información?
                        </h4>
                        <textarea
                          value={tipContent}
                          onChange={(e) => setTipContent(e.target.value)}
                          placeholder="Describe lo que sabes..."
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-sos-blue"
                        />
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            value={tipWhatsApp}
                            onChange={(e) => setTipWhatsApp(e.target.value)}
                            placeholder="Tu WhatsApp"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-sos-blue"
                          />
                        </div>
                        <button
                          onClick={handleSendTip}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sos-blue hover:bg-sos-blue-light text-white font-medium text-sm rounded-xl transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Enviar pista
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowTipForm(!showTipForm)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sos-blue hover:bg-sos-blue-light text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Tengo información
                  </button>
                  <button
                    onClick={() => handleShare(selectedPerson)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
