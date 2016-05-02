
import * as _ from 'lodash';
import * as THREE from 'three';

// basic data structures
class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(vec) {
		return new Vector2(this.x + vec.x, this.y + vec.y);
	}

	sub(vec) {
		return new Vector2(this.x - vec.x, this.y - vec.y);
	}

	mulScalar(scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}

	mag() {
		return Math.sqrt(this.magSq());
	}

	magSq() {
		return this.dot(this);
	}

	dot(vec) {
		return this.x * vec.x + this.y * vec.y;
	}
}

// solar data structures
class ModuleType {
	constructor(size = new Vector2(0, 0)) {
		this.size = size;
	}
}

class FieldModule {
	constructor(type, position = new Vector2(0, 0), bankIndex = 0, rowIndex = 0, colIndex = 0) {
		this.position = position;
		this.moduleType = type;
		this.bankIndex = bankIndex;
		this.rowIndex = rowIndex;
		this.colIndex = colIndex;
	}

	center() {
		return this.position.add(this.moduleType.size.mulScalar(0.5));
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

class Keepout {
	constructor() {
	}
}

// rendering and interface
function render() {
	requestAnimationFrame( render );

	renderContext.camera.lookAt(new THREE.Vector3(0, 0, -1));
	renderContext.camera.position.z = 25;

	renderContext.renderer.render(renderContext.scene, renderContext.camera);
};

function onWindowResize() {
	renderContext.camera.aspect = window.innerWidth / window.innerHeight;
	renderContext.camera.updateProjectionMatrix();
	renderContext.renderer.setSize( window.innerWidth, window.innerHeight );
}

function initGraphics() {
	const renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	const container = document.createElement('div');
	document.body.appendChild(container);
	container.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	const testType = design.testType;
	const testSegment = design.testSegment;

	const material = new THREE.LineBasicMaterial( { color: 0xffaa00, opacity: 1.0, linewidth: 1.0 } );
	const geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vector3(0, 0, 0) );
	geometry.vertices.push( new THREE.Vector3(testType.size.x, 0, 0) );
	geometry.vertices.push( new THREE.Vector3(testType.size.x, 0, 0) );
	geometry.vertices.push( new THREE.Vector3(testType.size.x, testType.size.y, 0) );
	geometry.vertices.push( new THREE.Vector3(testType.size.x, testType.size.y, 0) );
	geometry.vertices.push( new THREE.Vector3(0, testType.size.y, 0) );
	geometry.vertices.push( new THREE.Vector3(0, testType.size.y, 0) );
	geometry.vertices.push( new THREE.Vector3(0, 0, 0) );

	// render modules
	for (module of testSegment.fieldModules) {
		const moduleInstance = new THREE.LineSegments( geometry, material );
		moduleInstance.position.x = module.position.x;
		moduleInstance.position.y = module.position.y;
		scene.add(moduleInstance);
	}

	const wiringMaterial = new THREE.LineBasicMaterial( { color: 0xaaffaa, opacity: 1.0, linewidth: 1.0 } );
	const wiringGeometry = new THREE.Geometry();

	// render wiring
	for (var i = 0; i < testSegment.wiring.length - 1; i++) {
		const pt1 = testSegment.wiring[i].center();
		const pt2 = testSegment.wiring[i + 1].center();
		wiringGeometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, 0));
		wiringGeometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, 0));
	}

	const wiringInstance = new THREE.LineSegments( wiringGeometry, wiringMaterial );
	scene.add(wiringInstance);

	window.addEventListener( 'resize', onWindowResize, false );

	return { scene: scene, camera: camera, renderer: renderer };
}

// project setup
function addBank(fieldSegment, moduleType, position, index, numHorizontal, numVertical) {
	const newBank = new ModuleBank(index, numVertical, numHorizontal);
	fieldSegment.moduleBanks.push(newBank);

	for (var i = 0; i < numVertical; i++) {
		for (var j = 0; j < numHorizontal; j++) {
			const newModule = new FieldModule(moduleType, position.add(new Vector2(moduleType.size.x * j, moduleType.size.y * i), index, i, j))
			fieldSegment.fieldModules.push(newModule);
			newBank.fieldModules.push(newModule);
		}
	}

}

function initData() {
	const testSegment = new FieldSegment();
	const testType = new ModuleType(new Vector2(1.0, 0.5));
	//testSegment.fieldModules.push(new FieldModule(testType, new Vector2(0, 0)));
	addBank(testSegment, testType, new Vector2(0, 0), 0, 12, 3);
	addBank(testSegment, testType, new Vector2(0, 5), 1, 12, 3);
	addBank(testSegment, testType, new Vector2(0, 10), 2, 12, 3);

	const stringSize = 10;
	testSegment.wiring = calcuteWiringOrder(testSegment, stringSize);

	return { testSegment: testSegment, testType: testType }
}

function calcuteWiringOrder(fieldSegment, stringSize = 1) {
	// TODO: fill out this function
	var wiring = [];
	for (module of fieldSegment.fieldModules) {
		wiring.push(module);
	}

	return wiring;
}

const design = initData();
const renderContext = initGraphics();

render();

