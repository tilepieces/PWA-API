async function getFiles(path,component,project){
    await swStart();
    var response = [];
    if(path.endsWith("/"))
        path = path.slice(0,path.length-1);
    var readJson = await read(path,component,project);
    var json = readJson.value;
    for(var k in json){
        var value = json[k];
        if(typeof value === "object") {
            var dirPath = path ? path + "/" + k : k;
            response.push({
                name : k,
                path : path ? path + "/" + k : k,
                type : "dir"
            });
            var dirFiles = await getFiles(dirPath,component,project);
            response = response.concat(dirFiles);
        }
        else{
            response.push({
                name : k,
                path : path ? path + "/" + json[k] : json[k],
                type : "file"
            });
        }
    }
    return response;
}