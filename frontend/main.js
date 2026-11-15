import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("logo3d");
const status = document.getElementById("status");
const button = document.getElementById("logoButton");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35, 1, 0.01, 1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.78; // VITALS LOGO LIGHTING V2

container.appendChild(renderer.domElement);

// Illuminazione del modello
scene.add(new THREE.AmbientLight(0x62b6ab, 0.55));

const keyLight = new THREE.DirectionalLight(0xb9f4dd, 1.7);
keyLight.position.set(3, 5, 7);
scene.add(keyLight);

const turquoise = new THREE.PointLight(0x20d8ad, 12);
turquoise.position.set(-3, 2, 4);
scene.add(turquoise);

const rimLight = new THREE.PointLight(0xdba35d, 10);
rimLight.position.set(3, 1, -4);
scene.add(rimLight);

// Gruppo per rotazione a 360 gradi
const modelGroup = new THREE.Group();
scene.add(modelGroup);

const loader = new GLTFLoader();
let loaded = false;

// Caricamento del logo Meshy
loader.load(
  "../assets/logoVITALS_3d.glb",

  (gltf) => {
    const model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);

    if (!Number.isFinite(maxSize) || maxSize <= 0) {
      status.textContent = "INVALID 3D MODEL";
      return;
    }

    // Centratura e scala
    model.position.sub(center);
    model.scale.setScalar(4.95 / maxSize); // VITALS_GRAPHIC_V2 +65%

    modelGroup.add(model);
    loaded = true;

    status.textContent = "CLICK THE LOGO TO ENTER";
  },

  (event) => {
    if (event.total > 0) {
      const percent = Math.round(
        (event.loaded / event.total) * 100
      );
      status.textContent = `LOADING MODEL ${percent}%`;
    }
  },

  (error) => {
    console.error("GLB loading error:", error);
    status.textContent = "MODEL LOADING ERROR";
  }
);

// Posizione camera
camera.position.set(0, 0, 7.5);
camera.lookAt(0, 0, 0);

// Ridimensionamento automatico
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width <= 0 || height <= 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

// Animazione continua
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (loaded) {
    modelGroup.rotation.y += delta * 0.45;
  }

  renderer.render(scene, camera);
}

animate();

// Collegamento alla futura seconda pagina
button.addEventListener("click", () => {
  if (!loaded) return;

  window.location.href = "./dashboard.html";
});



