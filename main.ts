import * as THREE from 'three';

// Tipos
interface Fish {
  mesh: THREE.Object3D;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  species: string;
  description: string;
  speed: number;
}

interface Bubble {
  mesh: THREE.Mesh;
  speed: number;
  life: number;
}

// Variables globales
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;

let fishes: Fish[] = [];
let bubbles: Bubble[] = [];
let corals: THREE.Group[] = [];
let seaweed: THREE.Group[] = [];
let ocean: THREE.Mesh;
let foodParticles: THREE.Mesh[] = [];

let isDay = true;
let fishCount = 0;
let foodCount = 0;
let bubbleCount = 0;

// Controles de cámara
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

// Especies de peces
const fishSpecies = [
  { name: "Pez Payaso", color: 0xFF6347, description: "Pequeño y juguetón, vive entre las anémonas", scale: 0.8 },
  { name: "Pez Ángel", color: 0x4169E1, description: "Elegante nadador con aletas largas", scale: 1.2 },
  { name: "Pez Tropical", color: 0xFF1493, description: "Colorido habitante de arrecifes", scale: 1.0 },
  { name: "Pez Dorado", color: 0xFFD700, description: "Brillante como el oro del mar", scale: 0.9 },
  { name: "Pez Loro", color: 0x32CD32, description: "Come coral y mantiene el ecosistema", scale: 1.3 },
  { name: "Pez Cirujano", color: 0x00CED1, description: "Rápido nadador de aguas profundas", scale: 1.1 }
];

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
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container')!.appendChild(renderer.domElement);

  // Raycaster para interacciones
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Crear océano
  createOcean();
  
  // Crear iluminación
  createLighting();
  
  // Crear fondo marino
  createSeaFloor();
  
  // Crear corales
  createCorals();
  
  // Crear algas
  createSeaweed();
  
  // Agregar peces iniciales
  for (let i = 0; i < 8; i++) {
    const newFish = createFish();
    fishes.push(newFish);
    fishCount++;
  }
  
  // Crear burbujas iniciales
  for (let i = 0; i < 20; i++) {
    createBubble();
  }
  
  // Event listeners
  setupEvents();
  
  // Ocultar pantalla de carga
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  }, 2000);
  
  updateStats();
}

function createOcean(): void {
  const oceanGeometry = new THREE.PlaneGeometry(100, 100, 64, 64);
  const oceanMaterial = new THREE.MeshLambertMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.8
  });
  
  ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = 10;
  scene.add(ocean);
}

function createLighting(): void {
  // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0x4488bb, 0.6);
  scene.add(ambientLight);

  // Luz direccional (sol)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // Guardar referencias
  scene.userData.directionalLight = directionalLight;
  scene.userData.ambientLight = ambientLight;

  // Luz submarina
  const underwaterLight = new THREE.PointLight(0x00ffff, 0.5, 30);
  underwaterLight.position.set(0, -5, 0);
  scene.add(underwaterLight);
}

function createSeaFloor(): void {
  // Suelo arenoso
  const floorGeometry = new THREE.PlaneGeometry(80, 80);
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xF4E4BC });
  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -8;
  floor.receiveShadow = true;
  scene.add(floor);

  // Rocas en el fondo
  for (let i = 0; i < 15; i++) {
    const rockGeometry = new THREE.SphereGeometry(
      Math.random() * 1.5 + 0.5,
      8,
      6
    );
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    rock.position.x = (Math.random() - 0.5) * 60;
    rock.position.y = -7.5 + Math.random() * 1;
    rock.position.z = (Math.random() - 0.5) * 60;
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    scene.add(rock);
  }
}

function createCorals(): void {
  for (let i = 0; i < 12; i++) {
    const coral = new THREE.Group();
    
    // Coral simple
    const coralGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
    const colors = [0xFF6B6B, 0xFF8E53, 0xFF6B9D, 0xC44569, 0x9B59B6, 0x3498DB];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const coralMaterial = new THREE.MeshLambertMaterial({ color });
    const coralMesh = new THREE.Mesh(coralGeometry, coralMaterial);
    
    coralMesh.position.y = 1;
    coral.add(coralMesh);
    
    coral.position.x = (Math.random() - 0.5) * 50;
    coral.position.y = -7;
    coral.position.z = (Math.random() - 0.5) * 50;
    coral.scale.setScalar(Math.random() * 0.8 + 0.5);
    
    scene.add(coral);
    corals.push(coral);
  }
}

