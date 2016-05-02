import * as _ from 'lodash';
import * as THREE from 'three';

import { getScenario } from './scenarios';


// rendering and interface
function render(renderContext) {
    requestAnimationFrame(() => render(renderContext));

    renderContext.camera.lookAt(new THREE.Vector3(0, 0, -1));
    renderContext.camera.position.z = 25;

    renderContext.renderer.render(renderContext.scene, renderContext.camera);
}

function initGraphics({ module, segment, wiring }) {
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const oldElement = document.getElementById('renderer');
    if (oldElement) {
        oldElement.parentNode.removeChild(oldElement);
    }

    const container = document.createElement('div');
    container.setAttribute('id', 'renderer');
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


    const { geometry, material } = module.geometry();

    // render modules
    for (const fieldModule of segment.fieldModules) {
        const moduleInstance = new THREE.LineSegments(geometry, material);
        moduleInstance.position.x = fieldModule.position.x;
        moduleInstance.position.y = fieldModule.position.y;
        scene.add(moduleInstance);
    }

    const wiringMaterial = new THREE.LineBasicMaterial({ color: 0xaaffaa, opacity: 1.0, linewidth: 1.0 });
    const wiringGeometry = new THREE.Geometry();

    // render wiring
    for (const wire of wiring) {
        for (let i = 0; i < wire.length - 1; i++) {
            const pt1 = wire[i].center();
            const pt2 = wire[i + 1].center();
            wiringGeometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, 0));
            wiringGeometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, 0));
        }
    }

    const wiringInstance = new THREE.LineSegments(wiringGeometry, wiringMaterial);
    scene.add(wiringInstance);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    return { scene, camera, renderer };
}

function calculateWiringOrder(fieldSegment, stringSize = 1) {
    // TODO: fill out this function
    const wiring = [];
    for (const module of _.identity(fieldSegment.fieldModules)) {
        wiring.push(module);
    }

    return _.chunk(wiring, stringSize);
}

const { segment, module } = getScenario('three-racks');
const wiring = calculateWiringOrder(segment, 12);

const renderContext = initGraphics({ segment, module, wiring });

render(renderContext);

module.hot.accept(); // eslint-disable-line
