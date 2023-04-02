<template>
  <!-- set backdrop dismiss so it wont be dismiss while interacting with the map -->
  <ion-modal
    ref="modal"
    :isOpen="true"
    :initial-breakpoint="0.4"
    :breakpoints="[0.25, 0.4, 0.5]"
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
        @click="() => (this.isModalOpen = true)"
        >Add Origin</ion-button
      >
      <ion-reorder-group
        :disabled="!this.reorderable"
        @ionItemReorder="onReorder($event)"
      >
        <ion-item-sliding v-for="data in destinations" :key="data.id">
          <ion-item>
            <ion-label>
              test
            </ion-label>
            <ion-reorder slot="end"></ion-reorder>
          </ion-item>
          <ion-item-options @ionSwipe="this.onDelete(data)">
            <ion-item-option
              color="danger"
              expandable
              @click="this.onDelete($event)"
              >Delete</ion-item-option
            >
          </ion-item-options>
        </ion-item-sliding>
      </ion-reorder-group>
    </ion-content>
  </ion-modal>
  <search-modal :isOpen="this.isModalOpen"></search-modal>
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
} from "@ionic/vue";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

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
  },
  // receive addMarker method from main page
  props: ["setOrigin", "recalculateRoute", "toggleEdit"],

  computed: {
    ...mapGetters({
      destinations: "destinations/destinations",
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
    // call the addMarker method from main page
    onSetOrigin() {
      this.setOrigin(101.72366, 3.1466);
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
  },
});
</script>
<style>
.origin-button {
  margin: 10px auto;
}
</style>
