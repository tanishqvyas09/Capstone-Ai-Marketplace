import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AnalyticsBackground3D = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const chartRingsRef = useRef([]);
  const dataStreamsRef = useRef([]);

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

    // Galaxy star field
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Spherical distribution
      const radius = 30 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);

      // Cyan color variations
      starColors[i] = Math.random() * 0.3; // R
      starColors[i + 1] = 0.8 + Math.random() * 0.2; // G
      starColors[i + 2] = 1; // B

      starSizes[i / 3] = Math.random() * 2.5 + 0.5;
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
          float pulsate = 1.0 + sin(time * 0.5 + position.x * 0.05 + position.y * 0.05) * 0.4;
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
          alpha = pow(alpha, 2.0);
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Orbital chart rings (representing data visualization)
    const createChartRing = (radius, thickness, position, rotationSpeed) => {
      const ringGroup = new THREE.Group();

      // Main ring
      const ringGeometry = new THREE.TorusGeometry(radius, thickness, 16, 64);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.4,
        emissive: 0x00D9FF,
        emissiveIntensity: 0.3,
        wireframe: false
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ringGroup.add(ring);

      // Wireframe overlay
      const wireframeGeo = new THREE.TorusGeometry(radius, thickness, 16, 64);
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x00D9FF,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
      ringGroup.add(wireframe);

      // Data points on the ring
      const pointCount = 20;
      for (let i = 0; i < pointCount; i++) {
        const angle = (i / pointCount) * Math.PI * 2;
        const pointGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const pointMaterial = new THREE.MeshPhongMaterial({
          color: 0x00D9FF,
          emissive: 0x00D9FF,
          emissiveIntensity: 0.8
        });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.x = Math.cos(angle) * radius;
        point.position.y = Math.sin(angle) * radius;
        ringGroup.add(point);
      }

      ringGroup.position.set(...position);
      ringGroup.userData.rotationSpeed = rotationSpeed;
      ringGroup.rotation.x = Math.PI / 4;
      scene.add(ringGroup);

      return ringGroup;
    };

    // Create multiple orbital rings at different positions
    chartRingsRef.current = [
      createChartRing(12, 0.3, [-25, 10, -30], 0.002),
      createChartRing(8, 0.2, [20, -8, -25], -0.003),
      createChartRing(15, 0.4, [15, 15, -40], 0.0015),
      createChartRing(10, 0.25, [-15, -12, -20], -0.0025)
    ];

    // Data stream particles (representing analytics data flow)
    const streamCount = 800;
    const streamPositions = new Float32Array(streamCount * 3);
    const streamVelocities = [];

    for (let i = 0; i < streamCount * 3; i += 3) {
      streamPositions[i] = (Math.random() - 0.5) * 100;
      streamPositions[i + 1] = -50 + Math.random() * 20;
      streamPositions[i + 2] = (Math.random() - 0.5) * 60 - 10;

      streamVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: 0.05 + Math.random() * 0.05,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    const streamGeometry = new THREE.BufferGeometry();
    streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));

    const streamMaterial = new THREE.PointsMaterial({
      color: 0x00D9FF,
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const dataStream = new THREE.Points(streamGeometry, streamMaterial);
    scene.add(dataStream);
    dataStreamsRef.current = { mesh: dataStream, velocities: streamVelocities };

    // Floating 3D bar chart elements
    const createFloatingBar = (height, position) => {
      const barGeometry = new THREE.BoxGeometry(1.5, height, 1.5);
      const edges = new THREE.EdgesGeometry(barGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.7
      });
      const bar = new THREE.LineSegments(edges, lineMaterial);
      
      // Add glowing top
      const topGeometry = new THREE.PlaneGeometry(1.5, 1.5);
      const topMaterial = new THREE.MeshBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = height / 2;
      top.rotation.x = Math.PI / 2;
      bar.add(top);

      bar.position.set(...position);
      scene.add(bar);
      return bar;
    };

    // Create floating chart bars
    const floatingBars = [
      createFloatingBar(8, [25, 0, -35]),
      createFloatingBar(12, [28, 0, -35]),
      createFloatingBar(6, [31, 0, -35]),
      createFloatingBar(10, [34, 0, -35]),
      createFloatingBar(15, [37, 0, -35]),
      createFloatingBar(7, [-30, 5, -30]),
      createFloatingBar(11, [-27, 5, -30]),
      createFloatingBar(9, [-24, 5, -30])
    ];

    // Grid plane for depth
    const gridSize = 120;
    const gridHelper = new THREE.GridHelper(gridSize, 60, 0x00D9FF, 0x0EA5E9);
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -35;
    gridHelper.rotation.x = 0;
    scene.add(gridHelper);

    // Perspective grid on the side
    const sideGrid = new THREE.GridHelper(80, 40, 0x00D9FF, 0x0EA5E9);
    sideGrid.material.opacity = 0.06;
    sideGrid.material.transparent = true;
    sideGrid.rotation.z = Math.PI / 2;
    sideGrid.position.x = -50;
    scene.add(sideGrid);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x00D9FF, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00D9FF, 1.5, 100);
    pointLight1.position.set(-25, 10, -30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0EA5E9, 1.2, 100);
    pointLight2.position.set(20, -8, -25);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00D9FF, 1, 80);
    pointLight3.position.set(0, 20, 10);
    scene.add(pointLight3);

    // Mouse movement
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

      // Update star shader
      starMaterial.uniforms.time.value = time;

      // Rotate galaxy
      stars.rotation.y += 0.0001;
      stars.rotation.x = Math.sin(time * 0.05) * 0.05;

      // Animate orbital rings
      chartRingsRef.current.forEach((ring, index) => {
        ring.rotation.z += ring.userData.rotationSpeed;
        ring.position.y += Math.sin(time * 0.3 + index * 2) * 0.01;
        
        // Pulse effect
        const scale = 1 + Math.sin(time * 1.5 + index) * 0.05;
        ring.scale.set(scale, scale, scale);
      });

      // Animate data stream
      const streamPos = dataStreamsRef.current.mesh.geometry.attributes.position.array;
      const streamVel = dataStreamsRef.current.velocities;

      for (let i = 0; i < streamPos.length; i += 3) {
        const idx = i / 3;
        streamPos[i] += streamVel[idx].x;
        streamPos[i + 1] += streamVel[idx].y;
        streamPos[i + 2] += streamVel[idx].z;

        // Reset particles
        if (streamPos[i + 1] > 50) {
          streamPos[i + 1] = -50;
          streamPos[i] = (Math.random() - 0.5) * 100;
          streamPos[i + 2] = (Math.random() - 0.5) * 60 - 10;
        }

        // Boundaries
        if (Math.abs(streamPos[i]) > 50) streamVel[idx].x *= -1;
        if (Math.abs(streamPos[i + 2]) > 30) streamVel[idx].z *= -1;
      }
      dataStreamsRef.current.mesh.geometry.attributes.position.needsUpdate = true;

      // Animate floating bars
      floatingBars.forEach((bar, index) => {
        bar.position.y = Math.sin(time * 0.5 + index * 0.5) * 2;
        bar.rotation.y += 0.002;
      });

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
      streamGeometry.dispose();
      streamMaterial.dispose();
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

export default AnalyticsBackground3D;
