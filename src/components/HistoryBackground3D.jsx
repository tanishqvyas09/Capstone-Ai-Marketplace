import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HistoryBackground3D = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const clockRef = useRef(null);
  const historyIconsRef = useRef([]);

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
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Create spiral galaxy pattern
      const radius = Math.random() * 60 + 10;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 40;

      starPositions[i] = Math.cos(angle) * radius;
      starPositions[i + 1] = height;
      starPositions[i + 2] = Math.sin(angle) * radius;

      // Color variation (cyan to blue)
      const colorVariation = Math.random();
      starColors[i] = colorVariation; // R
      starColors[i + 1] = 0.85 + Math.random() * 0.15; // G
      starColors[i + 2] = 1; // B

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
          float pulsate = 1.0 + sin(time + position.x * 0.1) * 0.3;
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
      depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create 3D Clock
    const createClock = () => {
      const clockGroup = new THREE.Group();

      // Clock face (ring)
      const ringGeometry = new THREE.TorusGeometry(8, 0.5, 16, 50);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.6,
        emissive: 0x00D9FF,
        emissiveIntensity: 0.3
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      clockGroup.add(ring);

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const markerGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.3);
        const markerMaterial = new THREE.MeshPhongMaterial({
          color: 0x00D9FF,
          transparent: true,
          opacity: 0.8,
          emissive: 0x00D9FF,
          emissiveIntensity: 0.4
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.x = Math.sin(angle) * 7;
        marker.position.y = Math.cos(angle) * 7;
        clockGroup.add(marker);
      }

      // Clock hands
      const hourHandGeometry = new THREE.BoxGeometry(0.4, 4, 0.4);
      const minuteHandGeometry = new THREE.BoxGeometry(0.3, 6, 0.3);
      const secondHandGeometry = new THREE.BoxGeometry(0.2, 7, 0.2);

      const handMaterial = new THREE.MeshPhongMaterial({
        color: 0x00D9FF,
        emissive: 0x00D9FF,
        emissiveIntensity: 0.5
      });

      const hourHand = new THREE.Mesh(hourHandGeometry, handMaterial);
      const minuteHand = new THREE.Mesh(minuteHandGeometry, handMaterial.clone());
      const secondHand = new THREE.Mesh(secondHandGeometry, handMaterial.clone());

      hourHand.position.y = 2;
      minuteHand.position.y = 3;
      secondHand.position.y = 3.5;

      secondHand.material.color.setHex(0xFF6B6B);
      secondHand.material.emissive.setHex(0xFF6B6B);

      clockGroup.add(hourHand);
      clockGroup.add(minuteHand);
      clockGroup.add(secondHand);

      // Center dot
      const centerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const centerMaterial = new THREE.MeshPhongMaterial({
        color: 0x00D9FF,
        emissive: 0x00D9FF,
        emissiveIntensity: 0.8
      });
      const center = new THREE.Mesh(centerGeometry, centerMaterial);
      clockGroup.add(center);

      clockGroup.position.set(-30, 15, -20);
      scene.add(clockGroup);

      return { group: clockGroup, hourHand, minuteHand, secondHand };
    };

    clockRef.current = createClock();

    // Create floating history/document icons
    const createHistoryIcon = (position, rotationSpeed) => {
      const iconGroup = new THREE.Group();

      // Document shape
      const docGeometry = new THREE.BoxGeometry(4, 5, 0.5);
      const edges = new THREE.EdgesGeometry(docGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.6
      });
      const docWireframe = new THREE.LineSegments(edges, lineMaterial);
      iconGroup.add(docWireframe);

      // Lines representing text
      for (let i = 0; i < 4; i++) {
        const lineGeometry = new THREE.BoxGeometry(2.5, 0.2, 0.1);
        const lineEdges = new THREE.EdgesGeometry(lineGeometry);
        const line = new THREE.LineSegments(lineEdges, lineMaterial);
        line.position.y = 1.5 - i * 0.8;
        iconGroup.add(line);
      }

      iconGroup.position.set(...position);
      iconGroup.userData.rotationSpeed = rotationSpeed;
      scene.add(iconGroup);

      return iconGroup;
    };

    // Create multiple history icons
    const historyPositions = [
      [25, 10, -25],
      [-20, -10, -30],
      [15, -15, -20],
      [-25, 5, -35],
      [20, -20, -15]
    ];

    historyPositions.forEach((pos, index) => {
      const icon = createHistoryIcon(pos, 0.001 + index * 0.0005);
      historyIconsRef.current.push(icon);
    });

    // Floating data particles (representing activity logs)
    const dataParticleCount = 500;
    const dataPositions = new Float32Array(dataParticleCount * 3);
    const dataVelocities = [];

    for (let i = 0; i < dataParticleCount * 3; i += 3) {
      dataPositions[i] = (Math.random() - 0.5) * 80;
      dataPositions[i + 1] = (Math.random() - 0.5) * 80;
      dataPositions[i + 2] = (Math.random() - 0.5) * 50 - 10;

      dataVelocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: Math.random() * 0.03 + 0.01, // Upward drift
        z: (Math.random() - 0.5) * 0.05
      });
    }

    const dataGeometry = new THREE.BufferGeometry();
    dataGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3));

    const dataMaterial = new THREE.PointsMaterial({
      color: 0x00D9FF,
      size: 0.3,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const dataParticles = new THREE.Points(dataGeometry, dataMaterial);
    scene.add(dataParticles);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x00D9FF, 0.4);
    scene.add(ambientLight);

    // Point lights
    const light1 = new THREE.PointLight(0x00D9FF, 1.5, 100);
    light1.position.set(-30, 15, -20);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x0EA5E9, 1, 100);
    light2.position.set(25, 10, -25);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x00D9FF, 0.8, 80);
    light3.position.set(0, -20, 20);
    scene.add(light3);

    // Mouse movement handler
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Update star shader time
      starMaterial.uniforms.time.value = time;

      // Rotate galaxy slowly
      stars.rotation.y += 0.0002;
      stars.rotation.x = Math.sin(time * 0.1) * 0.1;

      // Animate clock hands (real time)
      if (clockRef.current) {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12;

        clockRef.current.secondHand.rotation.z = -(seconds / 60) * Math.PI * 2;
        clockRef.current.minuteHand.rotation.z = -(minutes / 60) * Math.PI * 2;
        clockRef.current.hourHand.rotation.z = -((hours + minutes / 60) / 12) * Math.PI * 2;

        // Gentle floating motion for clock
        clockRef.current.group.position.y = 15 + Math.sin(time * 0.5) * 2;
        clockRef.current.group.rotation.y += 0.001;
      }

      // Animate history icons
      historyIconsRef.current.forEach((icon, index) => {
        icon.rotation.y += icon.userData.rotationSpeed;
        icon.rotation.x = Math.sin(time * 0.5 + index) * 0.2;
        icon.position.y += Math.sin(time * 0.8 + index) * 0.02;
        
        // Pulse effect
        const scale = 1 + Math.sin(time * 2 + index) * 0.1;
        icon.scale.set(scale, scale, scale);
      });

      // Update data particles
      const dataPos = dataGeometry.attributes.position.array;
      for (let i = 0; i < dataPos.length; i += 3) {
        const idx = i / 3;
        dataPos[i] += dataVelocities[idx].x;
        dataPos[i + 1] += dataVelocities[idx].y;
        dataPos[i + 2] += dataVelocities[idx].z;

        // Reset particles that go too high
        if (dataPos[i + 1] > 40) {
          dataPos[i + 1] = -40;
          dataPos[i] = (Math.random() - 0.5) * 80;
          dataPos[i + 2] = (Math.random() - 0.5) * 50 - 10;
        }

        // Boundary check for x and z
        if (Math.abs(dataPos[i]) > 40) dataVelocities[idx].x *= -1;
        if (Math.abs(dataPos[i + 2]) > 25) dataVelocities[idx].z *= -1;
      }
      dataGeometry.attributes.position.needsUpdate = true;

      // Camera follows mouse with smooth parallax
      const targetX = mouseRef.current.x * 8;
      const targetY = mouseRef.current.y * 8;
      
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
      dataGeometry.dispose();
      dataMaterial.dispose();
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

export default HistoryBackground3D;
