// components/ThreeAnimation.jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingChatBubble() {
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Glassy Sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1} // Glass effect
          roughness={0}
          thickness={0.5}
          ior={1.5}
          reflectivity={1}
          clearcoat={1}
          metalness={0.1}
        />
      </mesh>

      {/* Chat Icon inside the sphere */}
      <Html center>
        <div
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#4F46E5",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 20px rgba(79, 70, 229, 0.5)",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          💬
        </div>
      </Html>
    </group>
  );
}

export default function ThreeAnimation() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      <FloatingChatBubble />
    </Canvas>
  );
}
