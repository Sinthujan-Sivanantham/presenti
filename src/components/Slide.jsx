import React, { useMemo, useRef } from 'react';
import { Html, RoundedBox, Image, useGLTF, TransformControls } from '@react-three/drei';
import { useStore } from '../store/useStore';

// --- 1. ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e) { console.error("3D Fehler:", e); }
  render() {
    if (this.state.hasError) return this.props.fallback || (
        <group>
            <mesh position={[0,0,0.5]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
            <Html position={[0,1.2,0]}><div style={{background:'red', color:'white', padding:5}}>Fehler</div></Html>
        </group>
    );
    return this.props.children;
  }
}

// --- 2. MODEL LOADER ---
const Model = ({ url }) => {
  if (!url) return null;
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} position={[0, -1, 0.5]} />;
};

// --- 3. INHALT ---
const Content = ({ slide }) => {
  if (slide.type === 'image' && slide.url) {
    return <Image url={slide.url} position={[0, 0, 0.1]} scale={[3.5, 2]} transparent />;
  }
  if (slide.type === 'model') {
    return (
      <ErrorBoundary key={slide.url}>
         <Model url={slide.url} />
      </ErrorBoundary>
    );
  }
  return (
    <Html transform occlude zIndexRange={[100, 0]} position={[0, 0, 0.06]} style={{ width: '380px', height: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none', userSelect: 'none', fontFamily: 'sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: '2.5em', color: '#222' }}>{slide.title}</h1>
      <p style={{ fontSize: '1.2em', color: '#444' }}>{slide.text}</p>
    </Html>
  );
};

// --- 4. HAUPTKOMPONENTE (WICHTIG: export const!) ---
export const Slide = ({ slide, isSelected }) => {
  const { editorMode, transformMode, updateSlide, setIndex } = useStore();
  const groupRef = useRef();

  const position = Array.isArray(slide.position) ? slide.position : [0,0,0];
  const rotation = Array.isArray(slide.rotation) ? slide.rotation : [0,0,0];

  const Mesh = (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation} 
      scale={slide.scale || 1}
      onClick={(e) => { 
        e.stopPropagation(); 
        setIndex(slide.index); 
      }}
    >
      <RoundedBox args={[4, 2.5, 0.1]} radius={0.15} smoothness={4}>
        <meshStandardMaterial color={slide.color || '#ffffff'} />
      </RoundedBox>
      <Content slide={slide} />
    </group>
  );

  if (editorMode && isSelected) {
    return (
      <TransformControls 
        object={groupRef} 
        mode={transformMode}
        onMouseUp={() => {
          if (groupRef.current) {
            updateSlide(slide.id, {
              position: [groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z],
              rotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z],
              scale: groupRef.current.scale.x 
            });
          }
        }}
      >
        {Mesh}
      </TransformControls>
    );
  }

  return Mesh;
};