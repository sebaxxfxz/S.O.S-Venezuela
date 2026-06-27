import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-surface-dark-alt border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Venezuela Flag Stripe */}
        <div className="flex rounded-full overflow-hidden h-1.5 mb-6">
          <div className="flex-1 bg-sos-yellow" />
          <div className="flex-1 bg-sos-blue" />
          <div className="flex-1 bg-sos-red" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Hecho con</span>
            <Heart className="w-4 h-4 text-sos-red fill-sos-red animate-pulse" />
            <span>para Venezuela por <strong className="text-gray-700 dark:text-gray-300 font-semibold">Fxz corporations</strong></span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            S.O.S Venezuela — Plataforma de emergencia humanitaria © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
