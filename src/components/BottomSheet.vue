<!-- Programmer Name: Ang Jia Yue
Program Name: Route
 Description: Route Planning Mobile Application
 First written on: 10 March 2023
 Edited on: 10 April 2023-->
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
          :disabled="this.loading"
          @ionChange="this.toggle($event)"
        ></ion-toggle>
      </ion-item>

      <ion-item class="origin-wrapper">
        <ion-text
          class="origin-text"
          slot="start"
          @click="this.onClickItem(this.origin)"
          >{{ this.origin.title }}</ion-text
        >
        <ion-button
          slot="end"
          class="origin-button"
          :disabled="this.loading"
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
              <ion-item-sliding
                :disabled="this.loading"
                v-for="data in destinations"
                :key="data.id"
              >
                <ion-item
                  :class="data.title.length >= 50 ? 'play' : 'none'"
                  @click="() => this.onClickItem(data)"
                >
                  <ion-label :style="{ color: data.color }">
                    {{ data.title }}</ion-label
                  >
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
                <ion-item-options side="end" @ionSwipe="this.onDelete(data)">
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
        <img
          style="width: 30px; height: 30px; margin-right: 10px"
          src="../theme/clock.png"
        />
        <ion-text>{{ this.travelTime }}</ion-text>
        <ion-text slot="end">Optimized Route</ion-text>
        <ion-toggle
          slot="end"
          class="toggle"
          :disabled="this.loading"
          @ionChange="this.toggleOptimized($event)"
        ></ion-toggle>
      </ion-item>
      <ion-item color="none" lines="none">
        <ion-button
          slot="start"
          expand="block"
          size="default"
          :disabled="this.loading"
          @click="this.onSaveProfile()"
          >Save Profile</ion-button
        >
        <ion-button
          :disabled="this.loading"
          slot="end"
          size="default"
          @click="this.showProfileList()"
          >load Profile</ion-button
        >
      </ion-item>
    </ion-content>
  </ion-modal>

  <ion-toast
    :is-open="this.isOpenToast"
    :message="this.toastMessage"
    :duration="2000"
    @didDismiss="() => (this.isOpenToast = false)"
  ></ion-toast>
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
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonToast,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import SearchModal from "./SearchModal.vue";
import ProfileListModal from "./ProfileListModal.vue";
import { Preferences } from "@capacitor/preferences";
import { v4 as uuidv4 } from "uuid";

export default defineComponent({
  components: {
    IonToast,
    IonItemSliding,
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
    IonItemOption,
    IonItemOptions,
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
      loading: false,
      isOpenToast: false,
      toastMessage: "",
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
    // open the search modal for location searching
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

    // save profile
    async onSaveProfile() {
      try {
        // get current origin and destinations coordinates
        const originCoor = this.origin.marker.getLngLat();
        const destinationsData: object[] = [];
        // push destinations coordinates into an array
        this.destinations.map((i) =>
          destinationsData.push({
            address: i.title,
            coor: i.marker.getLngLat(),
          })
        );

        // assign profileNmae based on origin and destination
        const profileName =
          (this.origin.title == "Unknown Origin"
            ? "Unknown Origin"
            : this.origin.title.split(",")[0] +
              this.origin.title.split(",")[1]) +
          " - " +
          this.destinations[this.destinations.length - 1].title.split(",")[0] +
          this.destinations[this.destinations.length - 1].title.split(",")[1];

        // read the existing data in local storage
        let temp: object[] = [];
        const { value } = await Preferences.get({ key: "profile" });
        const result: string = value!;
        if (JSON.parse(result)) {
          console.log("found");
          temp = JSON.parse(result).profile;
        }
        // declare new value
        const newValue = {
          id: uuidv4(),
          name: profileName,
          origin: { address: this.origin.title, coor: originCoor },
          destinations: destinationsData,
        };

        temp.push(newValue);
        // convert into json
        const json = { profile: temp };

        // store the data
        await Preferences.set({
          key: "profile",
          value: JSON.stringify(json),
        });

        this.toastMessage = "Profile Saved";
        this.isOpenToast = true;
      } catch (err) {
        this.toastMessage = "No Destination is added";
        this.isOpenToast = true;
        
      }
    },

    // write promise for delay adding each destinations to have better performances
    setDestinationWithDelay(destination) {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(this.onSetDestination(destination));
        }, 1000)
      );
    },

    async showProfileList() {
      const ProfileList = await modalController.create({
        component: ProfileListModal,
      });
      ProfileList.present();

      // get the selected profile
      const { data } = await ProfileList.onWillDismiss();

      // if there is profile
      if (data != null) {
        this.loading = true;
        // remove all destination marker from map
        this.destinations.map((i) => i.marker.remove());
        this.$store.dispatch("destinations/addToDestinations", []);
        // set origin
        this.onSetOrigin(data.origin);
        // remove all destinations in store

        for (let i = 0; i < data.destinations.length; i++) {
          await this.setDestinationWithDelay(data.destinations[i]);
        }

        this.loading = false;
      }
    },
    // handle the incidents checkbox
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

.play {
  animation: ma 7s 0s infinite linear;
  animation-delay: 3s;
}
@keyframes ma {
  0% {
    margin-left: 0px;
  }
  50% {
    margin-left: -500px;
  }
  50.01% {
    margin-left: 0px;
  }
  100% {
    margin-left: 0px;
  }
}
</style>
