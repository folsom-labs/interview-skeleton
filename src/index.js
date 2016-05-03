import * as _ from 'lodash';
import * as THREE from 'three';

import { getScenario } from './scenarios';

module.hot.accept();

// rendering and interface
function render(renderContext, location = new THREE.Vector3(0, 0, 15)) {
    requestAnimationFrame(() => render(renderContext));

    renderContext.camera.position.copy(location);
    renderContext.camera.lookAt(location.setZ(0));

    renderContext.renderer.render(renderContext.scene, renderContext.camera);
}

function initGraphics({ moduleModel, segment, wiring }) {
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


    const { geometry, material } = moduleModel.geometry();

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

function calculateWiringOrder(fieldSegment) {
    const sortedModules = [];

    for (const bank of fieldSegment.moduleBanks) {
        sortedModules.push(...bank.fieldModules);
    }

    return sortedModules;
}

function groupModules(sortedModules, stringSize) {
    // TODO: fill out this function
    return _.chunk(sortedModules, stringSize);
}


function logWireDistance(wires) {
    let totalDistance = 0;
    for (const [index, wire] of _.toPairs(wires)) {
        let lastModule = null;
        let wireDistance = 0;
        for (const fieldModule of wire) {
            if (lastModule) {
                wireDistance += fieldModule.position.distance(lastModule.position);
            }
            lastModule = fieldModule;
        }
        console.log(`Wire ${index} Had Distance of `, wireDistance); // eslint-disable-line
        totalDistance += wireDistance;
    }

    console.log("Total Distance of", totalDistance); // eslint-disable-line
}

const MAX_COLUMNS = 10;
const MAX_ROWS = 2;
const MAX_BANKS = 2;

const STRING_LENGTH = 12;

(function main() {
    const { segment, moduleModel } = getScenario({ columns: MAX_COLUMNS, rows: MAX_ROWS, banks: MAX_BANKS });
    const sortedModules = calculateWiringOrder(segment);
    const wiring = groupModules(sortedModules, STRING_LENGTH);
    logWireDistance(wiring);
    const renderContext = initGraphics({ segment, moduleModel, wiring });

    render(renderContext);
}());

