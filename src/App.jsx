import React, { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { useStore } from './store/useStore';
import { Slide } from './components/Slide';
import { UI } from './components/UI';
// import { ConnectionLine } from './components/ConnectionLine'; // Brauchen wir nicht mehr
import { CameraController } from './components/CameraRig';

export default function App() {
  const { slides, index, fetchSlides, loading } = useStore();

  useEffect(() => {
    fetchSlides();
  }, []);

  if (loading) return (
    <div style={{
      color:'white', 
      background:'#000', 
      height:'100vh', 
      display:'flex', 
      alignItems:'center', 
      justifyContent:'center'
    }}>
      Lade das Universum... 🚀
    </div>
  );

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)',
      fontFamily: 'sans-serif' 
    }}>
      
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Suspense fallback={null}>
          
          {/* 1. BELEUCHTUNG & STERNE */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffddaa" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#aabbff" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />

          {/* 2. LOGIK */}
          <CameraController /> 
          {/* HIER WAR VORHER DIE <ConnectionLine /> - JETZT IST SIE WEG */}
          
          {/* 3. DIE FOLIEN */}
          {slides.map((slide, i) => (
            <Slide 
              key={slide.id} 
              slide={{...slide, index: i}} 
              isSelected={index === i} 
            />
          ))}

        </Suspense>
      </Canvas>
      
      <UI />
    </div>
  );
}