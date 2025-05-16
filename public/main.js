import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

const womanUrl = new URL('/woman.glb', import.meta.url);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 6); // Pull back for better view

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('mesh');
if (container) {
  container.appendChild(renderer.domElement);
}

// Lights
const mainLight = new THREE.PointLight('white', 1);
mainLight.position.set(10, 5, 0);
const secondLight = new THREE.PointLight('#fde58b', 0.2);
secondLight.position.set(-5, 5, 0);
const ambientLight = new THREE.AmbientLight('white', 0.1);
scene.add(mainLight, secondLight, ambientLight);

// Model Setup
const assetLoader = new GLTFLoader();
let mixer, animationAction, model;

assetLoader.load(womanUrl.href, function (gltf) {
  model = gltf.scene;
  scene.add(model);
  mixer = new THREE.AnimationMixer(model);
  const clip = THREE.AnimationClip.findByName(gltf.animations, 'Action');
  animationAction = mixer.clipAction(clip);
  animationAction.play();
}, undefined, error => {
  console.error("Error loading model:", error);
});

// Sphere Setup
let sphere, materialLoaded = false;

async function loadShader(url) {
  const res = await fetch(url);
  return res.text();
}

async function createCustomMaterial() {
  const vertexShader = await loadShader('./shaders/vertexShader.vert');
  const fragmentShader = await loadShader('./shaders/fragmentShader.frag');

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { value: 0.0 }
    }
  });
}

createCustomMaterial().then(material => {
  const geo = new THREE.IcosahedronGeometry(4, 30);
  sphere = new THREE.Mesh(geo, material);
  sphere.customDepthMaterial = new THREE.MeshDepthMaterial();
  sphere.visible = false;
  scene.add(sphere);
  materialLoaded = true;
});

// Scroll logic: animate model until 1/3 scroll, then show sphere
window.addEventListener('scroll', () => {
  const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  const animationEndPoint = 1 / 3;

  if (mixer && animationAction && model) {
    if (scrollPercent <= animationEndPoint) {
      const adjustedScrollPercent = scrollPercent / animationEndPoint;
      const duration = animationAction.getClip().duration;

      mixer.setTime(adjustedScrollPercent * duration);
      model.rotation.y = adjustedScrollPercent * -Math.PI / 3;

      model.visible = true;
      if (materialLoaded && sphere) sphere.visible = false;
    } else {
      model.visible = false;
      if (materialLoaded && sphere) sphere.visible = true;
    }
  }
});

// Resize handling
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, 200);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // Time uniform update for shaders
  if (materialLoaded && sphere) {
    const elapsed = clock.getElapsedTime();
    sphere.material.uniforms.u_time.value = elapsed;
  }

  renderer.render(scene, camera);
}
animate();
