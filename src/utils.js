import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const EPSILON = 1e-8

function signedAngle(vectorA, vectorB, axis) {
    const unsignedAngle = vectorA.angleTo(vectorB);

    const cross = new THREE.Vector3().crossVectors(vectorA, vectorB);

    const sign = Math.sign(cross.dot(axis));

    return THREE.MathUtils.radToDeg(unsignedAngle) * sign;
}

function rotateVectorAroundAxis(vector, degree) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(degree));
    const rotatedVector = vector.clone().applyQuaternion(quaternion);
    return rotatedVector;
}

function crossMatrix(vector) {
	var Omega = new THREE.Matrix3();
	Omega.set(
		0, -vector.z, vector.y,
		vector.z, 0, -vector.x,
		-vector.y, vector.x, 0
	);
	return Omega;
}
function reorthogonalize(matrix) {
	const m = matrix.elements;

	const x = new THREE.Vector3(m[0], m[1], m[2]);
	const y = new THREE.Vector3(m[3], m[4], m[5]);
	const z = new THREE.Vector3(m[6], m[7], m[8]);

	x.normalize();

	y.sub(x.clone().multiplyScalar(x.dot(y)));
	y.normalize();

	z.sub(x.clone().multiplyScalar(x.dot(z)));
	z.sub(y.clone().multiplyScalar(y.dot(z)));
	z.normalize();

	m[0] = x.x;
	m[1] = x.y;
	m[2] = x.z;
	m[3] = y.x;
	m[4] = y.y;
	m[5] = y.z;
	m[6] = z.x;
	m[7] = z.y;
	m[8] = z.z;

	matrix.elements = m;
}
async function loadModel(path, scale = { x: 1, y: 1, z: 1 }, position = { x: 0, y: 0, z: 0 }) {
	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();
		loader.load(
			path,
			(gltf) => {
				gltf.scene.scale.set(scale.x, scale.y, scale.z);
				gltf.scene.position.set(position.x, position.y, position.z);
				gltf.scene.traverse((c) => {
					c.castShadow = true;
				});
				resolve(gltf.scene);
			},
			undefined,
			(error) => {
				reject(error);
			}
		);
	});
}

async function loadFbxModel(path, scale = { x: 1, y: 1, z: 1 }, position = { x: 0, y: 0, z: 0 }) {
	return new Promise((resolve, reject) => {
		const loader = new FBXLoader();
		loader.load(
			path,
			(fbx) => {
				fbx.scale.set(scale.x, scale.y, scale.z);
				fbx.position.set(position.x, position.y, position.z)
				fbx.traverse((c) => {
					c.castShadow = true;
				});
				resolve(fbx);
			},
			undefined,
			(error) => {
				reject(error);
			}
		);
	});
}

function isInsideMesh(pos, mesh) {
	let rayCaster = new THREE.Raycaster();
    rayCaster.set(pos, {x: 0, y: -1, z: 0});
    let rayCasterIntersects = rayCaster.intersectObject(mesh, false);
    return rayCasterIntersects.length % 2 === 1; 
}
export { crossMatrix, reorthogonalize, loadModel, loadFbxModel, isInsideMesh, signedAngle, rotateVectorAroundAxis, EPSILON };
