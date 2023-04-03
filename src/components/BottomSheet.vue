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
      <ion-searchbar placeholder="Search"></ion-searchbar>
      <ion-item color="none" lines="none">
        <ion-text slot="end">Edit Mode</ion-text>
        <ion-toggle
          slot="end"
          class="toggle"
          @ionChange="this.toggle($event)"
        ></ion-toggle>
      </ion-item>
      <ion-button
        expand="block"
        class="origin-button"
        @click="this.openSearchModal('origin')"
        >Set Origin</ion-button
      >
      <ion-content style="height: 25%" :scroll-events="true">
        <ion-text class="centered-text" v-if="this.destinations.length == 0">{{
          this.origin
        }}</ion-text>
        <ion-text class="centered-text" v-if="this.destinations.length == 0"
          >No destination has been added.</ion-text
        >
        <ion-list v-else>
          <ion-reorder-group
            :disabled="!this.reorderable"
            @ionItemReorder="onReorder($event)"
          >
            <ion-item-sliding v-for="data in destinations" :key="data.id">
              <ion-item>
                <ion-label> test </ion-label>
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

      <ion-button
        v-if="this.reorderable"
        expand="block"
        class="origin-button"
        @click="this.openSearchModal('destination')"
        >Add Destination</ion-button
      >
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
  IonSearchbar,
  IonButton,
  IonToggle,
  IonText,
  modalController,
  IonList,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import SearchModal from "./SearchModal.vue";

export default defineComponent({
  components: {
    IonModal,
    IonContent,
    IonItem,
    IonSearchbar,
    IonReorder,
    IonReorderGroup,
    IonLabel,
    IonButton,
    IonToggle,
    IonText,
    IonList,
  },
  // receive addMarker method from main page
  props: ["setOrigin", "setDestination", "recalculateRoute", "toggleEdit"],

  computed: {
    ...mapGetters({
      destinations: "destinations/destinations",
      origin: "destinations/origin",
    }),
  },
  data() {
    return {
      reorderable: false,
      isModalOpen: false,
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
      this.recalculateRoute();
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
      this.recalculateRoute();
      // destArr = destArr.filter((marker) => marker.id != data.id);
      // remove the draggedItem from the array (1 means 1 item from that index)
    },

    toggle() {
      this.toggleEdit();
      this.reorderable = !this.reorderable;
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
  },
});
</script>
<style>
.origin-button {
  margin: 10px auto;
}
.centered-text {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  width: 100%;
}
</style>
