// destinations module that store array of destinations and handle changes 
// better performances than using props to transfer data between components since watcher is needed
export default {
  // to access properties with dot
  namespaced: true,
  state: {
    destinations: [],
  },
  mutations: {
    UPDATE_DESTINATIONS(state, payload) {
      state.destinations = payload;
    },
  },
  actions: {
    addToDestinations(context, payload) {
      const destinations = payload;
      console.log(payload)
      context.commit("UPDATE_DESTINATIONS", destinations);
    },
  },
  getters: {
    destinations: function (state) {
      return state.destinations;
    },
  },
};
