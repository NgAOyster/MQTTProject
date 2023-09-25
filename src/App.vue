<template>
  <div id="app">
    <LoginPage v-if="!token" @login-success="setUserCredentials" />
    <SelectionPage v-else-if="token && !selection" :username="loggedInUsername" @select-item="setSelection" @logout="resetCredentials"/>
    <MainPage v-else-if="token && selection" :actualUser = "loggedInActual" :username="loggedInUsername" :password="loggedInPassword" :deviceGroup="deviceGroup" @logout="resetCredentials" @returnBack="cleanSelection"/>
  </div>
</template>

<script>
import LoginPage from './components/LoginPage.vue';
import MainPage from './components/MainPage.vue';
import SelectionPage from './components/SelectionPage.vue';
export default {
  components: {
    LoginPage,
    MainPage,
    SelectionPage,
  },
  data() {
    return {
      loggedInUsername: '',
      loggedInPassword: '',
      loggedInActual: '',
      token: '',
      selection: '',
      deviceGroup: '',
    };
  },
  methods: {
    setUserCredentials(credentials) {
      this.loggedInUsername = credentials.username;
      this.loggedInPassword = credentials.password;
      this.loggedInActual = credentials.actualUser;
      this.token = credentials.token;
    },
    resetCredentials(){
      this.loggedInUsername = '';
      this.loggedInPassword = '';
      this.loggedInActual = '';
      this.token = '';
      this.selection = '';
    },
    setSelection(selection){
      this.selection = true;
      this.deviceGroup = selection.deviceGroup;
    },
    cleanSelection(){
      this.deviceGroup = '';
      this.selection = '';
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
