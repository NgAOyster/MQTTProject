<template>
  <div id="app">
    <LoginPage v-if="!loggedInUsername" @login-success="setUserCredentials" />
    <MainPage v-else :actualUser = "loggedInActual" :username="loggedInUsername" :password="loggedInPassword" @logout="resetCredentials"/>
  </div>
</template>

<script>
import LoginPage from './components/LoginPage.vue';
import MainPage from './components/MainPage.vue';
export default {
  components: {
    LoginPage,
    MainPage,
  },
  data() {
    return {
      loggedInUsername: '',
      loggedInPassword: '',
      loggedInActual: ''
    };
  },
  methods: {
    setUserCredentials(credentials) {
      this.loggedInUsername = credentials.username;
      this.loggedInPassword = credentials.password;
      this.loggedInActual = credentials.actualUser;
    },
    resetCredentials(){
      this.loggedInUsername = '';
      this.loggedInPassword = '';
      this.loggedInActual = '';
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
