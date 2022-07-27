import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Object3D, Vector3 } from 'three';
import * as TWEEN from "@tweenjs/tween.js";

/**
 * Arrows
 */
const leftArrow = document.querySelector('#left-arrow');
const rightArrow = document.querySelector('#right-arrow');


/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 300
})

gui.close();

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Baked texture
 */

const bakedTexture = textureLoader.load(
  'welcome-scene-baked.png'
)
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;

// Introduction texture
const introductionBakedTexture = textureLoader.load(
  'introduction-baked.jpg'
)

/**
 * Materials
 */

// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({
    map: bakedTexture,
});

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial(
  { color: 0xFFD32B }
)

// Intruduction Material
const introductionMaterial = new THREE.MeshBasicMaterial({
  map: introductionBakedTexture
})

/**
 * Models
 */

// Welcome Model
gltfLoader.load(
  'welcome-place.glb',
  (gltf: { scene: { children: any[] } }) => {
      const bakedMesh = gltf.scene.children.find(child => child.name === 'baked');
      const poleLight = gltf.scene.children.find(child => child.name === 'poleLight');

      bakedMesh.material = bakedMaterial;
      poleLight.material = poleLightMaterial;
      if (gltf.scene instanceof Object3D) {
        scene.add(gltf.scene)
      }
  }
)

// Introduction Model
gltfLoader.load(
  'introduction.glb',
  (gltf: { scene: { children: any[] } }) => {
    const bakedMesh = gltf.scene.children.find(child => child.name === 'floor');

    bakedMesh.material = introductionMaterial;
    if (gltf.scene instanceof Object3D) {
      gltf.scene.position.x = 9.25;
      scene.add(gltf.scene)
    }
  }
)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
const cameraInitialPosition = new Vector3(0, 2.5, 6);
const cameraIntroductionPosition = new Vector3(9.25, 2.5, 6);

camera.position.set(cameraInitialPosition.x, cameraInitialPosition.y, cameraInitialPosition.z);
scene.add(camera)
// Camera debug
gui.add(camera.position, 'x').min(-20).max(20).step(0.01).name('positionX')
gui.add(camera.position, 'y').min(-20).max(20).step(0.01).name('positionY')
gui.add(camera.position, 'z').min(-20).max(20).step(0.01).name('positionZ')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding;

/**
 * Actions
 */

leftArrow.addEventListener('click', () => {
  const coords = {x: camera.position.x, y: camera.position.y, z: camera.position.z}

  new TWEEN.Tween(coords)
    .to({x: camera.position.x - cameraIntroductionPosition.x}, 300)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      camera.position.set(coords.x, coords.y, coords.z)
      setTimeout(() => {
        controls.target.set(cameraInitialPosition.x, 0, 0);
        controls.update();
      }, 300)
    })
    .start()
})

rightArrow.addEventListener('click', () => {
  const coords = {x: camera.position.x, y: camera.position.y, z: camera.position.z}

  new TWEEN.Tween(coords)
    .to({x: camera.position.x + cameraIntroductionPosition.x}, 300)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      camera.position.set(coords.x, coords.y, coords.z)
      setTimeout(() => {
        controls.target.set(cameraIntroductionPosition.x, 0, 0);
        controls.update();
      }, 300)
    })
    .start()
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)

    TWEEN.update();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()