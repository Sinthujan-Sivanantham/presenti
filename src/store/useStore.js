import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useStore = create((set, get) => ({
  slides: [],
  index: 0,
  editorMode: false,
  transformMode: 'translate',
  loading: true,
  user: null, // Hier speichern wir, ob du eingeloggt bist

  setIndex: (i) => set({ index: i }),
  setEditorMode: (mode) => set({ editorMode: mode }),
  setTransformMode: (mode) => set({ transformMode: mode }),

  // --- AUTHENTICATION ---
  
  // Prüfen, ob schon eingeloggt (beim Start)
  checkSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null });
  },

  // Einloggen
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login fehlgeschlagen: " + error.message);
      return false;
    }
    set({ user: data.user, editorMode: true }); // Automatisch Editor an
    return true;
  },

  // Ausloggen
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, editorMode: false });
  },

  // --- DATA LOGIC ---

  fetchSlides: async () => {
    set({ loading: true });
    // Session checken beim Laden
    get().checkSession();

    const { data, error } = await supabase.from('slides').select('*').order('id');
    
    if (error) {
      console.error("Supabase Error:", error);
      set({ loading: false });
      return;
    }

    if (data) {
      const safeData = data.map(s => ({
        ...s,
        position: Array.isArray(s.position) ? s.position : [0, 0, 0],
        rotation: Array.isArray(s.rotation) ? s.rotation : [0, 0, 0],
        scale: (typeof s.scale === 'number') ? s.scale : 1,
        color: s.color || '#ffffff'
      }));
      set({ slides: safeData, loading: false });
    }
  },

  updateSlide: async (id, updates) => {
    // Nur erlauben wenn eingeloggt
    if (!get().user) return alert("Nur für Admins!");

    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    await supabase.from('slides').update(updates).eq('id', id);
  },

  addSlide: async () => {
    if (!get().user) return alert("Nur für Admins!");

    const { slides, index } = get();
    const prev = slides[index] || { position: [0,0,0] };
    const newSlide = {
      type: 'text', title: 'Neu', text: '...', 
      position: [prev.position[0] + 15, prev.position[1], prev.position[2]], 
      rotation: [0, 0, 0], scale: 1, color: '#4ecdc4'
    };
    const { data } = await supabase.from('slides').insert(newSlide).select();
    if (data) {
      set((state) => ({ 
        slides: [...state.slides, data[0]],
        index: state.slides.length 
      }));
    }
  },

  deleteSlide: async (id) => {
    if (!get().user) return alert("Nur für Admins!");
    
    const { slides } = get();
    if (slides.length <= 1) return alert("Eine Folie muss bleiben!");
    set((state) => ({ slides: state.slides.filter((s) => s.id !== id), index: 0 }));
    await supabase.from('slides').delete().eq('id', id);
  },

  uploadAsset: async (file, slideId) => {
    if (!get().user) return alert("Nur für Admins!");

    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage.from('assets').upload(fileName, file);
    if (error) return alert("Upload Fehler: " + error.message);
    const { data } = supabase.storage.from('assets').getPublicUrl(fileName);
    if (data) get().updateSlide(slideId, { url: data.publicUrl });
  }
}));