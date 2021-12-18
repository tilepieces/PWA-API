// https://whatwebcando.today/articles/handling-service-worker-updates/
let sw;
function swStart(){
  return new Promise((resolve,reject)=>{
    if(sw)
      return resolve(sw);
    return navigator.serviceWorker.register(
      'sw.js'
    ).then( serviceWorker => {
      window.navigator.serviceWorker.ready
        .then(function(registration) {
        // ensure the case when the updatefound event was missed is also handled
        // by re-invoking the prompt when there's a waiting Service Worker
        if (registration.waiting) {
          invokeServiceWorkerUpdateFlow(registration)
        }
        else if(!navigator.serviceWorker.controller){ // this should be an hard-refresh
          window.location.reload();
          return;
        }
        // detect Service Worker update available and wait for it to become installed
        registration.addEventListener('updatefound', () => {
          if (registration.installing) {
            // wait until the new Service worker is actually installed (ready to take over)
            registration.installing.addEventListener('statechange', () => {
              if (registration.waiting) {
                // if there's an existing controller (previous Service Worker), show the prompt
                if (navigator.serviceWorker.controller) {
                  invokeServiceWorkerUpdateFlow(registration)
                } else {
                  // otherwise it's the first install, nothing to do
                  console.log('Service Worker initialized for the first time')
                }
              }
            })
          }
        });
        let refreshing = false;
        // detect controller change and refresh the page
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            window.location.reload();
            refreshing = true
          }
        });
        console.log('main sw is active:', registration.active);
        sw = registration;
        resolve(sw);
        // TODO to change
        document.body.hidden = false;
        });
    },error => {
      console.error(error);
      reject(error);
    });
  })
}