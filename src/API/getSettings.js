async function getSettings(){
  await swStart();
  var settings = {};
  var cache = await caches.open(CACHEFILES);
  var globalSettings = await fetch("/settings.json");
  settings.globalSettings = await globalSettings.json();
  settings.projects = await readProjects();
  var components = await readComponents();
  for(var projectsI = 0;projectsI<settings.projects.length;projectsI++){
    var project = settings.projects[projectsI];
    project.localComponents = {};
    var isComponent = components[project.name];
    project.isComponent = isComponent && Object.assign({},isComponent);
    project.componentPackage = project.isComponent;
    if(project.isComponent) {
      project.components[project.name] = Object.assign({}, isComponent);
      project.components[project.name].path = "";
    }
    project.localComponents = await readComponentsInner(project.components,project.path + "/");
    if(project.isComponent)
      delete project.isComponent.path;
    delete project.path;
    project.components = project.localComponents;
    project.componentsFlat = getComponentsFlat(project.localComponents);
    project.localComponents[project.name] && delete project.localComponents[project.name].path;
  }
  for(var k in components)
    delete components[k].path
  settings.components = components;
  return {settings};
}