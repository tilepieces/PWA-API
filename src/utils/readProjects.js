async function readProjects(){
  var cacheFiles = await caches.open(CACHEFILES);
  var projectsCacheFile = await fetch("/projects.json");
  var projects = await projectsCacheFile.json();
  for(var i = 0;i<projects.length;i++){
    var p = projects[i];
    var projectPathJSON = (p.path + "/tilepieces.project.json");
    var projectFile = await cacheFiles.match(new Request(projectPathJSON));
    projects[i] = Object.assign({},await projectFile.json(),p);
  }
  return projects;
}