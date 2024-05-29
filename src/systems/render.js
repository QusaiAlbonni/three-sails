import { System } from "ape-ecs";
import { RenderPass } from 'postprocessing';
import Stats from 'three/examples/jsm/libs/stats.module';

class RenderSystem extends System {
    init(clock) {
        this.clock = clock;
        this.meshQuery = this.createQuery().fromAll('MeshFilter').persist();
        this.mainCameraQuery = this.createQuery().fromAll('MainCamera', 'CameraComponent').persist();
        this.renderOptionsQuery = this.createQuery().fromAll('GameRender');
        this.passesQuery = this.createQuery().fromAny('PassComponent').persist();

        this.renderOptionsEntity = this.renderOptionsQuery.execute().values().next().value;
        this.renderOptions = this.renderOptionsEntity.getOne('GameRender');

        this.renderOptions.domElement.appendChild(this.renderOptions.renderer.domElement);
        this.renderer = this.renderOptions.renderer;
        this.composer = this.renderOptions.composer;
        this.mainCamera = this.mainCameraQuery.execute().values().next().value.getOne('CameraComponent').camera
        this.mainScene = this.renderOptions.scene
        this._initRenderPass(this.composer);

        this.stats = new Stats();
        this.renderOptions.domElement.appendChild(this.stats.dom);

        this.renderer.setSize(this.renderOptions.width, this.renderOptions.height);
        this.composer.setSize(this.renderOptions.width, this.renderOptions.height);        
        if (this.renderOptions.resize)
            window.addEventListener('resize', (event) => this._onWindowResize());

    }

    update(currentTick) {
        let meshEntities = this.meshQuery.refresh().execute({
            updatedComponents: this.world.currentTick
        });
        this._addMeshes(meshEntities)
        this.renderer = this.renderOptions.renderer;
        this.composer = this.renderOptions.composer;
        this.mainScene = this.renderOptions.scene;

        if (!this.renderOptions.resize) {
            this.renderer.setSize(this.renderOptions.width, this.renderOptions.height);
            this.composer.setSize(this.renderOptions.width, this.renderOptions.height);
        }
        let passEntities = this.passesQuery.refresh().execute({
            updatedComponents: this.world.currentTick
        });
        this._updatePasses(passEntities)

        this.mainCamera = this.mainCameraQuery.refresh().execute().values().next().value.getOne('CameraComponent').camera;
        this.renderPass.mainCamera = this.mainCamera;
        this.renderPass.mainScene = this.mainScene;

        this.stats.update()
        this.composer.render();
    }

    _addMeshes(entities) {
        entities.forEach(entity => {
            let meshComponents = [...entity.getComponents('MeshFilter')]
            meshComponents.forEach(meshComponent => {
                meshComponent.scene.add(meshComponent.mesh);
            });
        });
    }

    _updatePasses(entities) {
        entities.forEach(entity => {
            let passComponents = [...entity.getComponents('PassComponent')]
            passComponents.forEach(passComponent => {
                this.composer.addPass(passComponent.pass);
            });
        });
    }

    _initRenderPass(composer) {
        this.renderPass = new RenderPass(this.mainScene, this.mainCamera);
        composer.addPass(this.renderPass);
    }

    _onWindowResize() {
        const width = this.renderOptions.resizeContext.innerWidth;
        const height = this.renderOptions.resizeContext.innerHeight;
        const pixelRatio = this.renderOptions.resizeContext.devicePixelRatio;


        this.mainCamera.aspect = width / height;
        this.mainCamera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

    };


};

export default RenderSystem;