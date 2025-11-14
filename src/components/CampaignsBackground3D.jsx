import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CampaignsBackground3D = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Galaxy stars
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 20 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);

      // Cyan color variations
      starColors[i] = Math.random() * 0.3;
      starColors[i + 1] = 0.8 + Math.random() * 0.2;
      starColors[i + 2] = 1;

      starSizes[i / 3] = Math.random() * 2 + 0.5;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float pulsate = 1.0 + sin(time * 0.5 + position.x * 0.05) * 0.3;
          gl_PointSize = size * pulsate * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - (dist * 2.0);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Floating folder/document icons
    const folderIcons = [];
    const createFolderIcon = (position, scale) => {
      const group = new THREE.Group();

      // Folder base
      const folderGeo = new THREE.BoxGeometry(4 * scale, 3 * scale, 0.5 * scale);
      const edges = new THREE.EdgesGeometry(folderGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.6
      });
      const folder = new THREE.LineSegments(edges, lineMat);
      group.add(folder);

      // Folder tab
      const tabGeo = new THREE.BoxGeometry(2 * scale, 0.8 * scale, 0.5 * scale);
      const tabEdges = new THREE.EdgesGeometry(tabGeo);
      const tab = new THREE.LineSegments(tabEdges, lineMat);
      tab.position.y = 1.9 * scale;
      tab.position.x = -1 * scale;
      group.add(tab);

      group.position.set(...position);
      group.userData.scale = scale;
      scene.add(group);

      return group;
    };

    folderIcons.push(
      createFolderIcon([25, 15, -30], 1),
      createFolderIcon([-20, -10, -25], 1.2),
      createFolderIcon([15, -18, -35], 0.9),
      createFolderIcon([-25, 8, -20], 1.1),
      createFolderIcon([30, -5, -40], 0.8)
    );

    // Connecting lines between folders
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.15
    });

    const connectFolders = (folder1, folder2) => {
      const points = [];
      points.push(folder1.position);
      points.push(folder2.position);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, linesMaterial);
      scene.add(line);
      return line;
    };

    const connections = [];
    for (let i = 0; i < folderIcons.length - 1; i++) {
      if (Math.random() > 0.5) {
        connections.push(connectFolders(folderIcons[i], folderIcons[i + 1]));
      }
    }

    // Data particles
    const particleCount = 600;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 100;
      particlePositions[i + 1] = (Math.random() - 0.5) * 100;
      particlePositions[i + 2] = (Math.random() - 0.5) * 50 - 10;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.03,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.03
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00D9FF,
      size: 0.3,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x00D9FF, 0x0EA5E9);
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -30;
    scene.add(gridHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x00D9FF, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00D9FF, 1.5, 100);
    pointLight1.position.set(25, 15, -30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0EA5E9, 1, 100);
    pointLight2.position.set(-20, -10, -25);
    scene.add(pointLight2);

    // Mouse movement
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Update stars
      starMaterial.uniforms.time.value = time;
      stars.rotation.y += 0.0002;

      // Animate folders
      folderIcons.forEach((icon, index) => {
        icon.rotation.y += 0.002;
        icon.rotation.x = Math.sin(time * 0.5 + index) * 0.2;
        icon.position.y += Math.sin(time * 0.8 + index) * 0.01;
        
        const scale = icon.userData.scale * (1 + Math.sin(time * 1.5 + index) * 0.1);
        icon.scale.set(scale, scale, scale);
      });

      // Animate particles
      const particlePos = particleGeometry.attributes.position.array;
      for (let i = 0; i < particlePos.length; i += 3) {
        const idx = i / 3;
        particlePos[i] += particleVelocities[idx].x;
        particlePos[i + 1] += particleVelocities[idx].y;
        particlePos[i + 2] += particleVelocities[idx].z;

        if (Math.abs(particlePos[i]) > 50) particleVelocities[idx].x *= -1;
        if (Math.abs(particlePos[i + 1]) > 50) particleVelocities[idx].y *= -1;
        if (Math.abs(particlePos[i + 2]) > 25) particleVelocities[idx].z *= -1;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Camera parallax
      const targetX = mouseRef.current.x * 6;
      const targetY = mouseRef.current.y * 6;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default CampaignsBackground3D;
