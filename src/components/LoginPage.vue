<template>
  <div class="login-container">
    <div class="title">
      <h1>{{ $t('loginPage.title') }}</h1>
      <h2>{{ $t('loginPage.company') }}</h2>
    </div>
    <div class="center-box">
      <form class="login-form">
        <div class="input-group">
          <label for="office">{{ $t('loginPage.officeLabel') }}:</label>
          <div class="office-input">
            <input v-model="cpid" type="text" id="cpid" :disabled="connecting" />
            <font-awesome-icon icon="building" class="building-icon" />
          </div>
          <br>
          <label for="username">{{ $t('loginPage.usernameLabel') }}:</label>
          <div class="user-input">
            <input v-model="username" type="text" id="username" :disabled="connecting" />
            <font-awesome-icon icon="user" class="user-icon" />
          </div>
          <br>
          <div class="password-input">
            <label for="password">{{ $t('loginPage.passwordLabel') }}:</label>
            <input v-model="password" type="password" id="password" :disabled="connecting" />
            <font-awesome-icon icon="lock" class="lock-icon" />
          </div>
        </div>

        <button @click.prevent="connect" :disabled="connecting">
          <font-awesome-icon icon="key" class="key-icon" />
          {{ $t('loginPage.loginButton') }}
        </button>
        <br>
        <div class="language-selector">
          <span
            v-for="lang in languages"
            :key="lang.value"
            @click="switchLanguage();"
            :class="{ active: $i18n.locale === lang.value }"
            style="cursor: pointer"
          >
            {{ lang.label }}
          </span>
        </div>
        <p v-if="connecting" class="connecting-message">{{ $t('loginPage.connectingMessage') }}</p>
        <p v-else-if="errorMessage" class="error-message" v-html="errorMessage" style="white-space: pre-line"></p>
      </form>
    </div>
    <div class="bottom">
      <p>&copy; 2023 <a href="http://www.dgmachinery.com/">{{ $t('loginPage.company') }}</a></p>
      <p>{{ $t('loginPage.icpNumber') }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faLock, faUser, faKey, faBuilding } from "@fortawesome/free-solid-svg-icons";

// Add the Font Awesome icons to the library
library.add(faLock, faUser, faKey, faBuilding);

export default {
  emits: ['login-success'],
  components: {
    FontAwesomeIcon,
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale;
    },
  },
  data() {
    return {
      client: null,
      brokerUrl: 'ws://222.222.119.72:8083/mqtt',
      username: '',
      password: '',
      cpid: '',
      connectingMessage: '',
      errorMessage: '',
      connecting: false,
      returnToken: '',
      languages: [
        { value: 'cn', label: '中文' },
        { value: 'en', label: 'English' },
      ],
    };
  },
  methods: {
    async connect() {
      if (this.username === '' || this.password === '' || this.cpid === '') {
        this.errorMessage = this.$i18n.t('loginPage.fillFormError');
        return;
      } else {
        this.connecting = true;
        this.errorMessage = '';
        
        // API still in testing, use this if you want do other page features
        // this.setLanguageCookie();
        // this.$emit('login-success', {
        //   actualUser: "Helloml001",
        //   username: "ml001",
        //   password: "ml001",
        //   token: "e76g4r1w2", // random type, just use in demo of success login
        // });
          
        // Axios way
        try {
          // Make the HTTP request to the API
          const response = await axios.get(
            'http://222.222.119.72:15518/login',
            {
              params: {
                cpid: this.cpid,
                username: this.username,
                password: this.password,
              }
            }
          );

          // Check if the response status is OK (200)
          if (response.status === 200) {
            const token = response.data;
            this.returnToken = token;
            console.log('Token:', token);
            
            this.connecting = false;
            this.errorMessage = '';
            const actualUser = this.cpid + this.username;
            
            this.$emit('login-success', {
              actualUser: actualUser,
              username: this.username,
              password: this.password,
              token: this.returnToken,
            });
          } else {
            console.error('Failed to retrieve token');
            this.errorMessage = this.$i18n.t('loginPage.connectionError');
            this.connecting = false;
          }
        } catch (error) {
          console.error('An error occurred:', error);
          this.errorMessage = this.$i18n.t('loginPage.connectionError');
          this.connecting = false;
        }
      }
    },
    switchLanguage() {
      if (this.currentLanguage === 'en') {
        this.$i18n.locale = 'cn';
      } else {
        this.$i18n.locale = 'en';
      }
    },
  },
};
</script>

<style>
@import '../CSS/LoginPage.css';
</style>