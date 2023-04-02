<template>
  <ion-modal :is-open="isOpen">
    <ion-content>
      <ion-item class="searchbar-wrapper" color="none" lines="none">
        <GMapAutocomplete placeholder="Search" class="auto-complete" slot="end">
        </GMapAutocomplete>
      </ion-item>
      <ion-button class="search-button" expand="block">Search</ion-button>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonModal, IonContent, IonButton, IonItem } from "@ionic/vue";

export default defineComponent({
  components: { IonModal, IonContent, IonButton, IonItem },
  props: ["isOpen"],
  methods: {
    // getAddressData(addressData, placeResultData, id) {
    //   this.address = addressData;
    // },
  },
  // mounted() {
  //   const key = "AIzaSyBiGgsdmA1Z-7BD5npa_-LvOGsJMbjxJpw";
  //   const googleMapScript = document.createElement("SCRIPT");
  //   googleMapScript.setAttribute(
  //     "src",
  //     `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
  //   );
  //   document.head.appendChild(googleMapScript);
  // },
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
