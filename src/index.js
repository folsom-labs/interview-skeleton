import * as _ from 'lodash';
import * as THREE from 'three';

import { Vector } from './vector';


module.hot.accept();

// solar data structures
class ModuleType {
    constructor(size = new Vector(0, 0)) {
        this.size = size;
    }

    geometry() {
        const size = this.size;
        const material = new THREE.LineBasicMaterial({ color: 0xffaa00, opacity: 1.0, linewidth: 1.0 });
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(size.x, 0, 0));
        geometry.vertices.push(new THREE.Vector3(size.x, 0, 0));
        geometry.vertices.push(new THREE.Vector3(size.x, size.y, 0));
        geometry.vertices.push(new THREE.Vector3(size.x, size.y, 0));
        geometry.vertices.push(new THREE.Vector3(0, size.y, 0));
        geometry.vertices.push(new THREE.Vector3(0, size.y, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));

        return { geometry, material };
    }

}

class FieldModule {
    constructor(type, position = new Vector(0, 0), bankIndex = 0, rowIndex = 0, colIndex = 0) {
        this.position = position;
        this.moduleType = type;
        this.bankIndex = bankIndex;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }

    center() {
        return this.position.add(this.moduleType.size.scale(0.5));
    }
}

class ModuleBank {
    constructor(index, numRows, numCols) {
        this.fieldModules = [];
        this.index = index;
        this.numRows = numRows;
        this.numCols = numCols;
    }
}

class FieldSegment {
    constructor() {
        this.fieldModules = [];
        this.moduleBanks = [];
    }
}

export class Keepout {}

// rendering and interface
function render(renderContext) {
    requestAnimationFrame(() => render(renderContext));

    renderContext.camera.lookAt(new THREE.Vector3(0, 0, -1));
    renderContext.camera.position.z = 25;

    renderContext.renderer.render(renderContext.scene, renderContext.camera);
}

function initGraphics(design) {
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

    const { moduleType, segment } = design;
    const { geometry, material } = moduleType.geometry();

    // render modules
    for (const module of segment.fieldModules) {
        const moduleInstance = new THREE.LineSegments(geometry, material);
        moduleInstance.position.x = module.position.x;
        moduleInstance.position.y = module.position.y;
        scene.add(moduleInstance);
    }

    const wiringMaterial = new THREE.LineBasicMaterial({ color: 0xaaffaa, opacity: 1.0, linewidth: 1.0 });
    const wiringGeometry = new THREE.Geometry();

    // render wiring
    for (const wire of segment.wiring) {
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

// project setup
function addBank(fieldSegment, moduleType, position, index, numHorizontal, numVertical) {
    const newBank = new ModuleBank(index, numVertical, numHorizontal);
    fieldSegment.moduleBanks.push(newBank);

    for (let i = 0; i < numVertical; i++) {
        for (let j = 0; j < numHorizontal; j++) {
            const newModule = new FieldModule(
                moduleType, position.add(new Vector(moduleType.size.x * j, moduleType.size.y * i), index, i, j)
            );
            fieldSegment.fieldModules.push(newModule);
            newBank.fieldModules.push(newModule);
        }
    }
}

function initData({ stringSize = 12 } = {}) {
    const segment = new FieldSegment();
    const moduleType = new ModuleType(new Vector(1.0, 0.5));
    // segment.fieldModules.push(new FieldModule(moduleType, new Vector(0, 0)));
    addBank(segment, moduleType, new Vector(0, 0), 0, 12, 3);
    addBank(segment, moduleType, new Vector(0, 5), 1, 12, 3);
    addBank(segment, moduleType, new Vector(0, 10), 2, 12, 3);

    segment.wiring = calculateWiringOrder(segment, stringSize);

    return { segment, moduleType };
}

function calculateWiringOrder(fieldSegment, stringSize = 1) {
    // TODO: fill out this function
    const wiring = [];
    for (const module of _.identity(fieldSegment.fieldModules)) {
        wiring.push(module);
    }

    return _.chunk(wiring, stringSize);
}

const design = initData();

const renderContext = initGraphics(design);

render(renderContext);
