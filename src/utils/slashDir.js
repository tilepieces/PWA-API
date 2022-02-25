function slashDir(string) {
  if (string[0] != "/")
    string = "/" + string;
  if (string.endsWith("/"))
    string = string.slice(0, string.length - 1);
  return string;
}