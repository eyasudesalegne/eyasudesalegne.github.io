import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js';

const canvas = document.getElementById('brain3d');

if (canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(29, 1, .1, 30);
  camera.position.set(0, .02, 6.8);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const brain = new THREE.Group();
  brain.rotation.set(-.05, -.12, -.015);
  brain.scale.setScalar(.92);
  scene.add(brain);

  const cyan = 0x00d9ff;
  const electricBlue = 0x087cff;
  const paleCyan = 0xa8fbff;
  const violet = 0xaa74ff;

  function foldedHemisphere(side) {
    const widthSegments = 40;
    const heightSegments = 28;
    const positions = [];
    const indices = [];

    for (let iy = 0; iy <= heightSegments; iy += 1) {
      const v = iy / heightSegments;
      const phi = v * Math.PI;
      for (let ix = 0; ix <= widthSegments; ix += 1) {
        const u = ix / widthSegments;
        const theta = u * Math.PI * 2;
        const sx = Math.sin(phi) * Math.cos(theta);
        const sy = Math.cos(phi);
        const sz = Math.sin(phi) * Math.sin(theta);

        // Irregular cortical folding layered over a clearly anatomical lobe.
        const fold = 1
          + .055 * Math.sin(theta * 5 + phi * 4.2 + side)
          + .035 * Math.sin(theta * 9 - phi * 6.3)
          + .022 * Math.cos(theta * 13 + phi * 3.1);
        const crown = 1 + .08 * Math.max(0, sy);
        const lowerTaper = sy < -.45 ? 1 + (sy + .45) * .18 : 1;

        positions.push(
          side * .59 + sx * .72 * fold,
          .17 + sy * 1.02 * fold * crown,
          sz * .70 * fold * lowerTaper
        );
      }
    }

    for (let iy = 0; iy < heightSegments; iy += 1) {
      for (let ix = 0; ix < widthSegments; ix += 1) {
        const a = ix + (widthSegments + 1) * iy;
        const b = ix + (widthSegments + 1) * (iy + 1);
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function addNeuralSurface(geometry, opacity = .29) {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: electricBlue,
      transparent: true,
      opacity: .055,
      depthWrite: false,
      side: THREE.DoubleSide
    })));
    group.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({
      color: cyan,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })));
    group.add(new THREE.Points(geometry, new THREE.PointsMaterial({
      color: paleCyan,
      size: .016,
      transparent: true,
      opacity: .66,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })));
    brain.add(group);
    return group;
  }

  addNeuralSurface(foldedHemisphere(-1));
  addNeuralSurface(foldedHemisphere(1));

  // Dark central sulcus keeps the two hemispheres legible throughout rotation.
  const fissureCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.25, .18),
    new THREE.Vector3(-.025, .72, .73),
    new THREE.Vector3(.02, .04, .78),
    new THREE.Vector3(0, -.62, .58)
  ]);
  const fissure = new THREE.Mesh(
    new THREE.TubeGeometry(fissureCurve, 28, .027, 5, false),
    new THREE.MeshBasicMaterial({ color: 0x075ca8, transparent: true, opacity: .8, depthWrite: false })
  );
  brain.add(fissure);

  // Bright curved gyri make the surface read as cortex instead of a generic globe.
  function addGyrus(side, y, phase, tilt = 0) {
    const points = [];
    for (let i = 0; i <= 18; i += 1) {
      const t = i / 18;
      const x = side * (.16 + t * 1.01);
      const arch = Math.sin(t * Math.PI);
      points.push(new THREE.Vector3(
        x,
        y + arch * (.18 + tilt) + Math.sin(t * Math.PI * 3 + phase) * .055,
        .70 * arch + .18
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const line = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 44, .012, 4, false),
      new THREE.MeshBasicMaterial({ color: paleCyan, transparent: true, opacity: .58, blending: THREE.AdditiveBlending })
    );
    brain.add(line);
  }

  [-.58, -.27, .04, .35, .66].forEach((y, index) => {
    addGyrus(-1, y, index * .8, index === 3 ? .08 : 0);
    addGyrus(1, y, index * .8 + .55, index === 2 ? .07 : 0);
  });

  // Posterior cerebellum and descending stem complete the anatomical silhouette.
  const cerebellumGeometry = new THREE.SphereGeometry(.48, 18, 12);
  cerebellumGeometry.scale(1.28, .72, .92);
  const cerebellum = addNeuralSurface(cerebellumGeometry, .42);
  cerebellum.position.set(.48, -.78, -.34);

  const stemGeometry = new THREE.CylinderGeometry(.13, .10, .72, 8, 4, false);
  const stem = addNeuralSurface(stemGeometry, .46);
  stem.position.set(.10, -1.03, -.13);
  stem.rotation.z = -.16;

  // Blinking BCI core.
  const chipMaterial = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: .9, blending: THREE.AdditiveBlending });
  const chip = new THREE.Mesh(new THREE.BoxGeometry(.17, .17, .17), chipMaterial);
  chip.add(new THREE.LineSegments(new THREE.EdgesGeometry(chip.geometry), new THREE.LineBasicMaterial({ color: 0xd9ffff })));
  chip.position.set(0, .06, .12);
  brain.add(chip);

  const arcs = [];
  for (let arcIndex = 0; arcIndex < 4; arcIndex += 1) {
    const points = [];
    const end = new THREE.Vector3(
      (arcIndex % 2 ? -1 : 1) * (.58 + arcIndex * .11),
      .58 - arcIndex * .34,
      .48
    );
    for (let step = 0; step <= 7; step += 1) {
      const t = step / 7;
      points.push(new THREE.Vector3(
        end.x * t + Math.sin(step * 5.3 + arcIndex) * .032,
        .06 + (end.y - .06) * t + Math.cos(step * 4.1) * .024,
        .12 + (end.z - .12) * t + Math.sin(step * 3.7) * .022
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
      // Limited turn preserves the recognizable brain silhouette while remaining genuinely 3D.
      brain.rotation.y = -.12 + Math.sin(seconds * .24) * .42 + pointerX * .16;
      brain.rotation.x += ((-.05 - pointerY * .08) - brain.rotation.x) * .025;
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
