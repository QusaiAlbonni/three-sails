import BehaviorSystem from "./behavior";
import PhysicsSystem from "./physics";
import RenderSystem from "./render";
import GUISystem from "./gui";
import BuoyancySystem from "./buoyancy";
import InputSystem from "./input";

const systems = [
    {
        system: RenderSystem,
        group: 'MainSystems'
    },
    {
        system: BehaviorSystem,
        group: 'MainSystems'
    },
    {
        system: PhysicsSystem,
        group: 'FixedSystems'
    },
    {
        system: BuoyancySystem,
        group: 'FixedSystems'
    },
    {
        system: GUISystem,
        group: 'MainSystems'
    },
    {
        system: InputSystem,
        group: 'MainSystems'
    }
]

export default systems;