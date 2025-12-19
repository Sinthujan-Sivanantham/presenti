import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

export const ConnectionLine = () => {
  const slides = useStore((state) => state.slides);

  const points = useMemo(() => {
    // 1. Sicherheitscheck: Genug Folien?
    if (!slides || slides.length < 2) return null;

    // 2. Sicherheitscheck: Haben alle Folien eine Position?
    // Wir filtern kaputte Folien heraus, bevor wir die Linie berechnen.
    const validSlides = slides.filter(s => Array.isArray(s.position) && s.position.length === 3);

    if (validSlides.length < 2) return null;

    try {
      const vectors = validSlides.map((s) => new THREE.Vector3(s.position[0], s.position[1], s.position[2]));
      const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5);
      return curve.getPoints(100);
    } catch (e) {
      console.warn("Fehler beim Zeichnen der Linie:", e);
      return null;
    }
  }, [slides]);

  if (!points) return null;

  return <Line points={points} color="white" opacity={0.2} transparent lineWidth={3} />;
};