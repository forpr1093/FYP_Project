<template>
  <div id="map"></div>
  <ion-toast
    :is-open="this.isOpenToast"
    message="Proccessing route...Spamming is not encouraged!"
    :duration="1000"
    @didDismiss="() => (this.isOpenToast = false)"
  ></ion-toast>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonToast } from "@ionic/vue";
import tt from "@tomtom-international/web-sdk-maps";
import ttapi from "@tomtom-international/web-sdk-services";
import { mapGetters } from "vuex";

export default defineComponent({
  components: {
    IonToast,
  },
  computed: {
    ...mapGetters({
      destinations: "destinations/destinations",
    }),
  },
  data() {
    return {
      map: null,
      // store the origin coordinate
      coor: null,
      // array of destination
      originMarker: null,
      markerCounter: 1,
      editable: false,
      travelTimeInSecond: 0,
      isOpenToast: false,
    };
  },
  methods: {
    // method to convert to format that the api can read
    convertToPoints(lngLat) {
      return {
        point: {
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        },
      };
    },

    reverseGeocoding(lat, lng) {
      return new Promise((resolve) => {
        fetch(
          `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6&radius=100`
        )
          .then((response) => response.json())
          .then((object) => {
            const address = object.addresses[0].address.freeformAddress;
            resolve(address);
          }).catch(() => console.log("API OVERLIMIT!"));
      });
    },

    async getAddressFromGeocoding(lat, lng) {
      const address = await this.reverseGeocoding(lat, lng);
      return address;
    },

    // add marker to map
    async addOrigin(address, coor) {
      // create a html element for marker
      const element = document.createElement("div");
      element.className = "marker";
      console.log(coor);
      if (this.originMarker) {
        this.originMarker.remove();
      }
      // use tomtom api to declare new marker
      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([coor.lng, coor.lat])
        .addTo(this.map);

      // push new marker into the arr
      let title = address;
      // reverse geocoding when the title is coordinates
      if (typeof title !== "string") {
        title = await this.getAddressFromGeocoding(
          marker.getLngLat().lat,
          marker.getLngLat().lng
        );
      }
      const origin = { title: title, marker: marker };

      this.originMarker = marker;
      // add origin data to store
      this.$store.dispatch("destinations/addOrigin", origin);

      // set to local variable
      this.coor = { lng: coor.lng, lat: coor.lat };

      // move camera
      this.map.easeTo({ center: this.coor, zoom: 15 });

      // recalculate route with the new origin
      this.recalculateRoutes(this.destinations);

      // marker on drag listener
      marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();
        const title = await this.getAddressFromGeocoding(
          lngLat.lat,
          lngLat.lng
        );
        const origin = { title: title, marker: marker };
        // store the modified origin
        this.$store.dispatch("destinations/addOrigin", origin);
        this.coor = { lng: lngLat.lng, lat: lngLat.lat };
        this.recalculateRoutes(this.destinations);
        this.originMarker = marker;
      });
    },

    // add destination marker
    async addDestination(address, lngLat) {
      // new html element to make the marker visible
      const popup = new tt.Popup({ closeButton: false }).setHTML(
        '<b style="color:blue">Speedy\'s pizza</b>'
      );
      const element = document.createElement("div");
      element.className = "destination-marker";

      const marker = new tt.Marker({
        draggable: false,
        element: element,
        anchor: "bottom",
      })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(this.map);
      // push new marker into the arr
      const temp = this.destinations;
      let title = address;
      if (typeof title !== "string") {
        console.log("notstring");
        title = await this.getAddressFromGeocoding(
          marker.getLngLat().lat,
          marker.getLngLat().lng
        );
      }
      temp.push({
        id: this.markerCounter,
        title: title,
        marker: marker,
      });

      //call the action to update the array in store
      this.$store.dispatch("destinations/addToDestinations", temp);

      // increase the markerCounter (id in list)
      this.markerCounter += 1;

      // move the camera to the coordiantes
      this.map.easeTo({ center: lngLat });

      this.recalculateRoutes(this.destinations);
    },

    sortDestinations(markers) {
      const pointsForDestinations = markers.map((item) => {
        // convert all coordinates data to other format
        console.log(markers);
        return this.convertToPoints(item.marker.getLngLat());
      });

      const callParameters = {
        key: "0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6",
        destinations: pointsForDestinations,
        origins: [this.convertToPoints(this.coor)],
      };

      return new Promise((resolve) => {
        ttapi.services
          .matrixRouting(callParameters)
          .then((matrixAPIResults) => {
            const results = matrixAPIResults.matrix[0];
            const resultsArray = results.map((result, index) => {
              return {
                location: markers[index].marker.getLngLat(),
                drivingtime: result.response.routeSummary.travelTimeInSeconds,
              };
            });
            // resultsArray.sort((a, b) => {
            //   return a.drivingtime - b.drivingtime;
            // });
            this.travelTime = 0;
            resultsArray.forEach((i) => (this.travelTime += i.drivingtime));
            console.log(this.travelTime);
            const sortedLocations = resultsArray.map((result) => {
              return result.location;
            });
            resolve(sortedLocations);
          })
          .catch(() => {
            // catch error when there is only marker on map
            // remove all routes
            if (this.map.getLayer("route")) {
              this.map.removeLayer("route");
              this.map.removeSource("route");
            }
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
          "line-width": 4,
        },
      });
    },

    recalculateRoutes(destinations) {
      this.sortDestinations(destinations).then((sorted) => {
        console.log(sorted);
        sorted.unshift(this.coor);

        ttapi.services
          .calculateRoute({
            key: "0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6",
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            this.drawRoute(geoJson, this.map);
          })
          .catch((error) => {
            this.isOpenToast = true;
            this.recalculateRoutes(destinations);
          });
      });
    },

    // toggle edit mode
    toggleEdit() {
      this.editable = !this.editable;
    },

    // create an interface to call the methods from the outside of the component
    emitInterface() {
      this.$emit("interface", {
        recalculateRoute: () => this.recalculateRoutes(this.destinations),
        toggleEdit: () => this.toggleEdit(),
        addOrigin: (address, coordinates) =>
          this.addOrigin(address, coordinates),
        addDestination: (address, coordinates) =>
          this.addDestination(address, coordinates),
        mapRef: () => this.map,
      });
    },

    // display the map
    displayMap() {
      const map = tt.map({
        key: "0jVsF2y6TOdEGvkVUOvaswXIoSIzwiQ6",
        container: "map", // Container ID
        center: [101.6841, 3.1319],
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
        if (this.editable) {
          this.addDestination(e.lngLat, e.lngLat);
        }
      });
    },

    // method to refresh map
    refreshMap() {
      this.originMarker.remove();
      this.recalculateRoutes(this.destinations);
    },
  },
  mounted() {
    this.displayMap();
    this.addOrigin("Unknown Origin", { lat: 3.1319, lng: 101.6841 });
    this.emitInterface();
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
