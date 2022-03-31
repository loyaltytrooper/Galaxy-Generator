/*jshint esversion : 6, asi : true */
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/*
 *  Debug Presets
 */
var presets = {};

/*
 * Parameters from all the objects
 */
const parameters = {
    count  : 24000,
    size : 0.005,
    radius : 3.5,
    branches : 5,
    spin : 1.68,
    randomness : 1.336,
    randomnessPower : 5.6,
    insideColor : '#a45032',
    outsideColor : '#1b3984',

    savePreset() {
        presets = gui.save();
        loadButton.enable();
    },
    loadPreset() {
        gui.load(presets);
    }
}

/*
 * Debug Panel
 */
gui.add(parameters, 'count').min(100).max(300000).name('Particle No.').onFinishChange(generateGalaxy).step(100);
gui.add(parameters, 'size').min(0.001).max(1).name('Particle size').onFinishChange(generateGalaxy).step(0.001);
gui.add(parameters, 'radius').min(0.01).max(20).name('Galaxy Radius').onFinishChange(generateGalaxy).step(0.01);
gui.add(parameters, 'branches').min(3).max(10).name('Galaxy Branches').onFinishChange(generateGalaxy).step(1);
gui.add(parameters, 'spin').min(-5).max(5).name('Branch Spin').onFinishChange(generateGalaxy).step(0.01);
gui.add(parameters, 'spin').min(0).max(2).name('Branch Randomness').onFinishChange(generateGalaxy).step(0.001);
gui.add(parameters, 'randomnessPower').min(1).max(10).name('Branch Randomness Power').onFinishChange(generateGalaxy).step(0.1);
gui.addColor(parameters, 'insideColor').name('Core Color').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').name('Trail Color').onFinishChange(generateGalaxy);

gui.add(parameters, 'savePreset');
const loadButton = gui.add(parameters, 'loadPreset').disable();



/**
 * Generate Galaxy Function
 */
var arbitaryGeometry = null, particleMaterial = null, particles = null;

function generateGalaxy()
{
    /*
     *  Generate 1000 particles
     */
     if(particles != null)
     {
         arbitaryGeometry.dispose();
         particleMaterial.dispose();
         scene.remove(particles);
     }

    const vertex = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const coreColor = new THREE.Color(parameters.insideColor);
    const trailColor = new THREE.Color(parameters.outsideColor);

    for(let i = 0; i < parameters.count; i++)
    {
        const radius = Math.random() * parameters.radius
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
        const spinAngle = radius * parameters.spin;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        vertex[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        vertex[(i * 3) + 1] = randomY;
        vertex[(i * 3) + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

// vertex[(i * 3) + 1] = ((Math.random() - 0.5) * parameters.radius);  // To generate a cube environment
// vertex[(i * 3) + 2] = ((Math.random() - 0.5) * parameters.radius);  // To generate a cube environment

        const mixedColor = coreColor.clone();
        mixedColor.lerp(trailColor, radius / parameters.radius)

        colors[i * 3] = mixedColor.r;
        colors[(i * 3) + 1] = mixedColor.g;
        colors[(i * 3) + 2] = mixedColor.b;
    }

    arbitaryGeometry = new THREE.BufferGeometry();
    arbitaryGeometry.setAttribute('position', new THREE.BufferAttribute(vertex, 3));
    arbitaryGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

/*
 * material for particles
 */
    particleMaterial = new THREE.PointsMaterial({
        // color : 0xff,    // if using other colors disable this
        size : parameters.size,
        sizeAttenuation : true,
        // depthWrite : false,
        blending : THREE.AdditiveBlending,
        vertexColors : true,
    });

    particles = new THREE.Points(arbitaryGeometry, particleMaterial)
    scene.add(particles)

    console.log('generate galaxy called');
}

generateGalaxy();

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
