async function search(dir, match = [], rgFile = null, componentName = null, projectName = "") {
  await swStart();
  projectName = componentName ? null : projectName || tilepieces.currentProject;
  dir = dir[0] == "/" ? dir : "/" + dir;
  dir = dir.endsWith("/") ? dir : dir + "/";
  var matches = Array.isArray(match) ? match : [match];
  var files = [], searchResult = [];
  for (var i = 0; i < matches.length; i++) {
    var search = matches[i];
    var path = dir + search;
    var isdir;
    try {
      isdir = await isDir(path, componentName, projectName);
    } catch (e) {
    }
    if (isdir) {
      var newFiles = await getFiles(path, componentName, projectName);
      files = files.concat(newFiles.filter(v => v.type == "file").map(v => v.path));
      continue;
    }
    var fileRead;
    try {
      fileRead = await read(path, componentName, projectName);
    } catch (e) {
    }
    if (fileRead) {
      files.push(path);
      continue;
    }
    var allFiles = await getFiles(dir, componentName, projectName);
    allFiles = allFiles.filter(v => v.type == "file").map(v => v.path);
    for (var ind = 0; ind < allFiles.length; ind++) {
      var file = allFiles[ind];
      if (file[0] == "/") {
        file = file.slice(1)
      }
      var globFile = window.minimatch(file, search);
      if (globFile)
        files.push(file)
    }
  }
  if (rgFile) {
    var rg = new RegExp(rgFile.pattern, rgFile.flags);
    for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
      var filePath = files[fileIndex];
      try {
        var fileContent = await read(filePath, componentName, projectName, true);
      } catch (e) {
        console.error("[search] a path ", filePath, " not found.");
        continue;
      }
      var text = await fileContent.text();
      if (text.match(rg))
        searchResult.push(filePath.startsWith("/") ? filePath.slice(1) : filePath)
    }
  } else searchResult = files.map(v => {
    if (v.startsWith("/"))
      return v.slice(1);
    return v;
  });
  return {searchResult}
}