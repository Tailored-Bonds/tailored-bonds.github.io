import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("globeCanvas"), antialias: true });

// Set up renderer size and tone mapping
const width = window.innerWidth;
const height = window.innerHeight;
renderer.setSize(width, height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.outputEncoding = THREE.sRGBEncoding;

// Set up the camera position
camera.position.set(-1, 0.8, 1.5);  // Look down on Europe
camera.lookAt(new THREE.Vector3(0, 0, 0));  // Center of Earth

// Load the textures
const textureLoader = new THREE.TextureLoader();
const earthDayTexture = textureLoader.load('../assets/8k_earth_daymap.jpg');
const earthNightTexture = textureLoader.load('../assets/8k_earth_nightmap.jpg');
const earthCloudsTexture = textureLoader.load('../assets/cloud_trans.jpg');

// Apply anisotropic filtering for sharper textures
earthDayTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
earthNightTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
earthCloudsTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Create the Earth material with PhongMaterial
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthDayTexture,
    emissiveMap: earthNightTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.4,
    specular: new THREE.Color(0x00000),
    shininess: 300,
    transparent: true,
    opacity: 0.95
});

// Create a high-resolution sphere geometry for the Earth
const geometry = new THREE.SphereGeometry(0.92, 128, 128);
const earth = new THREE.Mesh(geometry, earthMaterial);
scene.add(earth);

// Create a material for the clouds
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: earthCloudsTexture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
});

// Create a high-resolution sphere for the clouds
const cloudGeometry = new THREE.SphereGeometry(0.93, 128, 128);
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Add directional light (Sun simulation)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(-100, 4, 5);  // Move light further away for smaller reflection
scene.add(directionalLight);

// Create the glow using a sprite behind the Earth
const spriteMaterial = new THREE.SpriteMaterial({
    map: textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png'),
    color: 0xffffff,
    transparent: true,
    opacity: 0.1
});

const glowSprite = new THREE.Sprite(spriteMaterial);
glowSprite.scale.set(10, 10, 10);  // Adjust size of the glow
glowSprite.position.set(3, -3, -3);  // Adjust position of the glow
scene.add(glowSprite);

// Animation loop to rotate the Earth and clouds
function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y += 0.0004;
    clouds.rotation.y += 0.00042;

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});