// Replacement for the Claude Dashboard runtime.
//
// Phase 1 goal:
// Preserve the existing dashboard architecture while replacing dash.*
// with ordinary browser JavaScript.

window.SHStore = (() => {

  const DEFAULT_PARAMS = {
    type: null,
    places: [],
    org: null,
    tier: null,
    closed: false
  };

  let params = { ...DEFAULT_PARAMS };

  const listeners = [];

  function getParams() {
    return {
      ...params,
      places: [...params.places]
    };
  }

  function setParams(patch) {
    params = {
      ...params,
      ...patch
    };

    notify();
  }

  function resetParams() {
    params = {
      ...DEFAULT_PARAMS,
      places: []
    };

    notify();
  }

  function onData(callback) {
    if (typeof callback === "function") {
      listeners.push(callback);
    }
  }

  function notify() {
    listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error("Dashboard listener failed:", error);
      }
    });
  }

  return {
    params: getParams,
    setParams,
    resetParams,
    onData
  };

})();
