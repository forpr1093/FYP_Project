<!-- Programmer Name: Ang Jia Yue
Program Name: Route
 Description: Route Planning Mobile Application
 First written on: 10 March 2023
 Edited on: 10 April 2023-->
<template>
  <TMap @interface="this.getMapInterface" />
  <bottom-sheet
    :setOrigin="this.setOrigin"
    :setDestination="this.setDestination"
    :recalculateRoute="this.recalculateRoute"
    :toggleEdit="this.toggleEdit"
    :map="this.getMapRef"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TMap from "../components/TMap.vue";
// defineCOmponent to prevent type error of $store
export default defineComponent({
  components: {
    // IonList,
    // IonItem,
    // IonImg,
    // IonThumbnail,
    // IonLabel,
    TMap,
  },
  data() {
    return {
      destinations: null,
    };
  },
  methods: {
    // assign the interface
    getMapInterface(mapInterface) {
      this.mapInterface = mapInterface;
    },

    // cal the recalculateRoute method in Map component
    recalculateRoute(choice) {
      this.mapInterface.recalculateRoute(choice);
    },

    // toggle edit mode
    toggleEdit() {
      this.mapInterface.toggleEdit();
    },

    // add origin
    setOrigin(origin) {
      this.mapInterface.addOrigin(origin.address, origin.coor);
    },
    setDestination(data) {
      this.mapInterface.addDestination(data.address, data.coor);
    },
    // get MapRef
    getMapRef() {
      return this.mapInterface.mapRef();
    },
  },
});
</script>

<style scpoed></style>
