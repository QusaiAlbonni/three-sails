import * as THREE from 'three';

function crossMatrix(vector) {
    var Omega = new THREE.Matrix3();
    Omega.set(
        0, -vector.z, vector.y,
        vector.z, 0, -vector.x,
        -vector.y, vector.x, 0
    );
    return Omega
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

    m[0] = x.x; m[1] = x.y; m[2] = x.z;
    m[3] = y.x; m[4] = y.y; m[5] = y.z;
    m[6] = z.x; m[7] = z.y; m[8] = z.z;

    matrix.elements = m;
}

export { crossMatrix, reorthogonalize };