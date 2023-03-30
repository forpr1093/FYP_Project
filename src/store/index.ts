import { createStore } from "vuex";
import DestinationsModule from "./destinations-module";

const store = createStore({
  modules:{
    destinations:DestinationsModule
  }
});

export default store;
