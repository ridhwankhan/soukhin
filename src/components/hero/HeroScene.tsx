import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, useEnvironment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function FabricPanel({ position, rotation, color, delay }: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, height] = useMemo(() => [
    0.8 + Math.random() * 0.4,
    1.2 + Math.random() * 0.8
  ], []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.05;
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.2 + delay) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + delay) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
        <planeGeometry args={[width, height, 32, 32]} />
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
          roughness={0.7}
          metalness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function GiftBox({ position, color, ribbonColor, scale = 1 }: {
  position: [number, number, number];
  color: string;
  ribbonColor: string;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={position} scale={scale}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.21, 0]} castShadow>
          <boxGeometry args={[0.65, 0.05, 0.65]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.23, 0]} castShadow>
          <torusGeometry args={[0.15, 0.02, 8, 16]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.62, 0.02, 0.08]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0, -Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.62, 0.02, 0.08]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.2} metalness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function PithaTray({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.2}>
      <group ref={groupRef} position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.45, 0.08, 32]} />
          <meshStandardMaterial color="#8B7355" roughness={0.6} metalness={0.1} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 5) * Math.PI * 2) * 0.28,
              0.08,
              Math.sin((i / 5) * Math.PI * 2) * 0.28,
            ]}
            rotation={[0, (i / 5) * Math.PI * 2, 0]}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#E8DCC8" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function WarmLight({ position, intensity, color }: {
  position: [number, number, number];
  intensity: number;
  color: string;
}) {
  return (
    <pointLight
      position={position}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize={[512, 512]}
    />
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const scale = Math.min(viewport.width / 8, 1);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#FFF5E6" />
      <WarmLight position={[3, 3, 3]} intensity={1.5} color="#FFE4B5" />
      <WarmLight position={[-3, 2, -2]} intensity={1} color="#FFDAB9" />
      <WarmLight position={[0, 4, 0]} intensity={0.8} color="#FFF8DC" />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        color="#FFF"
        castShadow
      />

      <group ref={groupRef} scale={scale}>
        <FabricPanel position={[-2.5, 1, -1]} rotation={[0, 0.3, 0.1]} color="#F5F0E8" delay={0} />
        <FabricPanel position={[2.5, 0.5, -1.5]} rotation={[0, -0.3, -0.05]} color="#1B4332" delay={1} />
        <FabricPanel position={[0, 1.2, -2]} rotation={[0, 0.1, 0]} color="#B8860B" delay={2} />
        <FabricPanel position={[-1.5, -0.5, -0.5]} rotation={[0, 0.5, 0.1]} color="#C2704A" delay={3} />
        <FabricPanel position={[1.5, 0.8, -1]} rotation={[0, -0.4, -0.05]} color="#2D5A4A" delay={4} />

        <GiftBox position={[-1.5, -0.8, 0]} color="#1B4332" ribbonColor="#B8860B" scale={0.9} />
        <GiftBox position={[1.8, -1, 0.5]} color="#C2704A" ribbonColor="#F5F0E8" scale={0.8} />
        <GiftBox position={[-0.3, -1.2, 1]} color="#B8860B" ribbonColor="#1B4332" scale={0.7} />
        <GiftBox position={[0.8, -1.5, 1.2]} color="#2D5A4A" ribbonColor="#C2704A" scale={0.6} />

        <PithaTray position={[0, -0.5, 2]} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.1} />
      </mesh>
    </>
  );
}

function MobileFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] via-[#2D5A4A] to-[#C2704A]">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-48 bg-[#F5F0E8] rounded-sm transform rotate-12 blur-lg" />
        <div className="absolute top-1/3 right-1/4 w-40 h-56 bg-[#B8860B] rounded-sm transform -rotate-6 blur-lg" />
        <div className="absolute bottom-1/4 left-1/3 w-36 h-52 bg-[#C2704A] rounded-sm transform rotate-3 blur-lg" />
      </div>
    </div>
  );
}

interface HeroSceneProps {
  onLoad?: () => void;
}

export default function HeroScene({ onLoad }: HeroSceneProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  if (prefersReducedMotion) {
    return <MobileFallback />;
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={onLoad}
        camera={{ position: [0, 0, 6], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
