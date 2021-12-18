function invokeServiceWorkerUpdateFlow(registration) {
  // TODO implement your own UI notification element
  if(confirm("New version of the app is available. Refresh now?")) {
    if (registration.waiting) {
      // let waiting Service Worker know it should became active
      registration.waiting.postMessage('SKIP_WAITING')
    }
  }
}