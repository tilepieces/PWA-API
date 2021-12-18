async function deleteComponent(newSettings) {
  await swStart();
  var cache = await caches.open(CACHEFILES);
  var components = await readComponents();
  var component = newSettings.component;
  if (newSettings.local) {
    var projects = await readProjects();
    var project = projects.find(v=>v.name == tilepieces.currentProject);
    var currentComponent = Object.values(components).find(c=>c.path == project.path);
    var isSavedComponent = false;
    if (!project.components || typeof project.components !== "object" || Array.isArray(project.components)) {
        project.components = {}
    }
    var nameSplitted = component.name.split("/")
    var isSubComponent = nameSplitted.length > 1;
    var parentComponentIsCurrentComponent = currentComponent && nameSplitted.length == 2 && nameSplitted[0] == currentComponent.name;
    var deletedPath = null;
    for(var k in project.components)
      if(k == component.name) {
        if(newSettings.deleteFiles){
          deletedPath = await del(project.components[k].path);
        }
        delete project.components[k];
      }
    if(currentComponent){
      for(var ki in currentComponent.components)
        if(ki == component.name) {
          if(newSettings.deleteFiles && !deletedPath){
            await del(currentComponent.components[ki].path);
          }
          delete currentComponent.components[ki];
          isSavedComponent = true;
        }
    }
    if(!isSubComponent) {
      var projectToSave = Object.assign({}, project);
      delete projectToSave.path;
      // update project data
      await update("tilepieces.project.json",
        JSON.stringify(projectToSave, null, 2));
    }
    else if(!parentComponentIsCurrentComponent){ // save the correct record in the parent component
      var openComponents = await readComponentsInner(project.components,project.path + "/");
      var componentsFlat = getComponentsFlat(openComponents);
      var pathToDelete = componentsFlat[nameSplitted.join("/")].path;
      nameSplitted.pop();
      var pathParent = componentsFlat[nameSplitted.join("/")].path;
      if(newSettings.deleteFiles){
        console.log("delete component at path " + newSettings.deleteFiles);
        await del(pathToDelete);
      }
      var getParentJsonPath = pathParent + "/tilepieces.component.json";
      var getParentJsonRaw = await read(getParentJsonPath);
      var getParentJson = JSON.parse(getParentJsonRaw);
      delete getParentJson.components[component.name]
      await update(getParentJsonPath,JSON.stringify(getParentJson,null,2));
    }
    // save the main component json
    var componentToSave = Object.assign({},currentComponent);
    for(var k in componentToSave.components){
      var c = componentToSave.components[k];
      componentToSave.components[k] = {name:c.name,path:c.path}
    }
    delete componentToSave.path;
    isSavedComponent && await cache.put(project.path + "/tilepieces.component.json",
      new Response(new Blob([JSON.stringify(componentToSave,null,2)], {type: 'application/json'})));
  }
  else {
    if (components[component.name]) {
      if(newSettings.deleteFiles){
        await del("",null,component.name);
      }
      delete components[component.name];
    }
    var newComponents = Object.assign({},components);
    for(var k in newComponents){
      var c = newComponents[k];
      newComponents[k] = {name:c.name,path:c.path}
    }
    await cache.put("/components.json",
        new Response(new Blob([JSON.stringify(newComponents)], {type: 'application/json'})));
  }
}