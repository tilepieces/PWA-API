async function getAllFilesInPath(path){
  if(path[0] != "/") // no absolute like http://
    path = "/" + path;
  var cache = await caches.open(CACHEFILES);
  var keys = await cache.keys();
  return keys.filter(v=>{
    var url = v.url.replace(location.origin,"");
    return url.startsWith(path);
  })
}