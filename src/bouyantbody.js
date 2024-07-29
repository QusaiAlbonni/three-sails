import { Component } from "ape-ecs";
import { Vector3, Matrix3 } from "three";
import { EPSILON } from "./utils";


// this component requires a RigidBody component in the same entity
class BuoyantBody extends Component {
    static properties = {
        volume: null,
        mass:   null,
        fluidDensity: 997,
        fluidDensityMultiplier: 1.0,
        voxelizedMesh: null,
        water: null,
        drawVoxels: false,
        minimumWaterDrag: 0.1,
        minimumWaterAngularDrag: 0.1
    }
}

export default BuoyantBody;