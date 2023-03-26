<template>
  <!--Always wrap everything inside ion-page-->
    <TMap />
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
</template>

<script lang="ts">
import { IonList, IonItem, IonImg, IonThumbnail, IonLabel } from "@ionic/vue";
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
  computed: {
    memories() {
      return this.$store.getters.memories;
    },
  },
});
</script>

<style scpoed></style>
