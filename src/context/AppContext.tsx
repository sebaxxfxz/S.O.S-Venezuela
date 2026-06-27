import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { MissingPerson, NewsPost, AidPoint, Tip, ForumComment, Status } from '../types';
import { supabase } from '../lib/supabase';

const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

interface AppState {
  missingPersons: MissingPerson[];
  newsPosts: NewsPost[];
  aidPoints: AidPoint[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  addMissingPerson: (person: Omit<MissingPerson, 'id' | 'tips' | 'createdAt'>) => MissingPerson;
  addTip: (personId: string, tip: Omit<Tip, 'id' | 'personId' | 'createdAt'>) => void;
  addNewsPost: (post: Omit<NewsPost, 'id' | 'createdAt'>) => void;
  addComment: (postId: string, authorName: string, content: string) => void;
  addAidPoint: (point: Omit<AidPoint, 'id'>) => void;
  reportNewsPost: (postId: string) => void;
  updatePersonStatus: (id: string, status: Status) => void;
  getPersonById: (id: string) => MissingPerson | undefined;
  stats: { missing: number; found: number; deceased: number };
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sos-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [aidPoints, setAidPoints] = useState<AidPoint[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('sos-dark-mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      const loadSupabaseData = async () => {
        const { data: persons } = await supabase
          .from('missing_persons')
          .select('*, tips(*)')
          .order('created_at', { ascending: false });

        if (persons) {
          const mappedPersons: MissingPerson[] = persons.map((p: any) => ({
            id: p.id,
            fullName: p.full_name,
            age: p.age,
            photoUrl: p.photo_url || '',
            lastLocation: p.last_location,
            state: p.state,
            lostAt: p.lost_at,
            description: p.description,
            reporterName: p.reporter_name,
            reporterContact: p.reporter_contact,
            status: p.status,
            createdAt: p.created_at,
            tips: p.tips ? p.tips.map((t: any) => ({
              id: t.id,
              personId: t.missing_person_id,
              content: t.content,
              contactWhatsApp: t.contact_info || '',
              createdAt: t.created_at
            })) : []
          }));
          setMissingPersons(mappedPersons);
        }

        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        const { data: posts } = await supabase
          .from('news_posts')
          .select('*, news_comments(*)')
          .gt('created_at', threeHoursAgo)
          .order('created_at', { ascending: false });

        if (posts) {
          const mappedPosts: NewsPost[] = posts.map((post: any) => ({
            id: post.id,
            content: post.content,
            category: post.category,
            location: post.location,
            photoUrl: post.photo_url || undefined,
            reported: post.reported,
            createdAt: post.created_at,
            comments: post.news_comments ? post.news_comments.map((c: any) => ({
              id: c.id,
              postId: c.post_id,
              authorName: c.author,
              content: c.content,
              createdAt: c.created_at
            })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : []
          }));
          setNewsPosts(mappedPosts);
        }

        const { data: points } = await supabase
          .from('aid_points')
          .select('*')
          .order('created_at', { ascending: false });

        if (points) {
          const mappedPoints: AidPoint[] = points.map((pt: any) => ({
            id: pt.id,
            name: pt.name,
            type: pt.type,
            address: pt.address,
            lat: pt.lat,
            lng: pt.lng,
            phone: pt.phone || '',
            schedule: pt.schedule || 'Por definir',
            capacity: pt.capacity || undefined
          }));
          setAidPoints(mappedPoints);
        }
      };
      loadSupabaseData();
    } else {
      const savedPersons = localStorage.getItem('sos-missing-persons');
      if (savedPersons) setMissingPersons(JSON.parse(savedPersons));

      const savedPosts = localStorage.getItem('sos-news-posts');
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const posts = savedPosts ? JSON.parse(savedPosts) : [];
      setNewsPosts(posts.filter((p: any) => new Date(p.createdAt) > threeHoursAgo));

      const savedPoints = localStorage.getItem('sos-aid-points');
      if (savedPoints) setAidPoints(JSON.parse(savedPoints));
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('sos-missing-persons', JSON.stringify(missingPersons));
    }
  }, [missingPersons]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('sos-news-posts', JSON.stringify(newsPosts));
    }
  }, [newsPosts]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('sos-aid-points', JSON.stringify(aidPoints));
    }
  }, [aidPoints]);

  useEffect(() => {
    const interval = setInterval(() => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      setNewsPosts((prev) => prev.filter((p) => new Date(p.createdAt) > threeHoursAgo));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const generateId = (prefix: string) =>
    `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const addMissingPerson = (person: Omit<MissingPerson, 'id' | 'tips' | 'createdAt'>): MissingPerson => {
    const newId = generateId('MP');
    const newPerson: MissingPerson = {
      ...person,
      id: newId,
      tips: [],
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      supabase.from('missing_persons').insert([{
        full_name: person.fullName,
        age: person.age,
        photo_url: person.photoUrl,
        last_location: person.lastLocation,
        state: person.state,
        lost_at: person.lostAt,
        description: person.description,
        reporter_name: person.reporterName,
        reporter_contact: person.reporterContact,
        status: person.status
      }]).then(() => {
        setMissingPersons((prev) => [newPerson, ...prev]);
      });
    } else {
      setMissingPersons((prev) => [newPerson, ...prev]);
    }

    return newPerson;
  };

  const addTip = (personId: string, tip: Omit<Tip, 'id' | 'personId' | 'createdAt'>) => {
    const newTipId = generateId('TIP');
    const newTip: Tip = {
      ...tip,
      id: newTipId,
      personId,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      supabase.from('tips').insert([{
        missing_person_id: personId,
        content: tip.content,
        contact_info: tip.contactWhatsApp
      }]).then(() => {
        setMissingPersons((prev) =>
          prev.map((p) => (p.id === personId ? { ...p, tips: [...p.tips, newTip] } : p))
        );
      });
    } else {
      setMissingPersons((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, tips: [...p.tips, newTip] } : p))
      );
    }
  };

  const addNewsPost = (post: Omit<NewsPost, 'id' | 'createdAt'>) => {
    const newId = generateId('NP');
    const newPost: NewsPost = {
      ...post,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      supabase.from('news_posts').insert([{
        content: post.content,
        category: post.category,
        location: post.location,
        photo_url: post.photoUrl,
        reported: false
      }]).then(() => {
        setNewsPosts((prev) => [newPost, ...prev]);
      });
    } else {
      setNewsPosts((prev) => [newPost, ...prev]);
    }
  };

  const addComment = (postId: string, authorName: string, content: string) => {
    const newComment: ForumComment = {
      id: generateId('NC'),
      postId,
      authorName,
      content,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      supabase.from('news_comments').insert([{
        post_id: postId,
        author: authorName,
        content: content
      }]).then(() => {
        setNewsPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
        );
      });
    } else {
      setNewsPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
      );
    }
  };

  const addAidPoint = (point: Omit<AidPoint, 'id'>) => {
    const newPoint: AidPoint = {
      ...point,
      id: generateId('AP'),
    };

    if (isSupabaseConfigured) {
      supabase.from('aid_points').insert([{
        name: point.name,
        type: point.type,
        address: point.address,
        lat: point.lat,
        lng: point.lng,
        phone: point.phone,
        schedule: point.schedule,
        capacity: point.capacity
      }]).then(() => {
        setAidPoints((prev) => [...prev, newPoint]);
      });
    } else {
      setAidPoints((prev) => [...prev, newPoint]);
    }
  };

  const reportNewsPost = (postId: string) => {
    if (isSupabaseConfigured) {
      supabase.from('news_posts').update({ reported: true }).eq('id', postId).then(() => {
        setNewsPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))
        );
      });
    } else {
      setNewsPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))
      );
    }
  };

  const updatePersonStatus = (id: string, status: Status) => {
    if (isSupabaseConfigured) {
      supabase.from('missing_persons').update({ status }).eq('id', id).then(() => {
        setMissingPersons((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
      });
    } else {
      setMissingPersons((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    }
  };

  const getPersonById = (id: string) => missingPersons.find((p) => p.id === id);

  const stats = {
    missing: missingPersons.filter((p) => p.status === 'Desaparecido').length,
    found: missingPersons.filter((p) => p.status === 'Encontrado').length,
    deceased: missingPersons.filter((p) => p.status === 'Fallecido').length,
  };

  return (
    <AppContext.Provider
      value={{
        missingPersons,
        newsPosts,
        aidPoints,
        darkMode,
        toggleDarkMode,
        addMissingPerson,
        addTip,
        addNewsPost,
        addComment,
        addAidPoint,
        reportNewsPost,
        updatePersonStatus,
        getPersonById,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
