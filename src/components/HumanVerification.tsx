import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

interface HumanVerificationProps {
  onVerify: (verified: boolean) => void;
}

export default function HumanVerification({ onVerify }: HumanVerificationProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  useEffect(() => {
    if (status === 'verifying') {
      const timer = setTimeout(() => {
        setStatus('verified');
        onVerify(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onVerify]);

  const handleCheck = () => {
    if (status === 'idle') {
      setStatus('verifying');
      setIsChecked(true);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-dark-card rounded-xl p-3 flex items-center justify-between max-w-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={status !== 'idle'}
          className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
            status === 'verified'
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : status === 'verifying'
              ? 'border-sos-blue bg-sos-blue/10'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark hover:border-sos-blue cursor-pointer'
          }`}
        >
          {status === 'verifying' && (
            <Loader2 className="w-3.5 h-3.5 text-sos-blue animate-spin" />
          )}
          {status === 'verified' && (
            <svg
              className="w-3.5 h-3.5 stroke-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
          {status === 'verified'
            ? 'Verificación completada'
            : status === 'verifying'
            ? 'Verificando que no eres un robot...'
            : 'Confirma que eres humano'}
        </span>
      </div>
      <div className="flex flex-col items-end leading-none shrink-0 text-slate-400 dark:text-slate-600">
        {status === 'verified' ? (
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        ) : (
          <ShieldAlert className="w-5 h-5" />
        )}
        <span className="text-[7px] uppercase tracking-wider mt-0.5 font-mono">
          Security Shield
        </span>
      </div>
    </div>
  );
}
