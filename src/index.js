window.storageInterface = {
  create,
  delete: del,
  read,
  update,
  copy,
  search,
  getFiles,
  createComponent,
  deleteComponent,
  getSettings,
  setSettings,
  isDir
}
if (window.tilepieces) {
  window.tilepieces.storageInterface = storageInterface;
  window.tilepieces.imageTypeProcess = 0;
}
