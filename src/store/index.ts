//  Programmer Name: Ang Jia Yue
// Program Name: Routed
//  Description: Route Planning Mobile Application
//  First written on: 10 March 2023
//  Edited on: 10 April 2023
import { createStore } from "vuex";
import DestinationsModule from "./destinations-module";

const store = createStore({
  modules: {
    destinations: DestinationsModule,
  },
});

export default store;
