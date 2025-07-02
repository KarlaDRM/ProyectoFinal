import * as THREE from 'three';

// Variables globales
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;

let fishes: THREE.Group[] = [];
let bubbles: THREE.Mesh[] = [];
let foodParticles: THREE.Mesh[] = [];

let fishCount = 0;
let foodCount = 0;
let bubbleCount = 0;

// Controles de cámara
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

// Inicializar
init();
animate();

function init(): void {
  // Crear escena
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x006994, 10, 50);

  // Crear cámara
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);
  camera.lookAt(0, 0, 0);

  // Crear renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Raycaster
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Crear escena
  createOcean();
  createLighting();
  createSeaFloor();
  
  // Crear peces iniciales
  for (let i = 0; i < 8; i++) {
    createFish();
  }
  
  // Crear burbujas iniciales
  for (let i = 0; i < 20; i++) {
    createBubble();
  }
  
  // Event listeners
  setupEvents();
  
  // Ocultar loading
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  }, 1000);
  
  updateStats();
}

function createOcean(): void {
  const oceanGeometry = new THREE.PlaneGeometry(100, 100);
  const oceanMaterial = new THREE.MeshLambertMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.8
  });
  
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = 10;
  scene.add(ocean);
}

function createLighting(): void {
  const ambientLight = new THREE.AmbientLight(0x4488bb, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const underwaterLight = new THREE.PointLight(0x00ffff, 0.5, 30);
  underwaterLight.position.set(0, -5, 0);
  scene.add(underwaterLight);
}

function createSeaFloor(): void {
  const floorGeometry = new THREE.PlaneGeometry(80, 80);
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xF4E4BC });
  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -8;
  floor.receiveShadow = true;
  scene.add(floor);

  // Rocas
  for (let i = 0; i < 15; i++) {
    const rockGeometry = new THREE.SphereGeometry(Math.random() * 1 + 0.5, 8, 6);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    rock.position.x = (Math.random() - 0.5) * 60;
    rock.position.y = -7.5;
    rock.position.z = (Math.random() - 0.5) * 60;
    rock.castShadow = true;
    scene.add(rock);
  }

  // Corales
  for (let i = 0; i < 10; i++) {
    const coralGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
    const colors = [0xFF6B6B, 0xFF8E53, 0x9B59B6, 0x3498DB];
    const coralMaterial = new THREE.MeshLambertMaterial({ 
      color: colors[Math.floor(Math.random() * colors.length)] 
    });
    const coral = new THREE.Mesh(coralGeometry, coralMaterial);
    
    coral.position.x = (Math.random() - 0.5) * 50;
    coral.position.y = -7;
    coral.position.z = (Math.random() - 0.5) * 50;
    scene.add(coral);
  }
}

function createFish(): void {
  const fishGroup = new THREE.Group();
  
  const colors = [0xFF6347, 0x4169E1, 0xFF1493, 0xFFD700, 0x32CD32, 0x00CED1];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Cuerpo
  const bodyGeometry = new THREE.SphereGeometry(0.5, 12, 8);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.z = 1.5;
  fishGroup.add(body);
  
  // Cola
  const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 6);
  const tailMaterial = new THREE.MeshLambertMaterial({ color });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.z = -1;
  tail.rotation.x = Math.PI / 2;
  fishGroup.add(tail);
  
  // Ojos
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 6);
  const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
  
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(0.2, 0.2, 0.4);
  fishGroup.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(-0.2, 0.2, 0.4);
  fishGroup.add(eye2);
  
  // Posición aleatoria
  fishGroup.position.x = (Math.random() - 0.5) * 40;
  fishGroup.position.y = Math.random() * 10 - 2;
  fishGroup.position.z = (Math.random() - 0.5) * 40;
  
  fishGroup.castShadow = true;
  scene.add(fishGroup);
  fishes.push(fishGroup);
  fishCount++;
}

function createBubble(): void {
  const bubbleGeometry = new THREE.SphereGeometry(Math.random() * 0.2 + 0.1, 8, 6);
  const bubbleMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  });
  
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  bubble.position.x = (Math.random() - 0.5) * 60;
  bubble.position.y = -8;
  bubble.position.z = (Math.random() - 0.5) * 60;
  
  scene.add(bubble);
  bubbles.push(bubble);
  bubbleCount++;
}

function setupEvents(): void {
  renderer.domElement.addEventListener('click', onMouseClick);
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  renderer.domElement.addEventListener('wheel', onWheel);
  window.addEventListener('resize', onResize);
  document.addEventListener('contextmenu', e => e.preventDefault());
}

function onMouseClick(event: MouseEvent): void {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    const point = intersects[0].point;
    createFood(point);
  }
}

function createFood(position: THREE.Vector3): void {
  const foodGeometry = new THREE.SphereGeometry(0.1, 8, 6);
  const foodMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  const food = new THREE.Mesh(foodGeometry, foodMaterial);
  
  food.position.copy(position);
  scene.add(food);
  foodParticles.push(food);
  foodCount++;
  updateStats();
  
  setTimeout(() => {
    scene.remove(food);
    const index = foodParticles.indexOf(food);
    if (index > -1) {
      foodParticles.splice(index, 1);
    }
  }, 10000);
}

function onMouseDown(event: MouseEvent): void {
  if (event.button === 0) {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
}

function onMouseMove(event: MouseEvent): void {
  if (mouseDown) {
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;
    
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    spherical.theta -= deltaX * 0.01;
    spherical.phi += deltaY * 0.01;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
}

function onMouseUp(): void {
  mouseDown = false;
}

function onWheel(event: WheelEvent): void {
  const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  const newDistance = Math.max(5, Math.min(50, distance + event.deltaY * 0.01));
  
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  camera.position.copy(direction.multiplyScalar(-newDistance));
  camera.lookAt(0, 0, 0);
}

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateStats(): void {
  const fishCountEl = document.getElementById('fish-count');
  const foodCountEl = document.getElementById('food-count');
  const bubbleCountEl = document.getElementById('bubble-count');
  
  if (fishCountEl) fishCountEl.textContent = fishCount.toString();
  if (foodCountEl) foodCountEl.textContent = foodCount.toString();
  if (bubbleCountEl) bubbleCountEl.textContent = bubbleCount.toString();
}

// Funciones globales
declare global {
  interface Window {
    addFish: () => void;
    addBubbles: () => void;
    toggleDay: () => void;
  }
}

window.addFish = () => {
  createFish();
  updateStats();
};

window.addBubbles = () => {
  for (let i = 0; i < 5; i++) {
    createBubble();
  }
  updateStats();
};

window.toggleDay = () => {
  // Función simple de día/noche
  console.log('Cambio de día/noche');
};

function animate(): void {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Animar peces (movimiento simple)
  fishes.forEach((fish, index) => {
    fish.position.x += Math.sin(time * 0.5 + index) * 0.02;
    fish.position.y += Math.cos(time * 0.3 + index) * 0.01;
    fish.rotation.y = Math.sin(time * 0.5 + index) * 0.3;
  });

  // Animar burbujas
  bubbles.forEach((bubble, index) => {
    bubble.position.y += 0.02;
    bubble.position.x += Math.sin(time * 2 + index) * 0.01;
    
    if (bubble.position.y > 12) {
      bubble.position.y = -8;
      bubble.position.x = (Math.random() - 0.5) * 60;
      bubble.position.z = (Math.random() - 0.5) * 60;
    }
  });

  // Crear burbujas aleatorias
  if (Math.random() < 0.01) {
    createBubble();
    updateStats();
  }

  renderer.render(scene, camera);
}