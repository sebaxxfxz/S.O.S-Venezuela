import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  UserPlus,
  Search,
  Newspaper,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/reportar', label: 'Reportar', icon: UserPlus },
  { to: '/buscar', label: 'Buscar', icon: Search },
  { to: '/noticias', label: 'Noticias', icon: Newspaper },
  { to: '/puntos-de-ayuda', label: 'Ayuda', icon: MapPin },
];

export default function Header() {
  const { darkMode, toggleDarkMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 premium-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex">
                {/* Clean, correct tricolor indicator */}
                <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col shadow-md shadow-sos-blue/15 border border-gray-200/20">
                  <span className="bg-[#FFD700] h-1/3 w-full" />
                  <span className="bg-[#003087] h-1/3 w-full" />
                  <span className="bg-[#CF142B] h-1/3 w-full" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sos-red rounded-full animate-ping" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white group-hover:text-sos-red transition-colors">
                  S.O.S
                </span>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Venezuela
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-sos-red dark:text-sos-red-light bg-red-50 dark:bg-red-950/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-sos-red dark:hover:text-sos-red-light hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-sos-red dark:bg-sos-red-light rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {darkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5 text-sos-yellow" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5 text-sos-blue" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menú"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-gray-200/60 dark:border-gray-700/40 overflow-hidden bg-white dark:bg-surface-dark"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'text-sos-red dark:text-sos-red-light bg-red-50 dark:bg-red-950/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
