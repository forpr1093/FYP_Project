<template>
  <ion-list>
    <ion-button expand="block" @click="this.getIncidentDetail()">
      Refresh Incidents
    </ion-button>
    <ion-item v-for="incident in incidents" :key="incident.id" lines="full">
      <IonGrid>
        <IonRow
          style="align-items: center"
          @click="this.moveCamera(incident.details.geometry.coordinates[0], 18)"
        >
          <Ion-thumbnail>
            <img
              src="https://cdn-icons-png.flaticon.com/512/6897/6897039.png"
            />
          </Ion-thumbnail>
          <ion-label style="font-weight: bold; margin-left: 10px">{{
            incident.details.properties?.events[0].description
          }}</ion-label>
        </IonRow>
        <IonRow
          style="padding: 10px 0px 5px 0px"
          @click="this.moveCamera(incident.details.geometry.coordinates[0], 20)"
        >
          <ion-label> from:</ion-label>
          <ion-text style="margin-left: 10px">{{
            incident.details.properties?.from
          }}</ion-text>
        </IonRow>
        <IonRow
          style="padding: 10px 0px 5px 0px"
          @click="
            this.moveCamera(
              incident.details.geometry.coordinates[
                incident.details.geometry.coordinates.length - 1
              ],
              16.5
            )
          "
        >
          <ion-label> to: </ion-label>
          <ion-text style="margin-left: 29px">{{
            incident.details.properties?.to
          }}</ion-text>
        </IonRow>
      </IonGrid>
    </ion-item>
  </ion-list>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  IonGrid,
  IonRow,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonText,
} from "@ionic/vue";
import tt from "@tomtom-international/web-sdk-maps";
import ttapi from "@tomtom-international/web-sdk-services";
import { mapGetters } from "vuex";

export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonThumbnail,
  },
  props: ["map"],
  computed: {
    ...mapGetters({
      destinations: "destinations/destinations",
    }),
  },
  data() {
    return {
      idCounter: 0,
      incidents: [],
    };
  },
  methods: {
    getBoundingBox() {
      const arr = this.destinations;
      // get the most west, south, north, east
      const boundingBox = {
        minLon: Math.min(...arr.map((i) => i.marker.getLngLat().lng)),
        minLat: Math.min(...arr.map((i) => i.marker.getLngLat().lat)),
        maxLon: Math.max(...arr.map((i) => i.marker.getLngLat().lng)),
        maxLat: Math.max(...arr.map((i) => i.marker.getLngLat().lat)),
      };
      return boundingBox;
    },
    getIncidentDetail() {
      const boundingBox = this.getBoundingBox();
      ttapi.services
        .incidentDetailsV5({
          key: "DfWYFPAus04XP2NXuFfqbpyA0h5a0Iu0",
          boundingBox: boundingBox,
          fields:
            "{ incidents { type, geometry { type, coordinates }, properties { id, iconCategory, magnitudeOfDelay, events { description, code, iconCategory }, startTime, endTime, from, to, length, delay, roadNumbers, aci { probabilityOfOccurrence, numberOfReports, lastReportTime } } } }",
        })
        .then((result) => {
          this.incidents = [];
          result.incidents?.map((i) => {
            this.idCounter += 1;
            this.incidents.push({ id: this.idCounter, details: i });
          });
          console.log(this.incidents);
        })
        .catch(() => console.log("error"));
    },
    moveCamera(lngLat, zoom) {
      this.map().easeTo({
        center: lngLat,
        zoom: parseInt(this.map().getZoom()),
      });
      // create a html element for marker
      const tempMarker = document.createElement("div");
      tempMarker.className = "temp-marker";
      if (this.tempMarker) {
        this.tempMarker.remove();
      }
      // use tomtom api to declare new marker
      const marker = new tt.Marker({
        element: tempMarker,
      })
        .setLngLat([lngLat[0], lngLat[1]])
        .addTo(this.map());

      this.tempMarker = marker;
    },
  },
});
</script>
<style>
.temp-marker {
  background-image: url("https://cdn-icons-png.flaticon.com/512/25/25613.png");
  background-size: cover;
  width: 30px;
  height: 30px;
  border-radius: 20px;
}
</style>
