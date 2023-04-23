//  Programmer Name: Ang Jia Yue
// Program Name: Routed
//  Description: Route Planning Mobile Application
//  First written on: 10 March 2023
//  Edited on: 10 April 2023
// destinations module that store array of destinations and handle changes
// better performances than using props to transfer data between components since watcher is needed
export default {
  // to access properties with dot
  namespaced: true,
  state: {
    origin: null,
    destinations: [],
    estimatedTravelTime: 0,
  },
  mutations: {
    UPDATE_ORIGIN(state, payload) {
      state.origin = payload;
    },
    UPDATE_DESTINATIONS(state, payload) {
      state.destinations = payload;
    },
    UPDATE_TRAVEL_TIME(state, payload) {
      state.estimatedTravelTime = payload;
    },
  },
  actions: {
    addOrigin(context, payload) {
      const origin = payload;
      context.commit("UPDATE_ORIGIN", origin);
    },
    addToDestinations(context, payload) {
      const destinations = payload;
      context.commit("UPDATE_DESTINATIONS", destinations);
    },
    addToTravelTime(context, payload) {
      const travelTime = payload;
      console.log(payload);
      context.commit("UPDATE_TRAVEL_TIME", travelTime);
    },
  },
  // getter
  getters: {
    destinations: function (state) {
      return state.destinations;
    },
    origin: function (state) {
      return state.origin;
    },
    travelTime: function (state) {
      return state.estimatedTravelTime;
    },
  },
};