function createSeaweed(): void {
  for (let i = 0; i < 20; i++) {
    const seaweedGroup = new THREE.Group();
    
    for (let j = 0; j < 3; j++) {
      const seaweedGeometry = new THREE.CylinderGeometry(0.05, 0.1, 3, 6);
      const seaweedMaterial = new THREE.MeshLambertMaterial({ color: 0x2ECC71 });
      const seaweedBlade = new THREE.Mesh(seaweedGeometry, seaweedMaterial);
      
      seaweedBlade.position.x = (Math.random() - 0.5) * 0.5;
      seaweedBlade.position.y = 1.5;
      seaweedBlade.position.z = (Math.random() - 0.5) * 0.5;
      seaweedBlade.rotation.z = (Math.random() - 0.5) * 0.3;
      
      seaweedGroup.add(seaweedBlade);
    }
    
    seaweedGroup.position.x = (Math.random() - 0.5) * 70;
    seaweedGroup.position.y = -8;
    seaweedGroup.position.z = (Math.random() - 0.5) * 70;
    
    scene.add(seaweedGroup);
    seaweed.push(seaweedGroup);
  }
}

function createFish(): Fish {
  const species = fishSpecies[Math.floor(Math.random() * fishSpecies.length)];
  
  // Crear cuerpo del pez
  const fishGroup = new THREE.Group();
  
  // Cuerpo principal
  const bodyGeometry = new THREE.SphereGeometry(0.5, 12, 8);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: species.color });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.z = 1.5;
  body.castShadow = true;
  fishGroup.add(body);
  
  // Cola
  const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 6);
  const tailMaterial = new THREE.MeshLambertMaterial({ color: species.color });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.z = -1;
  tail.rotation.x = Math.PI / 2;
  tail.castShadow = true;
  fishGroup.add(tail);
  
  // Ojos
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 6);
  const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
  
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(0.2, 0.2, 0.4);
  eye1.castShadow = true;
  fishGroup.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(-0.2, 0.2, 0.4);
  eye2.castShadow = true;
  fishGroup.add(eye2);
  
  // Posición inicial aleatoria
  fishGroup.position.x = (Math.random() - 0.5) * 40;
  fishGroup.position.y = Math.random() * 10 - 2;
  fishGroup.position.z = (Math.random() - 0.5) * 40;
  
  fishGroup.scale.setScalar(species.scale);
  
  // Aplicar castShadow a cada mesh individual en lugar del grupo
  fishGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });
  
  fishGroup.userData = { species: species.name, description: species.description };
  
  scene.add(fishGroup);
  
  return {
    mesh: fishGroup,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.1
    ),
    targetPosition: new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      Math.random() * 8 - 1,
      (Math.random() - 0.5) * 30
    ),
    species: species.name,
    description: species.description,
    speed: Math.random() * 0.02 + 0.01
  };
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
  
  bubbles.push({
    mesh: bubble,
    speed: Math.random() * 0.05 + 0.02,
    life: Math.random() * 200 + 100
  });
  
  bubbleCount++;
}

function setupEvents(): void {
  // Click para alimentar peces
  renderer.domElement.addEventListener('click', onMouseClick);
  
  // Controles de cámara
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  renderer.domElement.addEventListener('wheel', onWheel);
  
  // Resize
  window.addEventListener('resize', onResize);
  
  // Prevenir menú contextual
  document.addEventListener('contextmenu', e => e.preventDefault());
}

function onMouseClick(event: MouseEvent): void {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  // Crear comida en la posición del click
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    const point = intersects[0].point;
    createFood(point);
    foodCount++;
    updateStats();
  }
  
  // Verificar si se hizo click en un pez
  const fishMeshes = fishes.map(f => f.mesh);
  const fishIntersects = raycaster.intersectObjects(fishMeshes, true);
  
  if (fishIntersects.length > 0) {
    const fishMesh = fishIntersects[0].object.parent || fishIntersects[0].object;
    if (fishMesh.userData) {
      showFishInfo(fishMesh.userData.species, fishMesh.userData.description);
    }
  } else {
    hideFishInfo();
  }
}

function createFood(position: THREE.Vector3): void {
  const foodGeometry = new THREE.SphereGeometry(0.1, 8, 6);
  const foodMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  const food = new THREE.Mesh(foodGeometry, foodMaterial);
  
  food.position.copy(position);
  scene.add(food);
  foodParticles.push(food);
  
  // La comida desaparece después de un tiempo
  setTimeout(() => {
    scene.remove(food);
    const index = foodParticles.indexOf(food);
    if (index > -1) {
      foodParticles.splice(index, 1);
    }
  }, 10000);
}

