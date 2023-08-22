<template>
  <div class="login-container">
    <div class="center-box">
      <form class="login-form">
        <div class="input-group">
          <label for="username">用户名:</label>
          <input v-model="username" type="text" id="username" :disabled="connecting" />
          <br><br>
          <label for="password">密码:</label>
          <input v-model="password" type="password" id="password" :disabled="connecting" />
        </div>

        <button @click.prevent="connect" :disabled="connecting">
          登入
        </button>
        <p v-if="connecting" class="connecting-message">{{ connectingMessage }}</p>
        <p v-else-if="errorMessage" class="error-message" v-html="errorMessage"></p>
      </form>
    </div>
  </div>
</template>

<script>
import Paho from 'paho-mqtt';

export default {
  data() {
    return {
      client: null,
      brokerUrl: 'ws://222.222.119.72:8083/mqtt',
      username: '',
      password: '',
      connectingMessage: '验证中...',
      errorMessage: '',
      connecting: false,
    };
  },
  methods: {
    connect() {
      if (this.username === '' || this.password === '') {
        this.errorMessage = '请填写用户名和密码';
        return;
      }
      else{
        this.connecting = true;
        this.errorMessage = ''; // Clear any previous error message
        const options = {
          useSSL: false,
          userName: this.username,
          password: this.password,
          onSuccess: () => {
            this.connecting = false;
            this.errorMessage = '';
            this.disconnect(); // Call the disconnect method after successful connection
            this.$emit('login-success', { username: this.username, password: this.password });
          },

          onFailure: (error) => {
            console.error('MQTT connection error:', error.errorMessage);
            this.errorMessage = '登入失败.<br>请检查用户名与密码是否正确.';
            this.connecting = false;
          },
        };

        this.client = new Paho.Client(this.brokerUrl, 'clientId');
        this.client.connect(options);
      }
    },
    disconnect() {
      if (this.client && this.client.isConnected()) {
        this.client.disconnect();
      } 
    },
  },
};
</script>

<style>
@import '../CSS/LoginPage.css';
</style>
