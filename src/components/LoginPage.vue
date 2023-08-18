<template>
  <!-- <nav v-if="!isLoginPage">
    <router-link to="/home">Home</router-link>
    <router-link to="/about">About</router-link>
  </nav> -->
  <div class="login-container">
    <div class="center-box">
      <form class="login-form">
        <div class="input-group">
          <label for="username">Username:</label>
          <input v-model="username" type="text" id="username" :disabled="connecting" />
        </div>

        <div class="input-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" :disabled="connecting" />
        </div>

        <button @click.prevent="connect" :disabled="connecting">
          Login
        </button>
        <p v-if="connecting" class="loading-message">Connecting to MQTT. This might take a few seconds. Please wait...</p>
        <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
// import Paho from 'paho-mqtt';

export default {
  // computed: {
  //   isLoginPage() {
  //     return this.$route.name === 'Login';
  //   },
  // },
  data() {
    return {
      // client: null,
      // brokerUrl: 'ws://222.222.119.72:8083/mqtt', // Use ws for non-secure connection
      username: '',
      password: '',
      errorMessage: '', // New data property for error message
      connecting: false, // New data property for connection status
    };
  },
  methods: {
    connect() {
      this.$emit('login-success', { username: this.username, password: this.password });
      //this.connecting = true; // Set connecting to true while connecting

      // const options = {
      //   useSSL: false, // Do not use SSL for non-secure connection
      //   userName: this.username,
      //   password: this.password,
      //   onSuccess: () => {
      //     console.log('Connected to MQTT broker');
      //     this.errorMessage = ''; // Clear any previous error message
      //     this.connecting = false; // Set connecting to false after successful connection
      //     //this.$router.push({ name: 'Main', props: { username: this.username } }); // Use props to pass data
          
      //   },

      //   onFailure: (error) => {
      //     console.error('MQTT connection error:', error.errorMessage);
      //     this.errorMessage = 'Failed to connect. Please check your credentials and try again.'; // Set error message
      //     this.connecting = false; // Set connecting to false after connection attempt
      //   },
      // };

      // this.client = new Paho.Client(this.brokerUrl, 'clientId');
      // this.client.connect(options);
    },
  },
};
</script>

<style>
@import '../CSS/LoginPage.css';
</style>
