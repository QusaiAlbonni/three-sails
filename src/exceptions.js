class RigidBodyArithmaticError extends Error{
    constructor(message){
        if (message === undefined){
            message = "Arithmatic operation Error when doing RigidBody Calculations in physics system";
        }
        super(message);
        this.name = this.constructor.name;
    }
}

class RigidBodyDataError extends Error{
    constructor(message){
        if (message === undefined){
            message = "Invalid rigidbody values";
        }
        super(message);
        this.name = this.constructor.name;
    }
}

export {RigidBodyArithmaticError, RigidBodyDataError}