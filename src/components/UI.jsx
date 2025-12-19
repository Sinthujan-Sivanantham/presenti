import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const UI = () => {
  const { 
    slides, index, editorMode, transformMode, user,
    setIndex, setEditorMode, setTransformMode, 
    updateSlide, deleteSlide, addSlide, uploadAsset, loading, login, logout 
  } = useStore();

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const currentSlide = slides[index];

  const handleFile = (e) => {
    if (e.target.files[0]) uploadAsset(e.target.files[0], currentSlide.id);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) setShowLogin(false);
  };

  // --- LOADING SCREEN ---
  if (loading) return null;

  return (
    <>
      <style>{`
        .glass-panel {
          background: rgba(20, 20, 30, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .btn { transition: all 0.2s ease; transform: scale(1); border:none; cursor:pointer; }
        .btn:hover { transform: scale(1.05); filter: brightness(1.2); }
        .btn:active { transform: scale(0.95); }
        
        input, select, textarea {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 8px;
          padding: 10px;
          outline: none;
          transition: border 0.2s;
        }
        input:focus { border-color: #4ecdc4; background: rgba(0, 0, 0, 0.5); }
      `}</style>

      <div style={styles.container}>
        
        {/* LOGIN MODAL */}
        {showLogin && !user && (
          <div style={styles.loginOverlay}>
            <div className="glass-panel" style={styles.loginBox}>
              <h2 style={{marginTop:0}}>Admin Login</h2>
              <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:10}}>
                <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn" style={styles.primaryBtn}>Einloggen</button>
              </form>
              <button onClick={() => setShowLogin(false)} style={{marginTop:10, background:'transparent', border:'none', color:'#888', cursor:'pointer'}}>Abbrechen</button>
            </div>
          </div>
        )}

        {/* SIDEBAR (Nur wenn eingeloggt + Editor an) */}
        {user && editorMode && currentSlide && (
          <div className="glass-panel" style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={{margin: 0, fontWeight: 600}}>Eigenschaften</h3>
              <div style={styles.badge}>Slide {index + 1}</div>
            </div>

            <div style={styles.sidebarContent}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Typ</label>
                <select value={currentSlide.type} onChange={e => updateSlide(currentSlide.id, { type: e.target.value })} style={{width:'100%'}}>
                   <option value="text">📝 Text</option>
                   <option value="image">🖼️ Bild</option>
                   <option value="model">🦆 3D Modell</option>
                </select>
              </div>

              {currentSlide.type === 'text' ? (
                 <>
                   <div style={styles.fieldGroup}>
                     <label style={styles.label}>Titel</label>
                     <input value={currentSlide.title} onChange={e => updateSlide(currentSlide.id, { title: e.target.value })} style={{width:'100%', boxSizing: 'border-box'}} />
                   </div>
                   <div style={styles.fieldGroup}>
                     <label style={styles.label}>Inhalt</label>
                     <textarea value={currentSlide.text} onChange={e => updateSlide(currentSlide.id, { text: e.target.value })} style={{width:'100%', height: 100, boxSizing: 'border-box', fontFamily: 'inherit'}} />
                   </div>
                 </>
              ) : (
                 <div style={styles.fieldGroup}>
                    <label style={styles.label}>Datei Upload</label>
                    <div style={styles.uploadBox}>
                      <input type="file" onChange={handleFile} style={{width:'100%'}} />
                    </div>
                 </div>
              )}

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Farbe</label>
                <input type="color" value={currentSlide.color} onChange={e => updateSlide(currentSlide.id, { color: e.target.value })} style={{height: 40, width: '100%', padding: 2, cursor: 'pointer'}} />
              </div>
            </div>

            <div style={styles.sidebarFooter}>
              <button className="btn" onClick={() => deleteSlide(currentSlide.id)} style={styles.deleteBtn}>🗑️ Folie Löschen</button>
            </div>
          </div>
        )}

        {/* NAVIGATION & TOOLBAR */}
        <div className="glass-panel" style={styles.toolbar}>
           <button className="btn" style={styles.iconBtn} onClick={() => setIndex(index > 0 ? index - 1 : slides.length - 1)}>◀</button>
           <span style={styles.counter}>{index + 1} / {slides.length}</span>
           <button className="btn" style={styles.iconBtn} onClick={() => setIndex(index < slides.length - 1 ? index + 1 : 0)}>▶</button>
           
           {/* Nur zeigen wenn eingeloggt */}
           {user && (
             <>
               <div style={styles.divider}></div>
               <button className="btn" onClick={() => setEditorMode(!editorMode)} style={{...styles.pillBtn, background: editorMode ? '#ff6b6b' : 'white', color: editorMode ? 'white' : 'black'}}>
                 {editorMode ? 'Fertig' : 'Bearbeiten'}
               </button>
               
               {editorMode && (
                 <div style={{display:'flex', gap: 8, marginLeft: 10}}>
                   <button className="btn" onClick={() => setTransformMode('translate')} style={styles.toolBtn(transformMode === 'translate')}>Move</button>
                   <button className="btn" onClick={() => setTransformMode('rotate')} style={styles.toolBtn(transformMode === 'rotate')}>Rot</button>
                   <button className="btn" onClick={() => setTransformMode('scale')} style={styles.toolBtn(transformMode === 'scale')}>Scale</button>
                   <div style={styles.divider}></div>
                   <button className="btn" onClick={addSlide} style={styles.addBtn}>+ Neu</button>
                 </div>
               )}
             </>
           )}
        </div>

        {/* LOGIN / LOGOUT BUTTON (Unten Rechts) */}
        <div style={{position:'absolute', bottom: 30, right: 30, pointerEvents:'auto'}}>
          {user ? (
            <button onClick={logout} className="btn" style={{background:'rgba(0,0,0,0.5)', color:'white', padding:'8px 15px', borderRadius: 20}}>
              🔓 Logout
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="btn" style={{background:'rgba(0,0,0,0.5)', color:'white', padding:'8px 15px', borderRadius: 20}}>
              🔒 Login
            </button>
          )}
        </div>

      </div>
    </>
  );
};

