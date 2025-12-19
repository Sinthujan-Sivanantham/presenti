import React, { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useStore } from './store/useStore';
import { Slide } from './components/Slide';
import { UI } from './components/UI';
import { ConnectionLine } from './components/ConnectionLine'; // (Musst du noch als Datei anlegen, Code wie vorher)
import { CameraController } from './components/CameraRig'; // (Musst du noch als Datei anlegen, Code wie vorher)

export default function App() {
  const { slides, index, fetchSlides, loading } = useStore();

  useEffect(() => {
    fetchSlides();
  }, []);

  if (loading) return <div style={{color:'white', background:'#222', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Lade Supabase Daten...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="city" />

          {/* Linie, Kamera und Slides rendern */}
          {/* Hinweis: ConnectionLine und CameraController brauchen die slides als Prop oder holen sie sich selbst aus useStore */}
          <ConnectionLine slides={slides} />
          <CameraController /> 
          
          {slides.map((slide, i) => (
            <Slide key={slide.id} slide={{...slide, index: i}} isSelected={index === i} />
          ))}
        </Suspense>
      </Canvas>
      <UI />
    </div>
  );
}