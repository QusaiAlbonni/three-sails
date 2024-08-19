import { Object3D, Vector3, Quaternion } from "three";


function alterThreeObjects(){
   addTransformMethods()
}

function addTransformMethods(){
    Object.defineProperty(Object3D.prototype, 'forwardVector', {
        get: function() {
          const forward = new Vector3(0, 0, 1);
          let quat = new Quaternion()
          quat = this.getWorldQuaternion(quat)
          forward.applyQuaternion(quat);
          return forward;
        }
      });

    Object.defineProperty(Object3D.prototype, 'rightVector', {
      get: function() {
        const forward = new Vector3(1, 0, 0);
        let quat = new Quaternion()
        quat = this.getWorldQuaternion(quat)
        forward.applyQuaternion(quat);
        return forward;
      }
    });

    Object.defineProperty(Object3D.prototype, 'upVector', {
        get: function() {
          const forward = new Vector3(0, 1, 0);
          let quat = new Quaternion()
          quat = this.getWorldQuaternion(quat)
          forward.applyQuaternion(quat);
          return forward;
        }
      });
}

export default alterThreeObjects