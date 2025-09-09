import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Set background to light mode
    scene.background = new THREE.Color(0xffffff);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: false, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);

    // Create subtle floating particles
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;
      
      // Light mode colors - subtle colors
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 0.5, 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 8 + 2;
      
      velocities.push(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01
      );
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 6,
      vertexColors: true,
      transparent: true,
      opacity: 0.2, // Light mode opacity
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Create gear-like shapes
    const gears: THREE.Mesh[] = [];
    
    // Main large gear
    const gearGeometry = new THREE.TorusGeometry(4, 0.8, 8, 50);
    const gearMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f46e5, // Light mode color
      wireframe: true,
      transparent: true,
      opacity: 0.15 // Light mode opacity
    });
    const mainGear = new THREE.Mesh(gearGeometry, gearMaterial);
    mainGear.position.set(15, -10, -20);
    scene.add(mainGear);
    gears.push(mainGear);

    // Secondary gears
    for (let i = 0; i < 3; i++) {
      const size = 2 + Math.random() * 2;
      const gearGeometry = new THREE.TorusGeometry(size, 0.4, 6, 30);
      const gearMaterial = new THREE.MeshBasicMaterial({
        color: [0x8b5cf6, 0x06b6d4, 0x10b981][i], // Light mode colors
        wireframe: true,
        transparent: true,
        opacity: 0.1 // Light mode opacity
      });
      
      const gear = new THREE.Mesh(gearGeometry, gearMaterial);
      gear.position.set(
        -15 + i * 10,
        8 - i * 5,
        -25 - i * 5
      );
      scene.add(gear);
      gears.push(gear);
    }

    // Create connecting lines for network effect
    const lines: THREE.Line[] = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1, // Light mode color
      transparent: true,
      opacity: 0.05 // Light mode opacity
    });

    for (let i = 0; i < 15; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(6);

      linePositions[0] = (Math.random() - 0.5) * 40;
      linePositions[1] = (Math.random() - 0.5) * 40;
      linePositions[2] = -20 - Math.random() * 20;
      
      linePositions[3] = (Math.random() - 0.5) * 40;
      linePositions[4] = (Math.random() - 0.5) * 40;
      linePositions[5] = -20 - Math.random() * 20;

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      lines.push(line);
    }

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Animate particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const sizes = particles.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Gentle wave motion
        positions[i3] += velocities[i3] + Math.sin(time + i * 0.1) * 0.01;
        positions[i3 + 1] += velocities[i3 + 1] + Math.cos(time + i * 0.1) * 0.01;
        positions[i3 + 2] += velocities[i3 + 2];
        
        // Subtle size pulsing
        sizes[i] = (Math.sin(time * 2 + i) + 1) * 4 + 2;
        
        // Wrap around
        if (positions[i3] > 30) positions[i3] = -30;
        if (positions[i3] < -30) positions[i3] = 30;
        if (positions[i3 + 1] > 30) positions[i3 + 1] = -30;
        if (positions[i3 + 1] < -30) positions[i3 + 1] = 30;
        if (positions[i3 + 2] > 15) positions[i3 + 2] = -15;
        if (positions[i3 + 2] < -15) positions[i3 + 2] = 15;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;

      // Rotate gears at different speeds
      gears.forEach((gear, index) => {
        gear.rotation.x += 0.005 + index * 0.002;
        gear.rotation.y += 0.005 - index * 0.001;
        gear.rotation.z += 0.003;
        
        // Gentle floating motion
        gear.position.y += Math.sin(time + index * 2) * 0.02;
        gear.position.x += Math.cos(time * 0.7 + index) * 0.015;
      });

      // Subtle camera movement
      camera.position.x = Math.sin(time * 0.3) * 1;
      camera.position.y = Math.cos(time * 0.3) * 1;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={`fixed inset-0 ${className}`} style={{ zIndex: 0 }} />;
};

export default ThreeBackground; 