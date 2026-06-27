import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { timeAgo } from '../../utils/helpers';
import {
  UserPlus,
  Search,
  Newspaper,
  MapPin,
  AlertTriangle,
  Users,
  UserCheck,
  Skull,
  ChevronRight,
  Clock,
} from 'lucide-react';

function AnimatedCounter({ target, label, icon: Icon, color }: {
  target: number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-white/5"
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span
        className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums text-white"
      >
        {count}
      </span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
        {label}
      </span>
    </motion.div>
  );
}

const quickActions = [
  {
    to: '/reportar',
    label: 'Reportar Desaparecido',
    description: 'Registra un caso nuevo',
    icon: UserPlus,
    color: 'text-sos-red',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
  {
    to: '/buscar',
    label: 'Buscar Personas',
    description: 'Encuentra desaparecidos',
    icon: Search,
    color: 'text-sos-blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    to: '/noticias',
    label: 'Foro / Noticias',
    description: 'Información en tiempo real',
    icon: Newspaper,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    to: '/puntos-de-ayuda',
    label: 'Puntos de Ayuda',
    description: 'Albergues y hospitales',
    icon: MapPin,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
];

export default function HomePage() {
  const { stats, missingPersons } = useApp();
  const latestReports = missingPersons.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-surface-dark pb-10">
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-slate-200/10 bg-[#0A0E1A]">
        <div className="absolute inset-0">
          <img 
            src="/hero-bg.jpg" 
            alt="" 
            className="w-full h-full object-cover opacity-60 select-none pointer-events-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1A]/40 via-[#0A0E1A]/75 to-[#0A0E1A]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="w-20 h-14 rounded-2xl border border-white/10 bg-white/5 p-1.5 mx-auto mb-8 shadow-inner flex items-center justify-center">
            <img 
              src="/venezuela-flag.svg" 
              alt="Bandera de Venezuela" 
              className="w-full h-full object-cover rounded-lg shadow-sm"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
              S.O.S VENEZUELA
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
              Plataforma de emergencia para la búsqueda de personas desaparecidas y coordinación de asistencia humanitaria nacional.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 sm:gap-6 max-w-md mx-auto rounded-2xl bg-white/5 border border-white/10 px-4 py-6"
          >
            <AnimatedCounter target={stats.missing} label="Desaparecidos" icon={Users} color="#FFD700" />
            <AnimatedCounter target={stats.found} label="Encontrados" icon={UserCheck} color="#10B981" />
            <AnimatedCounter target={stats.deceased} label="Fallecidos" icon={Skull} color="#94A3B8" />
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <Link
                to={action.to}
                className="group block bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-sos-blue/30 dark:hover:border-sos-blue/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${action.bgColor}`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-sos-blue transition-colors">
                  {action.label}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-normal">
                  {action.description}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-sos-blue dark:text-blue-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Ingresar</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-sos-red animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Reportes más recientes
          </h2>
        </div>

        <div className="space-y-3">
          {latestReports.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link
                to={`/buscar`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark-card border border-gray-200/50 dark:border-gray-800/40 hover:border-sos-blue/20 dark:hover:border-sos-blue/20 hover:shadow-md transition-all group"
              >
                <img
                  src={person.photoUrl}
                  alt={person.fullName}
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {person.fullName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {person.lastLocation}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                    style={{
                      backgroundColor:
                        person.status === 'Desaparecido' ? '#CF142B' :
                        person.status === 'Encontrado' ? '#10B981' : '#6B7280',
                    }}
                  >
                    {person.status}
                  </span>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {timeAgo(person.createdAt)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-sos-blue transition-colors shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sos-blue hover:bg-sos-blue-light text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-sos-blue/15 hover:shadow-lg transition-all"
          >
            <Search className="w-4 h-4" />
            Ver todos los reportes
          </Link>
        </div>
      </section>

      <div className="bg-sos-blue/5 dark:bg-sos-blue/10 border-y border-sos-blue/10 py-3.5 overflow-hidden">
        <div className="animate-ticker whitespace-nowrap flex gap-12">
          {[...latestReports, ...latestReports].map((person, i) => (
            <span key={`${person.id}-${i}`} className="text-xs text-sos-blue dark:text-blue-400 font-semibold inline-flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-sos-red" />
              🆘 {person.fullName} — {person.state} — {timeAgo(person.lostAt)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
