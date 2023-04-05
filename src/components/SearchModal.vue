<!-- Programmer Name: Ang Jia Yue
Program Name: Route
 Description: Route Planning Mobile Application
 First written on: 10 March 2023
 Edited on: -->
<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end">
        <ion-button @click="this.close">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-item class="searchbar-wrapper" color="none" lines="none">
      <GMapAutocomplete
        placeholder="Search"
        class="auto-complete"
        slot="end"
        @place_changed="this.setPlace"
      >
      </GMapAutocomplete>
    </ion-item>
    <ion-button class="search-button" expand="block" @click="this.setLocation"
      >Set Location</ion-button
    >
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonButton,
  IonItem,
  IonHeader,
  IonToolbar,
  modalController,
} from "@ionic/vue";

export default defineComponent({
  components: {
    IonContent,
    IonButton,
    IonItem,
    IonHeader,
    IonToolbar,
  },
  props: ["choice"],
  data() {
    return {
      isModalOpen: false,
      coordinates: null,
      address: null,
    };
  },
  methods: {
    setPlace(event) {
      const data = event;
      this.coordinates = {
        lng: data.geometry.location.lng(),
        lat: data.geometry.location.lat(),
      };
      this.address = data.formatted_address;
    },
    close() {
      // not passing any coordinates while closing the modal
      return modalController.dismiss(null, "close");
    },
    setLocation() {
      if (this.coordinates != null) {
        // pass the coordinates while closing the modal
        return modalController.dismiss(
          { address: this.address, coor: this.coordinates },
          this.choice
        );
      }
    },
  },
});
</script>

<style>
.searchbar-wrapper {
  justify-content: center;
  padding: 2vh 0px 1vh 0px;
}
.auto-complete {
  z-index: 9999999;
  width: 90%;
  height: 5vh;
  margin-right: 6%;
  border-color: transparent;
  background-color: transparent;
}
.search-button {
  margin-right: 10px;
  margin-left: 10px;
}
</style>
