import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/a11y';

interface ShieldProps {
  color: string;
  score: number;
}

function Shield({ color, score }: ShieldProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (meshRef.current && !reduced) {
      gsap.to(meshRef.current.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: 'power2.out',
      });
    }
  }, [reduced]);

  useFrame((state) => {
    if (meshRef.current && !reduced) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={reduced ? 0 : 0.3}
        speed={reduced ? 0 : 1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}


interface ResultGauge3DProps {
  score: number;
  tierColor: string;
  className?: string;
}

export function ResultGauge3D({ score, tierColor, className = '' }: ResultGauge3DProps) {
  const [displayScore, setDisplayScore] = React.useState(0);
  
  useEffect(() => {
    const reduced = prefersReducedMotion();
    gsap.to({ value: 0 }, {
      value: score,
      duration: reduced ? 0.01 : 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        setDisplayScore(Math.round(this.targets()[0].value));
      },
    });
  }, [score]);

  return (
    <div className={className} style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, -10, -10]} angle={0.3} penumbra={1} intensity={0.5} />
          <Shield color={tierColor} score={score} />
          {!prefersReducedMotion() && <OrbitControls enableZoom={false} enablePan={false} />}
        </Suspense>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#e7edf5',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
      >
        {displayScore}
        <div style={{ fontSize: '16px', fontWeight: 'normal', opacity: 0.7, marginTop: '4px' }}>
          / 24
        </div>
      </div>
    </div>
  );
}

// For browsers that don't support WebGL or when we want a simpler fallback
export function ResultGaugeFallback({ score, tierColor, className = '' }: ResultGauge3DProps) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const reduced = prefersReducedMotion();
    gsap.to({ value: 0 }, {
      value: score,
      duration: reduced ? 0.01 : 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        setDisplayScore(Math.round(this.targets()[0].value));
      },
    });
  }, [score]);

  return (
    <div
      className={className}
      style={{
        width: '250px',
        height: '250px',
        margin: '0 auto',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tierColor}20 0%, transparent 70%)`,
        border: `4px solid ${tierColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 30px ${tierColor}40`,
      }}
    >
      <div style={{ fontSize: '64px', fontWeight: 'bold', color: tierColor }}>
        {displayScore}
      </div>
      <div style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px' }}>
        out of 24
      </div>
    </div>
  );
}

