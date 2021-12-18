async function create(projectName){
  var refSw = await swStart();
  var cacheFiles = await caches.open(CACHEFILES);
  var projectPath = CACHEPATH + projectName;
  var projects = await fetch("/projects.json");
  var newEntry = {name:projectName,path:projectPath.replace(location.origin + "/","")};
  var projectsBlob;
  var projectJson = await projects.json();
  var pAlreadyPresentIndex = projectJson.findIndex(v=>v.name == projectName);
  if(pAlreadyPresentIndex>-1)
      projectJson.splice(pAlreadyPresentIndex,1);
  projectJson.push(newEntry);
  projectsBlob = new Blob([JSON.stringify(projectJson)], {type: 'application/json'});
  await cacheFiles.put("/projects.json", new Response(projectsBlob));
  var schema = await cacheFiles.match(new Request(projectPath));
  if(schema){
      schema = await schema.json();
  }
  else{
      await cacheFiles.put(projectPath, new Response(new Blob(["{}"], {type: 'application/json'})));
      schema = {};
  }
  tilepieces.currentProject = projectName;
  var innerProjectConfPath = projectPath + "/tilepieces.project.json";
  var innerProjectConf = await cacheFiles.match(new Request(innerProjectConfPath));
  if(!innerProjectConf)
    await update("tilepieces.project.json",
      new Blob([JSON.stringify({name:projectName,components:{}},null,2)],
        {type: 'application/json'}));
  return{
      name : projectName,
      schema
  }
}