function showFishInfo(species: string, description: string): void {
  const infoDiv = document.getElementById('fish-info')!;
  const nameEl = document.getElementById('fish-name')!;
  const descEl = document.getElementById('fish-description')!;
  
  nameEl.textContent = species;
  descEl.textContent = description;
  infoDiv.style.display = 'block';
}

function hideFishInfo(): void {
  const infoDiv = document.getElementById('fish-info')!;
  infoDiv.style.display = 'none';
}

// Controles de cámara
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
  
  // Actualizar profundidad
  const depth = Math.max(0, camera.position.y * -1 + 5);
  const depthEl = document.getElementById('depth');
  if (depthEl) depthEl.textContent = `${depth.toFixed(1)}m`;
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

// Funciones globales para botones
declare global {
  interface Window {
    addFish: () => void;
    addBubbles: () => void;
    toggleDay: () => void;
  }
}

window.addFish = () => {
  const newFish = createFish();
  fishes.push(newFish);
  fishCount++;
  updateStats();
};

window.addBubbles = () => {
  for (let i = 0; i < 5; i++) {
    createBubble();
  }
  updateStats();
};

window.toggleDay = () => {
  isDay = !isDay;
  
  const ambientLight = scene.userData.ambientLight;
  const directionalLight = scene.userData.directionalLight;
  
  if (ambientLight && directionalLight) {
    if (isDay) {
      // Día
      ambientLight.color.setHex(0x4488bb);
      ambientLight.intensity = 0.6;
      directionalLight.color.setHex(0xffffff);
      directionalLight.intensity = 0.8;
      scene.fog!.color.setHex(0x006994);
    } else {
      // Noche
      ambientLight.color.setHex(0x1a1a2e);
      ambientLight.intensity = 0.3;
      directionalLight.color.setHex(0x4a90e2);
      directionalLight.intensity = 0.4;
      scene.fog!.color.setHex(0x0f1419);
    }
  }
};

function animate(): void {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Animar peces
  fishes.forEach((fish, index) => {
    // Movimiento hacia objetivo
    const distance = fish.mesh.position.distanceTo(fish.targetPosition);
    
    if (distance < 2) {
      // Nuevo objetivo
      fish.targetPosition.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 8 - 1,
        (Math.random() - 0.5) * 30
      );
    }
    
    // Mover hacia el objetivo
    const direction = fish.targetPosition.clone().sub(fish.mesh.position).normalize();
    fish.velocity.lerp(direction.multiplyScalar(fish.speed), 0.02);
    
    // Aplicar velocidad
    fish.mesh.position.add(fish.velocity);
    
    // Rotar para mirar la dirección de movimiento
    fish.mesh.lookAt(fish.mesh.position.clone().add(fish.velocity));
    
    // Movimiento ondulante natural
    fish.mesh.position.y += Math.sin(time * 2 + index) * 0.01;
    fish.mesh.rotation.z = Math.sin(time * 3 + index) * 0.1;
    
    // Buscar comida cercana
    foodParticles.forEach((food, foodIndex) => {
      const foodDistance = fish.mesh.position.distanceTo(food.position);
      if (foodDistance < 1.5) {
        fish.targetPosition.copy(food.position);
        
        // Si está muy cerca, "comer" la comida
        if (foodDistance < 0.5) {
          scene.remove(food);
          foodParticles.splice(foodIndex, 1);
        }
      }
    });
  });

  // Animar burbujas
  bubbles.forEach((bubble, index) => {
    bubble.mesh.position.y += bubble.speed;
    bubble.mesh.position.x += Math.sin(time * 2 + index) * 0.01;
    bubble.life--;
    
    // Si la burbuja llega a la superficie o se acaba su vida
    if (bubble.mesh.position.y > 12 || bubble.life <= 0) {
      scene.remove(bubble.mesh);
      bubbles.splice(index, 1);
      bubbleCount--;
    }
  });

  // Animar algas (movimiento suave)
  seaweed.forEach((weed, index) => {
    weed.children.forEach((blade, bladeIndex) => {
      if (blade instanceof THREE.Mesh) {
        blade.rotation.z = Math.sin(time * 1.5 + index + bladeIndex) * 0.2;
      }
    });
  });

  // Animar corales (pulso suave)
  corals.forEach((coral, index) => {
    const scale = 1 + Math.sin(time * 0.5 + index) * 0.05;
    coral.scale.setScalar(scale);
  });

  // Crear burbujas aleatorias
  if (Math.random() < 0.02) {
    createBubble();
    updateStats();
  }

  renderer.render(scene, camera);
}
