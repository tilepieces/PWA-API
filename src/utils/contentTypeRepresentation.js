const contentTypeRepresentation = (type, response) => {
  if (!type)
    return false;
  return new Promise((res, rej) => {
    if (
      type.startsWith("text/") ||
      type.startsWith("application/xml") ||
      type.startsWith("application/xhtml+xml") ||
      type.startsWith("application/json") ||
      type.indexOf("+xml") > -1
    )
      response.text().then(res, rej);
    else
      response.blob().then(res, rej);
  })
};