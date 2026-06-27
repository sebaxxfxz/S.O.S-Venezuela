import { useState, useRef, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { generateWhatsAppLink, generateShareMessage, compressImage } from '../../utils/helpers';
import { VENEZUELAN_STATES, STATUS_OPTIONS, type Status } from '../../types';
import toast from 'react-hot-toast';
import HumanVerification from '../../components/HumanVerification';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  Share2,
  AlertTriangle,
  Camera,
  X,
} from 'lucide-react';

interface FormData {
  fullName: string;
  age: string;
  photoFile: File | null;
  photoPreview: string;
  state: string;
  lastLocation: string;
  lostAt: string;
  description: string;
  reporterName: string;
  reporterContact: string;
  status: Status;
}

interface FormErrors {
  [key: string]: string;
}

const initialForm: FormData = {
  fullName: '',
  age: '',
  photoFile: null,
  photoPreview: '',
  state: '',
  lastLocation: '',
  lostAt: '',
  description: '',
  reporterName: '',
  reporterContact: '',
  status: 'Desaparecido',
};

export default function ReportPage() {
  const { addMissingPerson } = useApp();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<{ id: string; name: string; location: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'El nombre es obligatorio';
    if (!form.age || parseInt(form.age) < 0 || parseInt(form.age) > 120) newErrors.age = 'Edad inválida (0-120)';
    if (!form.state) newErrors.state = 'Selecciona un estado';
    if (!form.lastLocation.trim()) newErrors.lastLocation = 'La ubicación es obligatoria';
    if (!form.lostAt) newErrors.lostAt = 'La fecha es obligatoria';
    if (!form.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!form.reporterName.trim()) newErrors.reporterName = 'Tu nombre es obligatorio';
    if (!form.reporterContact.trim()) newErrors.reporterContact = 'Tu WhatsApp es obligatorio';
    else if (!/^\+?[\d\s-]{10,15}$/.test(form.reporterContact.replace(/\s/g, '')))
      newErrors.reporterContact = 'Número de WhatsApp inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const [isCompressing, setIsCompressing] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const toastId = toast.loading('Optimizando imagen...');
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        const response = await fetch(compressedBase64);
        const blob = await response.blob();
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        setForm((prev) => ({
          ...prev,
          photoFile: compressedFile,
          photoPreview: compressedBase64,
        }));
        
        const originalKB = (file.size / 1024).toFixed(1);
        const compressedKB = (compressedFile.size / 1024).toFixed(1);
        toast.success(`Imagen optimizada: ${originalKB}KB ➜ ${compressedKB}KB`, { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error('Error al optimizar imagen', { id: toastId });
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photoFile: null, photoPreview: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }
    if (!isVerified) {
      toast.error('Por favor completa la verificación de seguridad');
      return;
    }
    const person = addMissingPerson({
      fullName: form.fullName.trim(),
      age: parseInt(form.age),
      photoUrl: form.photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.fullName)}&size=400&background=CF142B&color=fff&bold=true`,
      lastLocation: form.lastLocation.trim(),
      state: form.state,
      lostAt: form.lostAt,
      description: form.description.trim(),
      reporterName: form.reporterName.trim(),
      reporterContact: form.reporterContact.trim(),
      status: form.status,
    });
    setSubmitted({ id: person.id, name: person.fullName, location: person.lastLocation });
    toast.success('Reporte enviado exitosamente');
  };

  const handleShareWhatsApp = () => {
    if (!submitted) return;
    const message = generateShareMessage(submitted.name, submitted.location, submitted.id);
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const handleNewReport = () => {
    setForm(initialForm);
    setSubmitted(null);
    setErrors({});
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none bg-white dark:bg-surface-dark-card text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
      errors[field]
        ? 'border-sos-red ring-2 ring-sos-red/20'
        : 'border-gray-200 dark:border-gray-700 focus:border-sos-blue focus:ring-2 focus:ring-sos-blue/20'
    }`;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center bg-white dark:bg-surface-dark-card rounded-3xl p-8 shadow-2xl border border-gray-200/60 dark:border-gray-700/30"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reporte Enviado
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            El reporte de <strong className="text-gray-700 dark:text-gray-200">{submitted.name}</strong> ha sido registrado.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">ID del reporte</p>
            <p className="text-lg font-mono font-bold text-sos-blue dark:text-blue-400">
              {submitted.id}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Share2 className="w-5 h-5" />
              Compartir por WhatsApp
            </button>
            <button
              onClick={handleNewReport}
              className="w-full px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-sos-red dark:hover:text-sos-red-light rounded-xl border border-gray-200 dark:border-gray-700 hover:border-sos-red/30 transition-all"
            >
              Crear otro reporte
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-surface-dark">
      <div className="bg-gradient-to-r from-sos-red to-sos-red-dark py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4">
            <AlertTriangle className="w-4 h-4 text-sos-yellow" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Reporte de Emergencia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Reportar Persona Desaparecida
          </h1>
          <p className="text-sm text-white/60">
            Completa la información para generar un reporte de búsqueda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            {form.photoPreview ? (
              <div className="relative">
                <img
                  src={form.photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={isCompressing}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-sos-red text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sos-red-dark transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 hover:border-sos-blue dark:hover:border-sos-blue transition-colors bg-white dark:bg-surface-dark-card disabled:opacity-50"
              >
                {isCompressing ? (
                  <div className="w-6 h-6 border-2 border-sos-blue border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
                <span className="text-xs text-gray-500">
                  {isCompressing ? 'Optimizando...' : 'Subir foto'}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Opcional · Máx 5MB</p>
        </motion.div>

        <motion.fieldset
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 bg-white dark:bg-surface-dark-card rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/30 shadow-sm"
        >
          <legend className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 px-1">
            <User className="w-4 h-4 text-sos-blue" />
            Datos de la persona
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Nombre completo <span className="text-sos-red">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Ej: María Elena Rodríguez"
                className={inputClass('fullName')}
              />
              {errors.fullName && <p className="text-xs text-sos-red mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Edad <span className="text-sos-red">*</span>
              </label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Ej: 34"
                min="0"
                max="120"
                className={inputClass('age')}
              />
              {errors.age && <p className="text-xs text-sos-red mt-1">{errors.age}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Estado <span className="text-sos-red">*</span>
            </label>
            <select
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={inputClass('state')}
            >
              <option value="">Selecciona un estado</option>
              {VENEZUELAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-sos-red mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Última ubicación conocida <span className="text-sos-red">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.lastLocation}
                onChange={(e) => handleChange('lastLocation', e.target.value)}
                placeholder="Ej: Centro Comercial Sambil, Caracas"
                className={`${inputClass('lastLocation')} pl-10`}
              />
            </div>
            {errors.lastLocation && <p className="text-xs text-sos-red mt-1">{errors.lastLocation}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Fecha y hora del último contacto <span className="text-sos-red">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="datetime-local"
                value={form.lostAt}
                onChange={(e) => handleChange('lostAt', e.target.value)}
                className={`${inputClass('lostAt')} pl-10`}
              />
            </div>
            {errors.lostAt && <p className="text-xs text-sos-red mt-1">{errors.lostAt}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Descripción física <span className="text-sos-red">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Estatura, peso, color de cabello, ropa que vestía, señas particulares..."
              rows={4}
              className={inputClass('description')}
            />
            {errors.description && <p className="text-xs text-sos-red mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange('status', s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.status === s
                      ? s === 'Desaparecido' ? 'bg-sos-red text-white border-sos-red' :
                        s === 'Encontrado' ? 'bg-emerald-500 text-white border-emerald-500' :
                        'bg-gray-500 text-white border-gray-500'
                      : 'bg-white dark:bg-surface-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.fieldset>

        <motion.fieldset
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 bg-white dark:bg-surface-dark-card rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/30 shadow-sm"
        >
          <legend className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 px-1">
            <FileText className="w-4 h-4 text-sos-blue" />
            Datos del reportante
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Tu nombre <span className="text-sos-red">*</span>
              </label>
              <input
                type="text"
                value={form.reporterName}
                onChange={(e) => handleChange('reporterName', e.target.value)}
                placeholder="Tu nombre completo"
                className={inputClass('reporterName')}
              />
              {errors.reporterName && <p className="text-xs text-sos-red mt-1">{errors.reporterName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                WhatsApp <span className="text-sos-red">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.reporterContact}
                  onChange={(e) => handleChange('reporterContact', e.target.value)}
                  placeholder="+58 412 123 4567"
                  className={`${inputClass('reporterContact')} pl-10`}
                />
              </div>
              {errors.reporterContact && <p className="text-xs text-sos-red mt-1">{errors.reporterContact}</p>}
            </div>
          </div>
        </motion.fieldset>

        <HumanVerification onVerify={setIsVerified} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="submit"
            disabled={isCompressing || !isVerified}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-sos-red to-sos-red-dark hover:from-sos-red-dark hover:to-sos-red text-white font-bold text-base rounded-2xl shadow-xl shadow-sos-red/25 hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isCompressing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Optimizando imagen...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Enviar Reporte
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
