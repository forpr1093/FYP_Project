<template>
  <!-- <ion-list>
      <ion-item
        v-for="memory in memories"
        :router-link="`/memories/${memory.id}`"
        :key="memory.id"
      >
        <ion-thumbnail slot="start">
          <ion-img :src="memory.image" :alt="memory.title"></ion-img>
        </ion-thumbnail>
        <ion-label>
          {{ memory.title }}
        </ion-label>
      </ion-item>
    </ion-list> -->
  <TMap :origin="this.origin" />
  <bottom-sheet :setOrigin="this.setOrigin" />
</template>

<script lang="ts">
import { IonList, IonItem, IonImg, IonThumbnail, IonLabel } from "@ionic/vue";
import { defineComponent, ref } from "vue";
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
      origin: ref({ lng: 101.71366, lat: 3.1466 }),
      destinations: null,
    };
  },
  methods: {
    setOrigin(lng, lat) {
      this.origin.lng = lng;
      this.origin.lat = lat;
      // this.$emit("onOriginChange", [1.41, 2.12]);
    },
    updateDestinations(destinations) {
      this.destinations = destinations;
      console.log(this.destinations);
    },
  },
  computed: {
    memories() {
      return this.$store.getters.memories;
    },
  },
});
</script>

<style scpoed></style>
