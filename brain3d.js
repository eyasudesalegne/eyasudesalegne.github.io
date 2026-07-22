import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js';

const canvas = document.getElementById('brain3d');

if (canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 30);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const brain = new THREE.Group();
  brain.rotation.set(-.08, -.42, -.04);
  scene.add(brain);

  const cyan = 0x00d9ff;
  const electricBlue = 0x087cff;
  const violet = 0xaa74ff;

  function deformGeometry(geometry, seed, ridgeStrength = .095) {
    const position = geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 1) {
      v.fromBufferAttribute(position, i);
      const ridge = 1
        + Math.sin(v.x * 8.2 + seed) * ridgeStrength
        + Math.sin(v.y * 10.7 - seed * 1.3) * ridgeStrength * .72
        + Math.cos((v.x + v.y + v.z) * 7.4 + seed) * ridgeStrength * .48;
      v.multiplyScalar(ridge);
      position.setXYZ(i, v.x, v.y, v.z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }

  function neuralVolume(geometry, scale, position, seed, opacity = .31) {
    deformGeometry(geometry, seed);
    geometry.scale(scale.x, scale.y, scale.z);

    const shell = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: electricBlue,
      transparent: true,
      opacity: .075,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    const wires = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({
      color: cyan,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    const nodes = new THREE.Points(geometry, new THREE.PointsMaterial({
      color: 0x8ff6ff,
      size: .021,
      transparent: true,
      opacity: .78,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    const volume = new THREE.Group();
    volume.add(shell, wires, nodes);
    volume.position.copy(position);
    brain.add(volume);
    return volume;
  }

  // Two folded hemispheres form the cortex. They overlap from the lateral
  // view, then separate visibly as the real 3D object rotates.
  neuralVolume(new THREE.IcosahedronGeometry(1, 4), new THREE.Vector3(1.48, 1.02, .69), new THREE.Vector3(-.1, .18, .27), .7);
  neuralVolume(new THREE.IcosahedronGeometry(1, 4), new THREE.Vector3(1.48, 1.02, .69), new THREE.Vector3(-.1, .18, -.27), 2.4);

  // Anatomical anchors: posterior cerebellum and descending brainstem.
  const cerebellum = neuralVolume(new THREE.IcosahedronGeometry(1, 3), new THREE.Vector3(.62, .43, .58), new THREE.Vector3(.75, -.7, 0), 4.8, .38);
  cerebellum.rotation.z = -.12;
  const stemGeometry = new THREE.CylinderGeometry(.16, .11, .88, 9, 4, false);
  stemGeometry.rotateZ(-.12);
  const stem = neuralVolume(stemGeometry, new THREE.Vector3(1, 1, 1), new THREE.Vector3(.15, -1.02, 0), 1.2, .44);
  stem.rotation.z = -.08;

  // Blinking BCI core.
  const chipMaterial = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: .9, blending: THREE.AdditiveBlending });
  const chip = new THREE.Mesh(new THREE.BoxGeometry(.18, .18, .18), chipMaterial);
  const chipEdges = new THREE.LineSegments(new THREE.EdgesGeometry(chip.geometry), new THREE.LineBasicMaterial({ color: 0xc8ffff }));
  chip.add(chipEdges);
  chip.position.set(-.02, .04, 0);
  brain.add(chip);

  const arcs = [];
  for (let arcIndex = 0; arcIndex < 4; arcIndex += 1) {
    const points = [];
    const end = new THREE.Vector3(
      (arcIndex < 2 ? -1 : 1) * (.62 + arcIndex * .14),
      .5 - arcIndex * .32,
      (arcIndex % 2 ? -1 : 1) * .36
    );
    for (let step = 0; step <= 7; step += 1) {
      const t = step / 7;
      points.push(new THREE.Vector3(
        end.x * t + Math.sin(step * 5.3 + arcIndex) * .035,
        .04 + (end.y - .04) * t + Math.cos(step * 4.1) * .025,
        end.z * t + Math.sin(step * 3.7) * .025
      ));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({
      color: arcIndex === 2 ? violet : cyan,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    }));
    brain.add(line);
    arcs.push(line);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX / window.innerWidth - .5;
    pointerY = event.clientY / window.innerHeight - .5;
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function animate(time = 0) {
    const seconds = time * .001;
    if (!reducedMotion) {
      brain.rotation.y = -.42 + seconds * .17 + pointerX * .22;
      brain.rotation.x += ((-.08 - pointerY * .12) - brain.rotation.x) * .025;
    }
    const pulse = .62 + Math.sin(seconds * 4.8) * .28;
    chip.scale.setScalar(.88 + pulse * .28);
    chipMaterial.opacity = pulse;
    arcs.forEach((arc, index) => {
      const flash = Math.max(0, Math.sin(seconds * 1.45 - index * 1.35) - .87) * 5.8;
      arc.material.opacity = flash * .82;
    });
    renderer.render(scene, camera);
    if (!reducedMotion) requestAnimationFrame(animate);
  }
  animate();
}
