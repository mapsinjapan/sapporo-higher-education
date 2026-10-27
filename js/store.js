// Replacement for the Claude Dashboard runtime.
// Handles dashboard state and local data loading.

window.SHStore = (() => {

  const DEFAULT_PARAMS = {
    type: null,
    places: [],
    org: null,
    tier: null,
    closed: false
  };

  let params = {
    ...DEFAULT_PARAMS,
    places: []
  };

  const datasets = {
    schools: {
      status: "loading",
      data: []
    },
    wards: {
      status: "loading",
      data: []
    }
  };

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

  function data(id) {
    return datasets[id] || {
      status: "missing",
      data: []
    };
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

  async function loadSchools() {
    try {
      const response = await fetch("./data/schools.csv");

      if (!response.ok) {
        throw new Error(
          `schools.csv failed to load: ${response.status}`
        );
      }

      const text = await response.text();

      datasets.schools.data = d3.csvParse(text);
      datasets.schools.status = "ok";

      console.log(
        `Loaded ${datasets.schools.data.length} school records`
      );

    } catch (error) {
      console.error("Failed to load school data:", error);

      datasets.schools.status = "error";
      datasets.schools.data = [];
    }
  }

  async function loadWards() {
    try {
      const response = await fetch("./data/wards_v2.json");

      if (!response.ok) {
        throw new Error(
          `wards_v2.json failed to load: ${response.status}`
        );
      }

      datasets.wards.data = await response.json();
      datasets.wards.status = "ok";

      console.log(
        `Loaded ${datasets.wards.data.length} ward records`
      );

    } catch (error) {
      console.error("Failed to load ward data:", error);

      datasets.wards.status = "error";
      datasets.wards.data = [];
    }
  }

  async function loadData() {
    await Promise.all([
      loadSchools(),
      loadWards()
    ]);

    notify();

    console.log("Dashboard data loading complete");
  }

  return {
    params: getParams,
    setParams,
    resetParams,
    data,
    onData,
    loadData
  };

})();
