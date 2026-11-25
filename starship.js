import * as THREE from 'three';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(
  canvas.clientWidth, canvas.clientHeight, false
);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05060d');
const camera = new THREE.PerspectiveCamera(
  45, canvas.clientWidth / canvas.clientHeight,
  0.1, 400
);
const fit = Math.max(1, 0.9 / camera.aspect);
camera.position.set(7 * fit, 5, 13 * fit);
camera.lookAt(0, 10, 0);

scene.add(new THREE.AmbientLight('#8090c0', 0.6));
const moon = new THREE.DirectionalLight('#c9d4ff', 2.5);
moon.position.set(-10, 20, 10);
scene.add(moon);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: '#161927' })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const far = new Float32Array(3000 * 3).map(
  () => (Math.random() - 0.5) * 300
);
const stars = new THREE.BufferGeometry();
stars.setAttribute(
  'position', new THREE.BufferAttribute(far, 3)
);
scene.add(new THREE.Points(stars,
  new THREE.PointsMaterial({
    size: 2, sizeAttenuation: false, color: '#c9d4ff',
  })
));

const steel = new THREE.MeshStandardMaterial({
  color: '#2b3150', metalness: 0.6, roughness: 0.5,
});
const tower = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 15, 1.6), steel
);
tower.position.set(-2, 7.5, 0);
scene.add(tower);
tower.add(new THREE.LineSegments(
  new THREE.WireframeGeometry(
    new THREE.BoxGeometry(1.62, 15, 1.62, 2, 20, 2)
  ),
  new THREE.LineBasicMaterial({ color: '#737aa2' })
));

const arms = [1, -1].map((side) => {
  const hinge = new THREE.Group();
  hinge.position.set(-1.2, 11, side * 0.7);
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.5, 0.3), steel
  );
  arm.position.x = 2.5;
  hinge.add(arm);
  scene.add(hinge);
  return { hinge, side };
});

const booster = new THREE.Group();
booster.add(new THREE.Mesh(
  new THREE.CylinderGeometry(0.45, 0.45, 7, 32),
  new THREE.MeshStandardMaterial({
    color: '#d8dbe4', metalness: 0.25, roughness: 0.4,
  })
));
for (let k = 0; k < 4; k++) {
  const fin = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 0.06), steel
  );
  const a = (k * Math.PI) / 2 + Math.PI / 4;
  fin.position.set(Math.cos(a) * 0.8, 3.1, Math.sin(a) * 0.8);
  fin.rotation.y = -a;
  booster.add(fin);
}
const flame = new THREE.Mesh(
  new THREE.ConeGeometry(0.4, 3, 24),
  new THREE.MeshBasicMaterial({
    color: '#ffb14a', transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending,
  })
);
flame.rotation.x = Math.PI;
flame.position.y = -5;
booster.add(flame);
const fire = new THREE.PointLight('#ff9a3c', 40, 40, 1);
fire.position.y = -4.5;
booster.add(fire);
booster.position.set(1.3, 7.8, 0);
scene.add(booster);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  const s = ((t + 4) % 12) / 7;
  const fall = Math.max(0, 1 - s);
  booster.position.y = 7.8 + 24 * fall * fall;
  booster.rotation.z = 0.06 * fall * Math.sin(t * 1.7);
  const open = Math.min(0.6, Math.max(0, (1.25 - s) * 2.4));
  arms.forEach((a) => (a.hinge.rotation.y = -a.side * open));
  flame.visible = fire.visible = s < 1;
  flame.scale.y = 0.8 + Math.random() * 0.4;
  renderer.render(scene, camera);
});
