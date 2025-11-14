import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const geometriesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Create star texture for particles
  const createStarTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for star glow
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(0, 217, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 217, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(0, 217, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

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

    // Particle system - Enhanced with stars
    const particleCount = 2500; // Increased particle count
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount); // Variable star sizes

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = (Math.random() - 0.5) * 120;
      positions[i + 2] = (Math.random() - 0.5) * 120;

      velocities[i] = (Math.random() - 0.5) * 0.015;
      velocities[i + 1] = (Math.random() - 0.5) * 0.015;
      velocities[i + 2] = (Math.random() - 0.5) * 0.015;
      
      // Variable star sizes for more realistic effect
      sizes[i / 3] = Math.random() * 0.3 + 0.1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00D9FF,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      map: createStarTexture() // Star texture
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = { mesh: particles, velocities };

    // Floating wireframe geometries
    const createWireframeGeometry = (geometry, position) => {
      const wireframe = new THREE.WireframeGeometry(geometry);
      const line = new THREE.LineSegments(wireframe);
      line.material = new THREE.LineBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.15
      });
      line.position.set(...position);
      scene.add(line);
      return line;
    };

    // Create floating geometries
    const torusGeo = new THREE.TorusGeometry(8, 1, 16, 100);
    const torus = createWireframeGeometry(torusGeo, [20, 10, -20]);

    const octahedronGeo = new THREE.OctahedronGeometry(5, 0);
    const octahedron = createWireframeGeometry(octahedronGeo, [-25, -15, -30]);

    const icosahedronGeo = new THREE.IcosahedronGeometry(6, 0);
    const icosahedron = createWireframeGeometry(icosahedronGeo, [15, -20, -25]);

    geometriesRef.current = [torus, octahedron, icosahedron];

    // Add subtle nebula clouds
    const createNebulaCloud = (position, scale) => {
      const cloudGeo = new THREE.SphereGeometry(scale, 32, 32);
      const cloudMat = new THREE.MeshBasicMaterial({
        color: 0x00D9FF,
        transparent: true,
        opacity: 0.03,
        blending: THREE.AdditiveBlending
      });
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(...position);
      scene.add(cloud);
      return cloud;
    };

    const cloud1 = createNebulaCloud([30, 20, -40], 15);
    const cloud2 = createNebulaCloud([-35, -15, -50], 12);
    const cloud3 = createNebulaCloud([0, 25, -45], 18);
    geometriesRef.current.push(cloud1, cloud2, cloud3);

    // Grid plane
    const gridHelper = new THREE.GridHelper(100, 50, 0x00D9FF, 0x00D9FF);
    gridHelper.material.opacity = 0.05;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -30;
    gridHelper.rotation.x = Math.PI / 6;
    scene.add(gridHelper);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x00D9FF, 0.3);
    scene.add(ambientLight);

    // Point lights
    const light1 = new THREE.PointLight(0x00D9FF, 1, 100);
    light1.position.set(30, 30, 30);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x0EA5E9, 0.5, 100);
    light2.position.set(-30, -30, 30);
    scene.add(light2);

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

      // Update particles
      const positions = particlesRef.current.mesh.geometry.attributes.position.array;
      const velocities = particlesRef.current.velocities;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Boundary check
        if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
        if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 50) velocities[i + 2] *= -1;
      }

      particlesRef.current.mesh.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.mesh.rotation.y += 0.0005;

      // Rotate geometries
      geometriesRef.current.forEach((geo, index) => {
        geo.rotation.x += 0.002 * (index + 1);
        geo.rotation.y += 0.003 * (index + 1);
        geo.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
      });

      // Camera follows mouse
      camera.position.x += (mouseRef.current.x * 5 - camera.position.x) * 0.05;
      camera.position.y += (mouseRef.current.y * 5 - camera.position.y) * 0.05;
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
      particleGeometry.dispose();
      particleMaterial.dispose();
      torusGeo.dispose();
      octahedronGeo.dispose();
      icosahedronGeo.dispose();
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

export default ThreeBackground;
