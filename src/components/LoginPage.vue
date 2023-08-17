<template>
  <div>
    <form>
      <label for="username">Username:</label>
      <input v-model="username" type="text" id="username" :disabled="connecting" />

      <label for="password">Password:</label>
      <input v-model="password" type="password" id="password" :disabled="connecting" />

      <button @click.prevent="connect" :disabled="connecting">
        Login
      </button>
      <p v-if="connecting" class="loading-message">Connecting to MQTT. This might take a few seconds. Please wait...</p>
      <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import Paho from 'paho-mqtt';

export default {
  data() {
    return {
      client: null,
      brokerUrl: 'ws://222.222.119.72:8083/mqtt', // Use ws for non-secure connection
      username: '',
      password: '',
      errorMessage: '', // New data property for error message
      connecting: false, // New data property for connection status
    };
  },
  methods: {
    connect() {
      this.connecting = true; // Set connecting to true while connecting

      const options = {
        useSSL: false, // Do not use SSL for non-secure connection
        userName: this.username,
        password: this.password,
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          this.errorMessage = ''; // Clear any previous error message
          this.connecting = false; // Set connecting to false after successful connection
          this.$router.push({ name: 'Main', params: { username: this.username } });
        },

        onFailure: (error) => {
          console.error('MQTT connection error:', error.errorMessage);
          this.errorMessage = 'Failed to connect. Please check your credentials and try again.'; // Set error message
          this.connecting = false; // Set connecting to false after connection attempt
        },
      };

      this.client = new Paho.Client(this.brokerUrl, 'clientId');
      this.client.connect(options);
    },
  },
};
</script>

<style>
form {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
}

input {
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-message {
  font-size: 14px;
  margin-top: 10px;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}
</style>
