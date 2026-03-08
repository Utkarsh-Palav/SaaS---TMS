import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Environment } from '@react-three/drei';

const AnimatedSphere = () => {
  const sphereRef = useRef();

  // Slowly rotate the sphere over time
  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial 
          color="#4f46e5" 
          attach="material" 
          distort={0.4} 
          speed={1.5} 
          roughness={0.2} 
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 -z-10 h-[120vh] w-full opacity-40 mix-blend-screen pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={5} color="#8b5cf6" />
        <AnimatedSphere />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default Hero3D;