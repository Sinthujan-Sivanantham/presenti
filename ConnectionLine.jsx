import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, Environment, Line, RoundedBox, Image, useGLTF, TransformControls } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

// --- 1. DATENSTRUKTUR (State Init) ---
// Wir fügen 'type' und 'url' hinzu
const INITIAL_SLIDES = [
  { 
    id: 1, type: 'text', 
    title: "Der Editor", text: "Drücke 'Editor Modus' unten, um mich zu verschieben!", 
    position: [0, 0, 0], rotation: [0, 0, 0], color: "#ff6b6b" 
  },
  { 
    id: 2, type: 'image', 
    title: "Bilder Support", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", 
    position: [8, 0, -5], rotation: [0, -0.5, 0], color: "#4ecdc4" 
  },
  { 
    id: 3, type: 'model', 
    title: "3D Objekte", url: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/duck/model.gltf", 
    position: [0, 6, 0], rotation: [0.5, 0, 0], scale: 2, color: "#ffe66d" 
  }
];

// --- 2. CONTENT KOMPONENTEN ---

// Lädt ein 3D Modell (glb/gltf)
const ModelContent = ({ url, scale = 1 }) => {
  const { scene } = useGLTF(url);
  // Klonen, damit wir das Modell mehrfach nutzen könnten
  const clone = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} scale={scale} position={[0, -1, 0.5]} />;
};

// Zeigt ein Bild an
const ImageContent = ({ url }) => {
  return (
    <Image 
      url={url} 
      position={[0, 0, 0.1]} 
      scale={[3.5, 2]} 
      transparent 
      opacity={1} 
    />
  );
};

// Zeigt Text an (wie vorher)
const TextContent = ({ title, text }) => {
  return (
    <Html transform occlude position={[0, 0, 0.06]} style={{
        width: '380px', height: '230px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', 
        pointerEvents: 'none', userSelect: 'none', fontFamily: 'sans-serif'
      }}>
      <h1 style={{ margin: 0, fontSize: '2.5em', color: '#222' }}>{title}</h1>
      <p style={{ fontSize: '1.2em', color: '#444' }}>{text}</p>
    </Html>
  );
};

// --- 3. DIE SMARTE SLIDE KOMPONENTE ---
const EditableSlide = ({ slide, index, isSelected, isEditorMode, updateSlide, setIndex }) => {
  const groupRef = useRef();

  // Render Inhalt basierend auf Typ
  const renderContent = () => {
    switch (slide.type) {
      case 'image': return <ImageContent url={slide.url} />;
      case 'model': return <ModelContent url={slide.url} scale={slide.scale || 1} />;
      default: return <TextContent title={slide.title} text={slide.text} />;
    }
  };

  // Die eigentliche Slide-Geometrie
  const SlideMesh = (
    <group 
      ref={groupRef}
      // WICHTIG: Wenn wir NICHT im Editor sind, nutzen wir Props. 
      // Im Editor übernimmt TransformControls die visuelle Kontrolle.
      position={slide.position} 
      rotation={slide.rotation}
      onClick={(e) => { 
        e.stopPropagation(); 
        setIndex(index); 
      }}
    >
      {/* Hintergrund Box */}
      <RoundedBox args={[4, 2.5, 0.1]} radius={0.15} smoothness={4}>
        <meshStandardMaterial color={slide.color} />
      </RoundedBox>

      {renderContent()}
    </group>
  );

  // LOGIK: Wenn Editor Modus AN ist UND dieser Slide ausgewählt ist -> TransformControls zeigen
  if (isEditorMode && isSelected) {
    return (
      <TransformControls 
        object={groupRef} 
        mode="translate" // Man könnte hier auch "rotate" per Button toggeln
        onMouseUp={() => {
          // SPEICHERN: Wenn wir loslassen, schreiben wir die neue Position in den State
          if (groupRef.current) {
            updateSlide(slide.id, {
              position: [groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z],
              rotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z],
            });
          }
        }}
      >
        {SlideMesh}
      </TransformControls>
    );
  }

  return SlideMesh;
};

// --- 4. VISUALISIERUNG & KAMERA ---

const ConnectionLine = ({ slides }) => {
  const points = useMemo(() => {
    // Falls ein Slide keine Position hat (Fehler), abfangen
    if(!slides || slides.length === 0) return [];
    const vectors = slides.map(s => new THREE.Vector3(...s.position));
    const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5);
    return curve.getPoints(100);
  }, [slides]); // Updated sich automatisch wenn slides sich bewegen!

  return <Line points={points} color="white" opacity={0.2} transparent lineWidth={3} />;
};

const CameraController = ({ slides, currentSlideIndex, isEditorMode }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Im Editor Modus wollen wir vielleicht nicht, dass die Kamera wild herumfliegt,
    // aber für jetzt lassen wir es zu, damit man zum Slide kommt.
    const target = slides[currentSlideIndex];
    if (!target) return;

    const targetPosition = new THREE.Vector3(...target.position);
    const targetRotation = new THREE.Euler(...target.rotation);

    const offset = new THREE.Vector3(0, 0, 6);
    offset.applyEuler(targetRotation);
    const newCamPos = targetPosition.clone().add(offset);

    gsap.to(camera.position, {
      x: newCamPos.x, y: newCamPos.y, z: newCamPos.z,
      duration: 1.5, ease: "power2.inOut"
    });

    gsap.to(camera.rotation, {
      x: targetRotation.x, y: targetRotation.y, z: targetRotation.z,
      duration: 1.5, ease: "power2.inOut"
    });
  }, [currentSlideIndex, slides, isEditorMode]); // Reagiert auf Slide-Änderungen

  return null;
};

