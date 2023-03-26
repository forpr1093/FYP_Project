<template>
  <div id="map"></div>
</template>

<script lang="ts">
import { onMounted, reactive, ref } from "vue";
import { defineComponent } from "vue";
import tt from "@tomtom-international/web-sdk-maps";

export default defineComponent({
  methods: {
    displayMap() {
      const map = tt.map({
        key: '0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6',
        container: "map", // Container ID
        center: [101.71366, 3.1466],
        zoom: 12,
        stylesVisibility:{
          trafficFlow: true,
          trafficIncidents: true,
        }
      });
      map.on("load", () => map.resize());
      map.on("click", (e) => console.log(e.lngLat));
    },
  },
  mounted() {
    this.displayMap();
  },
});
</script>

<style>
#map {
  height: calc(100% - 0px);
  width: 100vw;
}
</style>
