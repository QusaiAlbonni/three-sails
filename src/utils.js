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
    // Extract columns of the matrix
    const xAxis = new THREE.Vector3(matrix.elements[0], matrix.elements[1], matrix.elements[2]);
    const yAxis = new THREE.Vector3(matrix.elements[4], matrix.elements[5], matrix.elements[6]);
    const zAxis = new THREE.Vector3(matrix.elements[8], matrix.elements[9], matrix.elements[10]);

    // Perform Gram-Schmidt process
    xAxis.normalize();
    yAxis.sub(xAxis.clone().multiplyScalar(xAxis.dot(yAxis))).normalize();
    zAxis.crossVectors(xAxis, yAxis).normalize();

    // Set the orthogonalized columns back to the matrix
    matrix.set(
        xAxis.x, yAxis.x, zAxis.x, 0,
        xAxis.y, yAxis.y, zAxis.y, 0,
        xAxis.z, yAxis.z, zAxis.z, 0,
        0, 0, 0, 1
    );
}

export { crossMatrix, reorthogonalize };