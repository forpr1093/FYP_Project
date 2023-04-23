//Programmer Name: Ang Jia Yue
//Program Name: Routed
// Description: Route Planning Mobile Application
// First written on: 10 March 2023
//Edited on: 10 April 2023-->

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/core.css";
import "./theme/maps.css";
// import "https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.37.2/maps/maps.css";
import BaseLayout from "./components/base/BaseLayout.vue";
import BottomSheet from "./components/BottomSheet.vue";
import SearchModal from "./components/SearchModal.vue";
import RouteIncident from "./components/RouteIncident.vue";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import store from "./store";

const app = createApp(App).use(IonicVue).use(router).use(store);

app.component("base-layout", BaseLayout);
app.component("bottom-sheet", BottomSheet);
app.component("search-modal", SearchModal);
app.component("route-incident", RouteIncident);

router.isReady().then(() => {
  app
    .use(VueGoogleMaps, {
      load: {
        key: "AIzaSyBiGgsdmA1Z-7BD5npa_-LvOGsJMbjxJpw",
        libraries: "places",
      },
    })
    .mount("#app");
});
