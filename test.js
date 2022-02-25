let tilepieces = {};
(async () => {
  var fileTxt = "test<br><a href='test.html'>test.html</a><br><a href='/'>/</a><a href='/test2.html'>/test2.html</a>";
  var fileTxt2 = "<a href='/index.html'>/index.html</a><br><a href='test2.html'>test2.html</a><br><a href='/'>/</a>";
  var fileTxt3 = "<link href=css/css.css rel=stylesheet><a href='index.html'>index.html</a><br><a href='/test.html'>/test.html</a><script src=/js/js.js></script>";
  var file1 = new File([fileTxt], "index.html", {
    type: "text/html;charset=UTF-8"
  });
  var file2 = new File([fileTxt2], "test.html", {
    type: "text/html;charset=UTF-8"
  });
  var file3 = new Blob([fileTxt3]);
  await storageInterface.create("test");
  tilepieces.currentProject = "test";
  await storageInterface.update("index.html", file1);
  await storageInterface.update("test.html", file2);
  await storageInterface.update("/test2.html", file3);
  await storageInterface.update("/css/css.css",
    "body::before{content: \"/css/css.css say hello!\";}");
  var jsFile = "alert(location.href + ' says hello! From /js/js.js')";
  await storageInterface.update("/js/js.js", jsFile);
  iframe.src = "www/test/index.html";
})();