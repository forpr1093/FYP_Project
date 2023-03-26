import { createStore } from "vuex";
const store = createStore({
  state() {
    return {
      memories: [
        {
          id: "m1",
          image: "https://i.imgur.com/8TvA7hD.jpeg",
          title: "test title",
          description: "this is a testing",
        },
        {
          id: "m2",
          image: "https://i.imgur.com/8TvA7hD.jpeg",
          title: "test title 2",
          description: "this is a testing",
        },
      ],
    };
  },
  getters: {
    memories(state) {
      return state.memories;
    },
    memory(state) {
      return (memoryId: string) => {
        return state.memories.find((memory) => memory.id === memoryId);
      };
    },
  },
});

export default store;