const styles = {
  container: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999, fontFamily: "'Inter', sans-serif" },
  sidebar: { pointerEvents: 'auto', position: 'absolute', right: 20, top: 20, bottom: 20, width: 320, borderRadius: 20, color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sidebarHeader: { padding: '20px 20px 10px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sidebarContent: { padding: 20, overflowY: 'auto', flex: 1 },
  sidebarFooter: { padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' },
  fieldGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 12, textTransform: 'uppercase', color: '#888', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 },
  badge: { background: '#4ecdc4', color: '#1a1a1a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 'bold' },
  uploadBox: { border: '1px dashed rgba(255,255,255,0.3)', borderRadius: 8, padding: 15, textAlign: 'center' },
  primaryBtn: { padding: '10px 20px', fontSize: 16, cursor:'pointer', background:'#4ecdc4', border:'none', borderRadius: 8, color: '#1a1a1a', fontWeight: 'bold' },
  deleteBtn: { width: '100%', padding: 12, background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' },
  toolbar: { pointerEvents: 'auto', position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 50 },
  iconBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counter: { color: 'white', fontWeight: 'bold', minWidth: 40, textAlign: 'center', fontSize: 14 },
  divider: { width: 1, height: 24, background: 'rgba(255,255,255,0.2)' },
  pillBtn: { padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  toolBtn: (active) => ({ background: active ? '#4ecdc4' : 'rgba(255,255,255,0.1)', color: active ? '#1a1a1a' : 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }),
  addBtn: { background: '#4ecdc4', color: '#1a1a1a', border: 'none', padding: '6px 15px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800 },
  loginOverlay: { pointerEvents: 'auto', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 },
  loginBox: { padding: 30, borderRadius: 20, width: 300, color: 'white', display:'flex', flexDirection:'column' }
};