<template>
  <!-- set backdrop dismiss so it wont be dismiss while interacting with the map -->
  <ion-modal
    ref="modal"
    :isOpen="true"
    :initial-breakpoint="0.4"
    :breakpoints="[0.25, 0.4]"
    :backdrop-dismiss="false"
    :backdrop-breakpoint="0.5"
    class="wrapper"
    
  >
    <ion-content class="ion-padding">
      <ion-searchbar placeholder="Search"></ion-searchbar>
      <ion-button
        expand="block"
        class="origin-button"
        @click="this.onSetOrigin()"
        >Add Origin</ion-button
      >
      <ion-reorder-group :disabled="false" @ionItemReorder="onReorder($event)">
        <ion-item-sliding v-for="data in destinations" :key="data.id">
          <ion-item>
            <ion-label>
              {{ data.title }}
            </ion-label>
            <ion-reorder slot="end"></ion-reorder>
          </ion-item>
          <ion-item-options>
            <ion-item-option color="danger" expandable>Delete</ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-reorder-group>
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
  },
  // receive addMarker method from main page
  props: ["setOrigin"],

  computed: {
    ...mapGetters({
      destinations: "destinations/destinations",
    }),
  },
  data() {
    return {};
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

      // handle the complete action of ionic reorder group
      // so it can be dragged again
      event.detail.complete();
    },
    // call the addMarker method from main page
    onSetOrigin() {
      this.setOrigin(101.72366, 3.1466);
    },
  },
});
</script>
<style>
.origin-button {
  margin: 10px auto;
}

</style>
