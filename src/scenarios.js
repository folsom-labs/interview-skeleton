import * as THREE from 'three';

import { Vector } from './vector';

// solar data structures
class Module {
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

class FieldModule {
    constructor(module, position = new Vector(0, 0), bankIndex = 0, rowIndex = 0, colIndex = 0) {
        this.position = position;
        this.module = module;
        this.bankIndex = bankIndex;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }

    center() {
        return this.position.add(this.module.size.scale(0.5));
    }
}

export class Keepout {}


// bassic segment setup
function addBank(fieldSegment, module, position, index, numHorizontal, numVertical) {
    const newBank = new ModuleBank(index, numVertical, numHorizontal);
    fieldSegment.moduleBanks.push(newBank);

    for (let i = 0; i < numVertical; i++) {
        for (let j = 0; j < numHorizontal; j++) {
            const newModule = new FieldModule(
                module, position.add(new Vector(module.size.x * j, module.size.y * i), index, i, j)
            );
            fieldSegment.fieldModules.push(newModule);
            newBank.fieldModules.push(newModule);
        }
    }
}


function createSegment() {
    const segment = new FieldSegment();
    const module = new Module(new Vector(1.0, 0.5));

    addBank(segment, module, new Vector(0, 0), 0, 12, 3);
    addBank(segment, module, new Vector(0, 5), 1, 12, 3);
    addBank(segment, module, new Vector(0, 10), 2, 12, 3);

    return { segment, module };
}



export function getScenario(scenarioName) {

}
