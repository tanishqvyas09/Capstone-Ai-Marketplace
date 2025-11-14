import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SettingsBackground3D = () => {
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
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 25 + Math.random() * 75;
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

    // Shield/Security icon (3D wireframe shield)
    const createShield = (position) => {
      const shieldGroup = new THREE.Group();

      // Shield shape
      const shieldShape = new THREE.Shape();
      shieldShape.moveTo(0, 8);
      shieldShape.lineTo(4, 6);
      shieldShape.lineTo(4, -2);
      shieldShape.quadraticCurveTo(4, -6, 0, -8);
      shieldShape.quadraticCurveTo(-4, -6, -4, -2);
      shieldShape.lineTo(-4, 6);
      shieldShape.lineTo(0, 8);

      const extrudeSettings = {
        depth: 1,
        bevelEnabled: false
      };

      const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
      const edges = new THREE.EdgesGeometry(shieldGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.7
      });
      const shield = new THREE.LineSegments(edges, lineMaterial);
      shieldGroup.add(shield);

      // Checkmark inside shield
      const checkGeometry = new THREE.BufferGeometry();
      const checkVertices = new Float32Array([
        -2, 0, 0.6,
        -0.5, -2, 0.6,
        2, 3, 0.6
      ]);
      checkGeometry.setAttribute('position', new THREE.BufferAttribute(checkVertices, 3));
      const checkMaterial = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        linewidth: 2
      });
      const check = new THREE.Line(checkGeometry, checkMaterial);
      shieldGroup.add(check);

      shieldGroup.position.set(...position);
      scene.add(shieldGroup);

      return shieldGroup;
    };

    // User profile icon (3D wireframe)
    const createUserIcon = (position, scale) => {
      const userGroup = new THREE.Group();

      // Head
      const headGeometry = new THREE.SphereGeometry(1.5 * scale, 16, 16);
      const headEdges = new THREE.EdgesGeometry(headGeometry);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.6
      });
      const head = new THREE.LineSegments(headEdges, lineMat);
      head.position.y = 2 * scale;
      userGroup.add(head);

      // Body
      const bodyGeometry = new THREE.CylinderGeometry(1 * scale, 2 * scale, 3 * scale, 16);
      const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
      const body = new THREE.LineSegments(bodyEdges, lineMat);
      body.position.y = -1 * scale;
      userGroup.add(body);

      userGroup.position.set(...position);
      userGroup.userData.scale = scale;
      scene.add(userGroup);

      return userGroup;
    };

    // Create floating icons
    const shield1 = createShield([20, 12, -25]);
    const shield2 = createShield([-18, -10, -30]);
    const user1 = createUserIcon([25, -15, -20], 1);
    const user2 = createUserIcon([-25, 10, -35], 1.2);

    const floatingIcons = [shield1, shield2, user1, user2];

    // Rotating rings (settings/configuration symbol)
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(6 + i * 2, 0.3, 16, 32);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.4,
        emissive: 0x00D9FF,
        emissiveIntensity: 0.3,
        wireframe: false
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(0, 5 + i * 2, -40);
      ring.rotation.x = Math.PI / 4 + (i * Math.PI / 6);
      scene.add(ring);
      rings.push(ring);
    }

    // Data particles
    const particleCount = 500;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 100;
      particlePositions[i + 1] = (Math.random() - 0.5) * 100;
      particlePositions[i + 2] = (Math.random() - 0.5) * 50 - 10;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00D9FF,
      size: 0.25,
      transparent: true,
      opacity: 0.4,
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
    pointLight1.position.set(20, 12, -25);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0EA5E9, 1, 100);
    pointLight2.position.set(-18, -10, -30);
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

      // Animate floating icons
      floatingIcons.forEach((icon, index) => {
        icon.rotation.y += 0.002;
        icon.rotation.x = Math.sin(time * 0.5 + index) * 0.2;
        icon.position.y += Math.sin(time * 0.8 + index) * 0.01;
        
        const baseScale = icon.userData.scale || 1;
        const scale = baseScale * (1 + Math.sin(time * 1.5 + index) * 0.1);
        icon.scale.set(scale, scale, scale);
      });

      // Animate rings
      rings.forEach((ring, index) => {
        ring.rotation.z += 0.001 * (index + 1);
        ring.rotation.y += 0.002;
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

export default SettingsBackground3D;
