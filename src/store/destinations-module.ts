// destinations module that store array of destinations and handle changes 
// better performances than using props to transfer data between components since watcher is needed
export default {
  // to access properties with dot
  namespaced: true,
  state: {
    origin:null,
    destinations: [],
  },
  mutations: {
    UPDATE_ORIGIN(state, payload) {
      state.origin = payload;
    },
    UPDATE_DESTINATIONS(state, payload) {
      state.destinations = payload;
    },
  },
  actions: {
    addOrigin(context, payload){
      const origin = payload;
      context.commit("UPDATE_ORIGIN", origin);
    },
    addToDestinations(context, payload) {
      const destinations = payload;
      context.commit("UPDATE_DESTINATIONS", destinations);
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
  },
};
