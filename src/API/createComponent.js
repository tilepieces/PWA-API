async function createComponent(newSettings, files = []) {
  var refSw = await swStart();
  // get top components, projects and settings
  var cacheFiles = await caches.open(CACHEFILES);
  var components = await readComponents();
  var component = newSettings.component;
  var projects = await readProjects();
  var settingsCacheFile = await fetch("/settings.json");
  var globalSettings = await settingsCacheFile.json();
  console.log("enter ", newSettings, " creation. local -> " + newSettings.local)
  if (newSettings.local) {
    // getting currentProject
    var project = projects.find(p => p.name == tilepieces.currentProject);
    if (!project.components)
      project.components = {};
    component.path = component.path ? slashDir(component.path) :
      ("/" + (project.componentPath || globalSettings.componentPath) + "/" + component.name);
    // save the component json
    var componentPathJSON = component.path + "/tilepieces.component.json";
    var currentJson;
    try {
      var currentJsonRaw = await read(componentPathJSON)
      currentJson = JSON.parse(currentJsonRaw);
    } catch (e) {
    }
    var componentToSave = Object.assign({}, component);
    if (currentJson)
      componentToSave.components = currentJson.components;
    if (!componentToSave.components)
      componentToSave.components = {};
    delete componentToSave.path;
    await update(componentPathJSON,
      new Blob([JSON.stringify(componentToSave, null, 2)]));
    console.log("saving ->", componentPathJSON, componentToSave);
    // now save the 'upper' json: if subcomponent, we save the reference to the component in the parent component. Else, we save in the main project json
    var nameSplitted = component.name.split("/")
    var isSubComponent = nameSplitted.length > 1;
    if (isSubComponent) {
      console.log("is sub component");
      nameSplitted.pop();
      var isComponent = components[project.name];
      if (isComponent) {
        project.components[project.name] = Object.assign({}, isComponent);
        project.components[project.name].path = "";
      }
      var openComponents = await readComponentsInner(project.components, project.path + "/");
      var componentsFlat = getComponentsFlat(openComponents);
      var parent = componentsFlat[nameSplitted.join("/")]
      if (!parent.components ||
        typeof parent.components !== "object" ||
        Array.isArray(parent.components)) {
        parent.components = {}
      }
      parent.components[component.name] =
        {
          name: component.name,
          path: component.path
        };
      for (var k in parent.components) {
        var newObj = {};
        var pc = parent.components[k];
        newObj.path = pc.path.replace(parent.path, "");
        newObj.name = pc.name;
        parent.components[k] = newObj;
      }
      var getParentJsonPath = parent.path
        + "/tilepieces.component.json";
      delete parent.path;
      await update(getParentJsonPath, JSON.stringify(parent, null, 2));
      console.log("saving ->", getParentJsonPath, parent);
    } else {
      console.log("is not sub component");
      if (!project.components ||
        typeof project.components !== "object" ||
        Array.isArray(project.components)) {
        project.components = {}
      }
      project.components[component.name] = {name: component.name, path: component.path}
      delete project.path;
      await update("/tilepieces.project.json",
        JSON.stringify(project, null, 2));
      console.log("saving ->", "/tilepieces.project.json", project);
    }
  } else {
    // if path is not provided, maybe it is current Proj?
    component.path = component.path ||
      projects.find(v => v.name == tilepieces.currentProject).path;
    component.components = components.components || components[component.name]?.components || {};
    components[component.name] = {name: component.name, path: component.path};
    var componentToSave = Object.assign({}, component);
    for (var k in componentToSave.components) {
      var c = componentToSave.components[k];
      componentToSave.components[k] = {name: c.name, path: c.path}
    }
    delete componentToSave.path;
    await cacheFiles.put(component.path + "/tilepieces.component.json",
      new Response(new Blob([JSON.stringify(componentToSave, null, 2)], {type: 'application/json'})));
    var dir = await cacheFiles.match(new Request(component.path));
    var jsonDir = dir ? await dir.json() : {};
    jsonDir["tilepieces.component.json"] = "tilepieces.component.json";
    await cacheFiles.put(component.path,
      new Response(new Blob([JSON.stringify(jsonDir, null, 2)], {type: 'application/json'})));
    var newComponents = Object.assign({}, components);
    for (var k in newComponents) {
      var c = newComponents[k];
      newComponents[k] = {name: c.name, path: c.path}
    }
    await cacheFiles.put("/components.json",
      new Response(new Blob([JSON.stringify(newComponents, null, 2)], {type: 'application/json'})));
  }
  for (var i = 0; i < files.length; i++) {
    var fileData = files[i];
    var componentRootPath = slashDir(component.path);
    if (!newSettings.local) {
      var responseRoot = await cacheFiles.match(new Request(componentRootPath));
      if (!responseRoot)
        await cacheFiles.put(componentRootPath, new Response(new Blob(["{}"], {type: 'application/json'})));
    }
    var newPath = newSettings.local ?
      component.path + slashDir(fileData.path) :
      fileData.path.replace(component.name, "");
    await update(slashDir(newPath), fileData.blob, !newSettings.local ? component.name : null)
  }
  return {};
}