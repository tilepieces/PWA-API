async function setSettings(newSettings) {
  await swStart();
  var cacheApp = await caches.open(CACHEFILES);
  var globalSettings = await fetch("/settings.json");
  var oldSettings = await globalSettings.json();
  var projects = await readProjects();
  var project = projects.find(v => v.name == tilepieces.currentProject);
  if (newSettings.projectSettings) {
    project = Object.assign(project, newSettings.projectSettings);
    await cacheApp.put((project.path + "/tilepieces.project.json").replace(/\/\//g, "/"),
      new Response(new Blob([JSON.stringify(project)], {type: 'application/json'})));
  }
  // this keys must not be updated
  if (newSettings.settings) {
    delete newSettings.settings.workspace;
    delete newSettings.settings.components;
    delete newSettings.settings.trash;
    delete newSettings.settings.applicationName;
    delete newSettings.settings.controllersInterface;
    var settings = Object.assign(oldSettings, newSettings.settings);
    //console.log(settings,oldSettings,newSettings)
    await cacheApp.put("/settings.json",
      new Response(new Blob([JSON.stringify(settings)], {type: 'application/json'})));
  }
  return {}
}