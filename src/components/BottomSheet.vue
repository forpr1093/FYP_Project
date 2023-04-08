<!-- Programmer Name: Ang Jia Yue
Program Name: Route
 Description: Route Planning Mobile Application
 First written on: 10 March 2023
 Edited on: -->
<template>
  <!-- set backdrop dismiss so it wont be dismiss while interacting with the map -->
  <ion-modal
    ref="modal"
    :isOpen="true"
    :initial-breakpoint="0.5"
    :breakpoints="[0.25, 0.4, 0.5, 0.8]"
    :backdrop-dismiss="false"
    :backdrop-breakpoint="0.5"
    class="wrapper"
  >
    <ion-content class="ion-padding">
      <ion-item color="none" lines="none">
        <ion-text>Route Incidents</ion-text>
        <ion-checkbox
          style="margin-left: 10px"
          :checked="false"
          @ionChange="this.onCheckIncidents($event)"
        ></ion-checkbox>

        <ion-text slot="end">Edit Mode</ion-text>
        <ion-toggle
          slot="end"
          class="toggle"
          @ionChange="this.toggle($event)"
        ></ion-toggle>
      </ion-item>

      <ion-item class="origin-wrapper">
        <ion-text class="origin-text" slot="start" @click="this.onClickItem(this.origin)">{{
          this.origin.title
        }}</ion-text>
        <ion-button
          slot="end"
          class="origin-button"
          @click="this.openSearchModal('origin')"
          >Set Origin</ion-button
        >
      </ion-item>

      <ion-content style="height: 20%">
        <route-incident
          v-if="this.showIncident == true"
          :map="this.map"
          style="width: 100%; overflow: hidden"
        >
        </route-incident>
        <ion-content v-else>
          <ion-text class="centered-text" v-if="this.destinations.length == 0"
            >No destination has been added.</ion-text
          >
          <ion-list v-else style="width: 100%">
            <ion-reorder-group
              :disabled="!this.reorderable"
              @ionItemReorder="onReorder($event)"
            >
              <ion-item-sliding v-for="data in destinations" :key="data.id">
                <ion-item @click="() => this.onClickItem(data)">
                  <ion-label> {{ data.title }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
                <ion-item-options @ionSwipe="this.onDelete(data)">
                  <ion-item-option
                    color="danger"
                    expandable
                    @click="this.onDelete(data)"
                  >
                    Delete
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-reorder-group>
          </ion-list>
        </ion-content>
      </ion-content>

      <ion-button
        v-if="this.reorderable"
        expand="block"
        class="origin-button"
        @click="this.openSearchModal('destination')"
        >Add Destination</ion-button
      >
      <ion-item class="origin-wrapper">
        <ion-text slot="start">{{
          `Estimated Travel Time: ${this.travelTime}`
        }}</ion-text>
        <ion-text slot="end">Optimized Route</ion-text>
        <ion-toggle
          slot="end"
          class="toggle"
          @ionChange="this.toggleOptimized($event)"
        ></ion-toggle>
      </ion-item>
      <ion-item color="none" lines="none">
        <ion-button slot="start" expand="block" size="default"
          >Save Profile</ion-button
        >
        <ion-button slot="end" size="default">load Profile</ion-button>
      </ion-item>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts">
import {
  IonReorder,
  IonReorderGroup,
  IonModal,
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonToggle,
  IonText,
  modalController,
  IonList,
  IonCheckbox,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import SearchModal from "./SearchModal.vue";
import axios from "axios";

export default defineComponent({
  components: {
    IonModal,
    IonContent,
    IonItem,
    IonReorder,
    IonReorderGroup,
    IonLabel,
    IonButton,
    IonToggle,
    IonText,
    IonList,
    IonCheckbox,
  },
  // receive addMarker method from main page
  props: [
    "setOrigin",
    "setDestination",
    "recalculateRoute",
    "toggleEdit",
    "map",
  ],

  computed: {
    ...mapGetters({
      destinations: "destinations/destinations",
      origin: "destinations/origin",
      travelTime: "destinations/travelTime",
    }),
  },
  data() {
    return {
      originAddress: null,
      reorderable: false,
      isModalOpen: false,
      optimizedToggle: false,
      slideOption: {
        initialSlide: 1,
      },
      showIncident: false,
    };
  },
  methods: {
    onReorder(event: CustomEvent) {
      const destArr = this.destinations;
      const draggedItem = destArr[event.detail.from];
      // remove the draggedItem from the array (1 means 1 item from that index)
      destArr.splice(event.detail.from, 1);
      // add new item into the new index
      destArr.splice(event.detail.to, 0, draggedItem);
      // call the action to update the array
      this.$store.dispatch("destinations/addToDestinations", destArr);

      // redraw the route
      this.recalculateRoute(this.optimizedToggle);
      // handle the complete action of ionic reorder group
      // so it can be dragged again
      event.detail.complete();
    },
    // call the setOrigin method from main page
    onSetOrigin(coordinates) {
      this.setOrigin(coordinates);
    },
    // call the setDestination method from main page
    onSetDestination(coordinates) {
      this.setDestination(coordinates);
    },
    // on click item
    onClickItem(data) {
      const lngLat = data.marker.getLngLat();
      // move the camera to the location
      this.map().easeTo({ center: lngLat, zoom: 16.5 });
    },
    // fire to delete the destination
    onDelete(data) {
      let destArr = this.destinations;
      // remove the marker from map
      destArr.map((item) => {
        if (item.id == data.id) {
          item.marker.remove();
        }
      });
      // filter out the marker with same id
      destArr = destArr.filter((item) => item.id != data.id);
      // update the array
      this.$store.dispatch("destinations/addToDestinations", destArr);
      // draw new route with the new array
      this.recalculateRoute(this.optimizedToggle);
    },
    // disableSwipeNext() {
    //   console.log(this.$refs.slider.$el.getSwiper());
    // },

    toggle() {
      this.toggleEdit();
      this.reorderable = !this.reorderable;
    },
    toggleOptimized(event) {
      this.optimizedToggle = event.detail.checked;
      this.recalculateRoute(this.optimizedToggle);
    },
    async openSearchModal(choice) {
      const searchModal = await modalController.create({
        component: SearchModal,
        componentProps: {
          choice: choice,
        },
      });
      searchModal.present();

      const { data, role } = await searchModal.onWillDismiss();

      // if its for adding origin
      if (role === "origin") {
        this.onSetOrigin(data);
      }
      // if its for adding new destination
      if (role === "destination") {
        this.onSetDestination(data);
      }
    },
    onCheckIncidents(event: CustomEvent) {
      this.showIncident = event.detail.checked;
    },
  },
});
</script>
<style>
.origin-button {
  margin: 10px auto;
  height: 4vh;
}
.origin-text {
  width: 70%;
  margin: 10px auto;
}
.centered-text {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  width: 100%;
}
.save-button {
  margin: 10px auto;
  height: 6vh;
}
.origin-wrapper {
  margin-bottom: 10px;
}
</style>
