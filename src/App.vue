<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
      <p>count: {{ $store.state.count }}</p>
      <p>getters countPlusTwo: {{ $store.getters.countPlusTwo }}</p>
      <button @click="addCount">增加</button>
      <p>
        <button @click="doAction">
          执行异步方法，将 count 改为异步操作获取的值
        </button>
      </p>
      <p>mapState 辅助函数 {{ count }}、{{ info }}</p>
    </nav>

    <router-view />
  </div>
</template>

<script>
import { mapState } from "@/store/MyVuex.js";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["count", "info"]), // { count: this.$store.state.count}
  },
  methods: {
    addCount() {
      this.$store.commit("add", 2);
    },
    doAction() {
      this.$store.dispatch("getCount", 3);
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
