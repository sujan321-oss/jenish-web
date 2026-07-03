// Lightweight 3D background using Three.js.
// Floating wireframe shapes + a particle field, themed to the site accent color.
(function () {
  const canvas = document.getElementById('scene');
  if (!canvas || typeof THREE === 'undefined') {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const accent = new THREE.Color('#6bb6ff');
  const accentStrong = new THREE.Color('#3b9cff');

  // Ambient + point lights so solid shapes catch highlights.
  scene.add(new THREE.AmbientLight(0x35506b, 1.1));
  const keyLight = new THREE.PointLight(0x6bb6ff, 1.4, 100);
  keyLight.position.set(10, 12, 14);
  scene.add(keyLight);

  // Floating shapes.
  const shapes = [];
  const geometries = [
    new THREE.IcosahedronGeometry(1.6, 0),
    new THREE.TorusGeometry(1.2, 0.4, 16, 40),
    new THREE.OctahedronGeometry(1.5, 0),
    new THREE.DodecahedronGeometry(1.4, 0),
    new THREE.TetrahedronGeometry(1.6, 0),
  ];

  for (let i = 0; i < 9; i++) {
    const geometry = geometries[i % geometries.length];
    const wire = Math.random() > 0.5;
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? accent : accentStrong,
      wireframe: wire,
      transparent: true,
      opacity: wire ? 0.55 : 0.35,
      roughness: 0.35,
      metalness: 0.4,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 10 - 4
    );
    const scale = 0.5 + Math.random() * 0.9;
    mesh.scale.setScalar(scale);
    mesh.userData.spin = {
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.006,
    };
    mesh.userData.floatSeed = Math.random() * Math.PI * 2;
    mesh.userData.baseY = mesh.position.y;
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Particle starfield.
  const particleCount = 900;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 60;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: accent,
    size: 0.08,
    transparent: true,
    opacity: 0.7,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Pointer parallax.
  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    shapes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.spin.x;
      mesh.rotation.y += mesh.userData.spin.y;
      mesh.position.y = mesh.userData.baseY + Math.sin(t + mesh.userData.floatSeed) * 0.6;
    });

    particles.rotation.y = t * 0.02;

    // Smooth camera parallax toward pointer + scroll.
    camera.position.x += (pointer.x * 2.2 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.y * 1.6 - scrollY * 0.002 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  animate();
  if (prefersReducedMotion) {
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
