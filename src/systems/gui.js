import { System } from "ape-ecs";
import { Entity } from "ape-ecs";
import * as dat from 'dat.gui';

class GUISystem extends System{
    init(){
        this.guiEntityQuery = this.world.createQuery().fromAll("GUIcomponent").persist();
        this.gui = new dat.GUI();
    }
    update(currentTick){
        let newGUIEntity = this.guiEntityQuery.refresh().execute({
            updatedComponents: currentTick,
        })
        this.initEntities(newGUIEntity)
    }
    /**
     * 
     * @param {Set<Entity>} entities
     */
    initEntities(entities){
        for (let entity of entities) {
            let components = entity.getComponents("GUIcomponent")
            for (let component of components) {
                this.displayDebugUI(component.list);
            }
        }
    }
    createNestedFolders(path) {
        let currentFolder = this.gui;
        path.forEach((folderName) => {
          if (!currentFolder.__folders[folderName]) {
            currentFolder = currentFolder.addFolder(folderName);
          } else {
            currentFolder = currentFolder.__folders[folderName];
          }
        });
        return currentFolder;
    }
    displayDebugUI(listOfGuiModel) {
        console.log(listOfGuiModel);
        listOfGuiModel.forEach((guiModel) => {
          const folder = this.createNestedFolders(guiModel.path);
          if (guiModel.guiType === "check_box") {
            folder.add(guiModel.target, guiModel.properityName).onChange(guiModel.onchange);
          } else if (guiModel.guiType === "slider") {
            folder
              .add(guiModel.target, guiModel.properityName)
              .max(guiModel.max)
              .min(guiModel.min)
              .name(guiModel.name)
              .step(guiModel.step)
              .onChange(guiModel.onChange);
          } else if (guiModel.guiType === "select") {
            if (!guiModel.target[guiModel.properityName]) {
              guiModel.target[guiModel.properityName] = guiModel.options[0];
            }
            folder
              .add(guiModel.target, guiModel.properityName, guiModel.options)
              .name(guiModel.name)
              .onChange(guiModel.onChange);
          } else if (guiModel.guiType === "color") {
            folder
              .addColor(guiModel.target, guiModel.properityName)
              .name(guiModel.name)
              .onChange(guiModel.onChange);
          }
          else if( guiModel.type==="alaa"){
            
          }
        });
    }
}

export default GUISystem;