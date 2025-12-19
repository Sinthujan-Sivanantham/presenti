import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

export const CameraController = () => {
  const { camera } = useThree();
  const slides = useStore((state) => state.slides);
  const index = useStore((state) => state.index);

  useEffect(() => {
    const target = slides[index];
    if (!target) return;

    const targetPos = new THREE.Vector3(...target.position);
    const targetRot = new THREE.Euler(...target.rotation);

    // ÄNDERUNG: Abstand auf 30 erhöht (damit die große Folie reinpasst)
    const dist = 4* (target.scale || 1);
    
    const offset = new THREE.Vector3(0, 0, dist);
    offset.applyEuler(targetRot);

    gsap.to(camera.position, {
      x: targetPos.x + offset.x,
      y: targetPos.y + offset.y,
      z: targetPos.z + offset.z,
      duration: 1.5,
      ease: "power2.inOut"
    });

    gsap.to(camera.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.5,
      ease: "power2.inOut"
    });
  }, [index, slides, camera]);

  return null;
};