import { Object3D, Vector3, Vector4 } from "three";


function alterThreeObjects(){
   addTransformMethods(Object3D)
}

function addTransformMethods(klass){
    Object.defineProperty(Object3D.prototype, 'forwardVector', {
        get: function() {
          const forward = new Vector3(0, 0, 1);
          forward.applyQuaternion(this.quaternion);
          return forward;
        }
      });

    Object.defineProperty(Object3D.prototype, 'rightVector', {
      get: function() {
        const forward = new Vector3(1, 0, 0);
        forward.applyQuaternion(this.quaternion);
        return forward;
      }
    });

    Object.defineProperty(Object3D.prototype, 'upVector', {
        get: function() {
          const forward = new Vector3(0, 1, 0);
          forward.applyQuaternion(this.quaternion);
          return forward;
        }
      });
}

export default alterThreeObjects