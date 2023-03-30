<template>
  <div id="map"></div>
</template>

<script lang="ts">
import { onMounted, reactive, ref } from "vue";
import { defineComponent } from "vue";
import tt from "@tomtom-international/web-sdk-maps";
import ttapi from "@tomtom-international/web-sdk-services";
import { tsTypeParameterInstantiation } from "@babel/types";

export default defineComponent({
  props: ["origin"],
  data() {
    return {
      map: null,
      // store the origin coordinate
      coor: this.origin,
      // array of destination
      originMarker: [],
      destination: [],
      markers: this.$store.getters["destinations/destinations"],
      markerCounter: 1,
    };
  },
  watch: {
    // watcher that trigger when value of origin props is changed
    origin: {
      handler(newVal, oldVal) {
        this.coor = newVal;
        this.refreshMap();
      },
      deep: true,
    },
  },
  methods: {
    convertToPoints(lngLat) {
      return {
        point: {
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        },
      };
    },

    // add marker to map
    addOrigin() {
      // create a html element for marker
      const element = document.createElement("div");
      element.className = "marker";
      // use tomtom api to declare new marker
      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([this.coor.lng, this.coor.lat])
        .addTo(this.map);

      this.originMarker = marker;
      // this.recalculateRoutes();

      // marker on drag listener
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        // store the modified coordinate
        this.coor = { lng: lngLat.lng, lat: lngLat.lat };
        this.recalculateRoutes();
        this.originMarker = marker;
      });
    },

    // add destination marker
    addDestination(lngLat) {
      // new html element to make the marker visible
      const popup = new tt.Popup({ offset: 30 }).setText("drag to remove");
      const element = document.createElement("div");
      element.className = "destination-marker";

      const marker = new tt.Marker({
        draggable: true,
        element: element,
        anchor: "bottom",
      })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(this.map);
      this.markers.push({
        id: this.markerCounter,
        title: marker.getLngLat(),
        marker: marker,
      });
      //call the action to update the array in store
      this.$store.dispatch("destinations/addToDestinations", this.markers);

      // increase the markerCounter (id in list)
      this.markerCounter += 1;

      this.recalculateRoutes();
    },

    sortDestinations(location) {
      const pointsForDestinations = location.map((destination) => {
        return this.convertToPoints(destination);
      });

      const callParameters = {
        key: "0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6",
        destinations: pointsForDestinations,
        // origins: [this.convertToPoints({ lng: 101.71366, lat: 3.1466 })],
        origins: [this.convertToPoints(this.coor)],
      };

      return new Promise((resolve, reject) => {
        ttapi.services
          .matrixRouting(callParameters)
          .then((matrixAPIResults) => {
            const results = matrixAPIResults.matrix[0];
            const resultsArray = results.map((result, index) => {
              return {
                location: location[index],
                drivingtime: result.response.routeSummary.travelTimeInSeconds,
              };
            });
            resultsArray.sort((a, b) => {
              return a.drivingtime - b.drivingtime;
            });
            const sortedLocations = resultsArray.map((result) => {
              return result.location;
            });
            resolve(sortedLocations);
          });
      });
    },

    drawRoute(geoJson, map) {
      if (map.getLayer("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: geoJson,
        },
        paint: {
          "line-color": "cyan",
          "line-width": 6,
        },
      });
    },

    recalculateRoutes() {
      this.sortDestinations(this.destination).then((sorted) => {
        // sorted.unshift({ lng: 101.71366, lat: 3.1466 });
        sorted.unshift(this.coor);

        ttapi.services
          .calculateRoute({
            key: "0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6",
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            this.drawRoute(geoJson, this.map);
          });
      });
    },

    // display the map
    displayMap() {
      const map = tt.map({
        key: "0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6",
        container: "map", // Container ID
        center: [this.coor.lng, this.coor.lat],
        zoom: 12,
        stylesVisibility: {
          trafficFlow: true,
          trafficIncidents: true,
        },
      });
      // set map object references
      this.map = Object.freeze(map);
      // when the map is loaded, resize it based on the screen size
      map.on("load", () => map.resize());
      // when the map is clicked, add marker
      map.on("click", (e) => {
        this.destination.push(e.lngLat);
        this.addDestination(e.lngLat);
      });
    },

    // method to refresh map
    refreshMap() {
      this.originMarker.remove();
      this.addOrigin();
      this.recalculateRoutes();
    },
  },
  mounted() {
    this.displayMap();
    this.addOrigin();
  },
});
</script>

<style>
#map {
  height: calc(100% - 0px);
  width: 100vw;
}
.marker {
  background-size: cover;
  width: 22px;
  height: 22px;
  background-color: yellow;
  border-radius: 20px;
  border: solid 3px darkblue;
}

.destination-marker {
  background-image: url("https://cdn-icons-png.flaticon.com/512/447/447031.png");
  background-size: cover;
  width: 20px;
  height: 20px;
  background-color: yellow;
  border-radius: 20px;
  border: solid 3px darkblue;
}
</style>
