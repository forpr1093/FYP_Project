<!-- Programmer Name: Ang Jia Yue
Program Name: Route
 Description: Route Planning Mobile Application
 First written on: 10 March 2023
 Edited on: 10 April 2023-->
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title> Load Profile </ion-title>
      <ion-buttons slot="end">
        <ion-button @click="this.close">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-text class="centered-text" v-if="this.profiles.length == 0"
      >No profile has been added.</ion-text
    >
    <ion-list v-else>
      <ion-item-sliding v-for="profile in profiles" :key="profile.id">
        <ion-item @click="this.onItemClick(profile)">
          <ion-label :class="profile.name.length >= 50 ? 'play' : 'none'">
            {{ profile.name }}</ion-label
          >
        </ion-item>
        <ion-item-options @ionSwipe="this.onDelete(profile)">
          <ion-item-option
            color="danger"
            expandable
            @click="this.onDelete(profile)"
          >
            Delete
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>
  </ion-content>
</template>

<script lang="ts">
import { Preferences } from "@capacitor/preferences";
import {
  IonHeader,
  IonButton,
  IonToolbar,
  IonTitle,
  modalController,
  IonContent,
  IonList,
} from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonList,
  },
  data() {
    return { profiles: [] };
  },
  methods: {
    close() {
      return modalController.dismiss(null, "close");
    },
    onItemClick(profile) {
      // pass the coordinates while closing the modal
      return modalController.dismiss(profile);
    },
    async onDelete(profile) {
      // remove the profile from the array
      this.profiles = this.profiles.filter((item) => item.id != profile.id);
      // create new json and assign new value
      const json = { profile: this.profiles };

      // store the modified data
      await Preferences.set({
        key: "profile",
        value: JSON.stringify(json),
      });
    },
  },

  async mounted() {
    //  await Preferences.remove({ key: "profile" });
    // load all existing profile
    const { value } = await Preferences.get({ key: "profile" });
    const result: string = value!;
    if (result != null) {
      const data = JSON.parse(result);
      this.profiles = data.profile;
    }
  },
});
</script>
<style>
.play {
  animation: ma 13s 0s infinite linear;
  animation-delay: 2s;
}
@keyframes ma {
  0% {
    margin-left: 0px;
  }
  100% {
    margin-left: -500px;
  }
}
.play:hover {
  animation-play-state: paused;
}
</style>
