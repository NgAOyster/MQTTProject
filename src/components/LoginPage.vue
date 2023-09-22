<template>
  <div class="login-container">
    <div class="title">
      <h1>{{ translations[selectedLanguage].title }}</h1>
      <h2>{{ translations[selectedLanguage].company }}</h2>
    </div>
    <div class="center-box">
      <form class="login-form">
        <div class="input-group">
          <label for="office">{{ translations[selectedLanguage].officeLabel }}:</label>
          <div class="office-input">
            <input v-model="officeID" type="text" id="officeID" :disabled="connecting" />
            <font-awesome-icon icon="building" class="building-icon" />
          </div>
          <br>
          <label for="username">{{ translations[selectedLanguage].usernameLabel }}:</label>
          <div class="user-input">
            <input v-model="username" type="text" id="username" :disabled="connecting" />
            <font-awesome-icon icon="user" class="user-icon" />
          </div>
          <br>
          <div class="password-input">
            <label for="password">{{ translations[selectedLanguage].passwordLabel }}:</label>
            <input v-model="password" type="password" id="password" :disabled="connecting" />
            <font-awesome-icon icon="lock" class="lock-icon" />
          </div>
        </div>

        <button @click.prevent="connect" :disabled="connecting">
          <font-awesome-icon icon="key" class="key-icon" />
          {{ translations[selectedLanguage].loginButton }}
        </button>
        <br>
        <div class="language-selector">
      <span
        v-for="lang in languages"
        :key="lang.value"
        @click="selectedLanguage = lang.value"
        :class="{ active: selectedLanguage === lang.value }"
        style="cursor: pointer"
      >
        {{ lang.label }}
      </span>
    </div>
        <p v-if="connecting" class="connecting-message">{{ translations[selectedLanguage].connectingMessage }}</p>
        <p v-else-if="errorMessage" class="error-message" v-html="errorMessage"></p>
      </form>
    </div>
    <div class="bottom">
      <p>&copy; 2023 <a href="http://www.dgmachinery.com/">{{ translations[selectedLanguage].company }}</a></p>
      <p>{{ translations[selectedLanguage].icpNumber }}</p>
    </div>
  </div>
</template>

<script>
import Paho from 'paho-mqtt';
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faLock, faUser, faKey, faBuilding } from "@fortawesome/free-solid-svg-icons";

// Add the Font Awesome icons to the library
library.add(faLock, faUser, faKey, faBuilding);

export default {
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      client: null,
      brokerUrl: 'ws://222.222.119.72:8083/mqtt',
      username: '',
      password: '',
      officeID: '',
      connectingMessage: '',
      errorMessage: '',
      connecting: false,
      connectionTimeout: 5000,
      randomToken: '',
      selectedLanguage: 'chinese', // Default selected language is Chinese
      languages: [
        { value: 'chinese', label: '中文  ' },
        { value: 'english', label: 'English' },
      ],
      translations: {
        chinese: {
          title: '飞达服务大数据平台',
          company: '©德基机械',
          officeLabel: '公司编号',
          usernameLabel: '用户名',
          passwordLabel:'密码',
          icpNumber: '冀ICP备09032629号-3',
          loginButton: '登入',
          connectingMessage: '验证中...',
          fillFormError: '请填写公司编号, 用户名和密码',
          connectionError: '登入失败.<br>请检查用户名与密码是否正确.',
        },
        english: {
          title: 'Fei Da Services Database System',
          company: '©D&G Machinery',
          officeLabel: 'Office Number',
          usernameLabel: 'Username',
          passwordLabel:'Password',
          icpNumber: '冀ICP备09032629号-3',
          loginButton: 'Login',
          connectingMessage: 'verifying...',
          fillFormError: 'Please input Company Number, Username and Password',
          connectionError: 'Login failed.<br>Please check if Email and Password is correct.',
        },
      },
    };
  },
  methods: {
    connect() {
      if (this.username === '' || this.password === '' || this.officeID === '') {
        this.errorMessage = this.translations[this.selectedLanguage].fillFormError;
        return;
      } else {
        this.connecting = true;
        this.errorMessage = ''; // Clear any previous error message
        const actualUser = this.officeID + '_' + this.username;
        const options = {
          useSSL: false,
          userName: this.username, // may change in the future
          password: this.password,
          onSuccess: () => {
            clearTimeout(connectionTimeoutId);
            this.connecting = false;
            this.errorMessage = '';
            this.disconnect(); // Call the disconnect method after a successful connection
            this.generateRandomToken();
            this.$emit('login-success', {
              actualUser: actualUser,
              username: this.username,
              password: this.password,
              token: this.randomToken,
            });
          },

          onFailure: (error) => {
            clearTimeout(connectionTimeoutId);
            console.error('MQTT connection error:', error.errorMessage);
            this.errorMessage = this.translations[this.selectedLanguage].connectionError;
            this.connecting = false;
          },
        };

        this.client = new Paho.Client(this.brokerUrl, 'clientId');

        // Set up a timeout to handle connection failure
        let connectionTimeoutId = null;
        const handleConnectionTimeout = () => {
          this.client.disconnect();
          this.errorMessage = this.translations[this.selectedLanguage].connectionError;
          this.connecting = false;
        };
        connectionTimeoutId = setTimeout(handleConnectionTimeout, this.connectionTimeout);

        this.client.connect(options);
      }
    },
    disconnect() {
      if (this.client && this.client.isConnected()) {
        this.client.disconnect();
      }
    },
    generateRandomToken() {
      // Generate a random token (you can customize this part)
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const tokenLength = 3;
      let token = '';
      for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
      }
      this.randomToken = token;
    },
  },
};
</script>

<style>
@import '../CSS/LoginPage.css';
</style>