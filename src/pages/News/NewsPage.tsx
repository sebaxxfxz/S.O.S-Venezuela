import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { timeAgo, compressImage } from '../../utils/helpers';
import { NEWS_CATEGORIES, VENEZUELAN_STATES, type NewsCategory } from '../../types';
import EmptyState from '../../components/EmptyState';
import HumanVerification from '../../components/HumanVerification';
import toast from 'react-hot-toast';
import {
  Camera,
  Send,
  X,
  Shield,
  Flag,
  Plus,
  Users,
  MessageCircle,
  MapPin,
  Clock,
  CornerDownRight,
  User,
} from 'lucide-react';

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  'Rescate activo': '#CF142B',
  'Albergue': '#003087',
  'Vía bloqueada': '#64748B',
  'Hospital operativo': '#10B981',
  'Otro': '#D97706',
};

const getPostNum = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 9000000) + 1000000;
};

export default function NewsPage() {
  const { newsPosts, addNewsPost, addComment, reportNewsPost } = useApp();
  const [selectedState, setSelectedState] = useState<string>('Nacional');
  const [filterCategory, setFilterCategory] = useState<NewsCategory | ''>('');

  const [showForm, setShowForm] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState<NewsCategory>('Otro');
  const [formLocation, setFormLocation] = useState('');
  const [formAuthor, setFormAuthor] = useState(() => {
    return localStorage.getItem('sos-forum-name') || '';
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [commentAuthorName, setCommentAuthorName] = useState(() => {
    return localStorage.getItem('sos-forum-name') || '';
  });
  const [commentContent, setCommentContent] = useState('');
  const replyTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = useMemo(() => {
    return newsPosts.filter((p) => {
      const matchState = selectedState === 'Nacional' || p.location.toLowerCase().includes(selectedState.toLowerCase());
      const matchCategory = !filterCategory || p.category === filterCategory;
      return matchState && matchCategory;
    });
  }, [newsPosts, selectedState, filterCategory]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const toastId = toast.loading('Optimizando foto...');
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.75);
        setPhotoPreview(compressedBase64);
        toast.success('Imagen lista', { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error('Error al procesar foto', { id: toastId });
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const [isVerified, setIsVerified] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      toast.error('El contenido de la publicación es obligatorio');
      return;
    }
    if (!isVerified) {
      toast.error('Por favor completa la verificación de seguridad');
      return;
    }

    const name = formAuthor.trim();
    localStorage.setItem('sos-forum-name', name);
    setCommentAuthorName(name);

    const contentText = [
      formSubject.trim() ? `[Asunto: ${formSubject.trim()}]` : '',
      formContent.trim()
    ].filter(Boolean).join('\n');

    addNewsPost({
      content: `${name || 'Anónimo'}: ${contentText}`,
      category: formCategory,
      location: formLocation.trim() || selectedState,
      photoUrl: photoPreview || undefined,
      comments: [],
    });

    setFormContent('');
    setFormSubject('');
    setFormLocation('');
    setPhotoPreview('');
    setIsVerified(false);
    setShowForm(false);
    toast.success('Hilo creado exitosamente');
  };

  const handleSendComment = (postId: string) => {
    if (!commentContent.trim()) {
      toast.error('Escribe tu respuesta');
      return;
    }
    const name = commentAuthorName.trim();
    localStorage.setItem('sos-forum-name', name);
    setFormAuthor(name);

    const author = name || 'Anónimo';
    addComment(postId, author, commentContent.trim());
    setCommentContent('');
    setReplyingToId(null);
    toast.success('Respuesta enviada');
  };

  const insertQuote = (postNum: number) => {
    setCommentContent((prev) => `${prev} >>${postNum} `);
    if (replyTextAreaRef.current) {
      replyTextAreaRef.current.focus();
    }
  };

  const renderTextContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('>')) {
        if (trimmed.startsWith('>>')) {
          return (
            <span key={idx} className="text-sos-red hover:underline font-mono font-bold block cursor-pointer">
              {line}
            </span>
          );
        }
        return (
          <span key={idx} className="text-emerald-600 dark:text-emerald-400 font-mono block">
            {line}
          </span>
        );
      }
      return <span key={idx} className="block text-gray-800 dark:text-gray-200">{line}</span>;
    });
  };

  return (
    <div className="min-h-screen mesh-gradient-emergency pb-10">
      <div className="bg-gradient-to-r from-sos-red to-sos-red-dark py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-sos-yellow animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                Canal de Comunicación Nacional
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Foro Informativo (/sos/)
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-sos-red font-bold text-xs rounded-xl shadow-lg hover:bg-gray-100 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Cerrar' : 'Crear Hilo'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark-alt border-b border-gray-200/50 dark:border-gray-800/40 sticky top-16 z-30 shadow-sm overflow-x-auto scrollbar-none flex gap-1.5 px-4 py-3">
        <button
          onClick={() => { setSelectedState('Nacional'); setFilterCategory(''); }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            selectedState === 'Nacional'
              ? 'bg-sos-blue text-white shadow-md shadow-sos-blue/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span className="inline-flex flex-col w-4.5 h-3 rounded-[2px] overflow-hidden shadow-sm shrink-0 border border-white/20">
            <span className="bg-[#FFD700] h-1/3 w-full" />
            <span className="bg-[#003087] h-1/3 w-full" />
            <span className="bg-[#CF142B] h-1/3 w-full" />
          </span>
          Todo el País
        </button>
        {VENEZUELAN_STATES.map((state) => (
          <button
            key={state}
            onClick={() => { setSelectedState(state); setFilterCategory(''); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              selectedState === state
                ? 'bg-sos-blue text-white shadow-md shadow-sos-blue/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-5 space-y-5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1 text-xs">
          <button onClick={() => setFilterCategory('')} className={`px-3 py-2 rounded-xl border font-bold transition-all ${!filterCategory ? 'bg-sos-blue text-white' : 'bg-white dark:bg-surface-dark-card text-gray-500'}`}>[Todo]</button>
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
              className="px-3 py-2 rounded-xl border font-bold transition-all"
              style={{
                borderColor: CATEGORY_COLORS[cat],
                color: filterCategory === cat ? '#fff' : CATEGORY_COLORS[cat],
                backgroundColor: filterCategory === cat ? CATEGORY_COLORS[cat] : 'transparent',
              }}
            >
              [{cat}]
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handlePublish} className="bg-white dark:bg-surface-dark-card rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/30 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-sos-red dark:text-sos-red-light">
                    Crear Nuevo Hilo (Imageboard)
                  </h3>
                  <span className="text-[10px] text-gray-400">Canal: {selectedState}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Nombre (Anónimo)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Asunto (Opcional)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white sm:col-span-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NewsCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-xs outline-none focus:border-sos-blue text-gray-700 dark:text-gray-300"
                  >
                    {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={`Ubicación (${selectedState})`}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white"
                  />
                </div>

                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escribe tu mensaje... (Usa '>' para greentext)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-sos-blue focus:ring-2 focus:ring-sos-blue/15"
                />

                <HumanVerification onVerify={setIsVerified} />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                      className="h-10 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center gap-2 hover:border-sos-blue transition-all bg-gray-50 dark:bg-surface-dark text-xs text-gray-500 dark:text-gray-400 disabled:opacity-50"
                    >
                      {isCompressing ? (
                        <div className="w-4 h-4 border-2 border-sos-blue border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-gray-400" />
                      )}
                      <span>Foto</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    {photoPreview && (
                      <div className="relative">
                        <img src={photoPreview} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => setPhotoPreview('')} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isCompressing || !isVerified}
                    className="px-5 py-2.5 bg-sos-blue hover:bg-sos-blue-light text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Crear Hilo
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((post) => {
              const num = getPostNum(post.id);
              const isReplying = replyingToId === post.id;
              const hasAuthor = post.content.includes(':');
              const author = hasAuthor ? post.content.split(':')[0] : 'Anónimo';
              const bodyText = hasAuthor ? post.content.split(':').slice(1).join(':') : post.content;

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-surface-dark-card rounded-2xl border border-gray-200/60 dark:border-gray-700/30 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {author}
                    </span>
                    <span className="text-gray-400 text-[10px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(post.createdAt)}
                    </span>
                    <span className="font-mono bg-gray-100 dark:bg-surface-dark text-gray-500 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                      No. <span onClick={() => insertQuote(num)} className="font-bold text-sos-red cursor-pointer hover:underline">{num}</span>
                    </span>
                    <span
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[post.category] }}
                    >
                      {post.category}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1 font-medium ml-1">
                      <MapPin className="w-3.5 h-3.5 text-sos-red" />
                      {post.location}
                    </span>
                    
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReplyingToId(isReplying ? null : post.id);
                          setCommentAuthorName('');
                          setCommentContent('');
                        }}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors ${
                          isReplying ? 'bg-sos-blue text-white' : 'bg-gray-50 dark:bg-surface-dark hover:bg-gray-100 text-sos-blue'
                        }`}
                      >
                        [Responder]
                      </button>
                      
                      {!post.reported ? (
                        <button onClick={() => reportNewsPost(post.id)} className="text-gray-400 hover:text-sos-red transition-colors p-1" title="Reportar">
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {post.photoUrl && (
                      <div className="w-full sm:w-40 shrink-0">
                        <a href={post.photoUrl} target="_blank" rel="noreferrer" className="block border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-surface-dark">
                          <img src={post.photoUrl} alt="" className="w-full h-auto object-cover max-h-40" />
                        </a>
                      </div>
                    )}
                    <div className="flex-1 space-y-1 text-sm leading-relaxed break-words font-mono py-1">
                      {renderTextContent(bodyText)}
                    </div>
                  </div>

                  {isReplying && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden bg-gray-50 dark:bg-surface-dark p-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700/30"
                    >
                      <h4 className="text-xs font-extrabold mb-2.5 text-gray-700 dark:text-gray-300">
                        Responder al Hilo No. {num}
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={commentAuthorName}
                          onChange={(e) => setCommentAuthorName(e.target.value)}
                          placeholder="Tu nombre..."
                          className="w-full sm:w-1/3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-card text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white"
                        />
                        <input
                          ref={replyTextAreaRef}
                          type="text"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-card text-xs outline-none focus:border-sos-blue text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleSendComment(post.id)}
                          className="px-4 py-2 bg-sos-blue hover:bg-sos-blue-light text-white rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-800/80 pt-4 pl-4 sm:pl-8 space-y-3">
                      {post.comments.map((comment, commentIdx) => {
                        const commentNum = num + commentIdx + 1;
                        return (
                          <div
                            key={comment.id}
                            className="flex items-start gap-2.5 bg-gray-50/70 dark:bg-surface-dark/50 border border-gray-200/50 dark:border-gray-800/50 p-4 rounded-2xl w-full"
                          >
                            <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-1.5 text-gray-500 border-b border-gray-200/20 pb-1">
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {comment.authorName}
                                </span>
                                <span>{timeAgo(comment.createdAt)}</span>
                                <span className="font-mono text-[9px] bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-700 px-1 rounded">
                                  No. <span onClick={() => insertQuote(commentNum)} className="font-bold text-sos-red cursor-pointer hover:underline">{commentNum}</span>
                                </span>
                              </div>
                              <div className="text-sm font-mono leading-relaxed break-words">
                                {renderTextContent(comment.content)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Sin hilos activos"
            description={`No hay reportes en la categoría seleccionada para ${selectedState} en las últimas 3 horas.`}
          />
        )}
      </div>
    </div>
  );
}
