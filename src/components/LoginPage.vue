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
            <input v-model="cpid" type="text" id="cpid" :disabled="connecting" />
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
//import axios from 'axios';
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
      cpid: '',
      connectingMessage: '',
      errorMessage: '',
      connecting: false,
      returnToken: '',
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
          officeLabel: 'Company ID',
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
    setLanguageCookie() {
      document.cookie = `selectedLanguage=${this.selectedLanguage}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=/`;
    },
    async connect() {
      if (this.username === '' || this.password === '' || this.cpid === '') {
        this.errorMessage = this.translations[this.selectedLanguage].fillFormError;
        return;
      } else {
        this.connecting = true;
        this.errorMessage = '';
        
        // API still in testing, use this if you want do other page features
        this.setLanguageCookie();
        this.$emit('login-success', {
          actualUser: "Helloml001",
          username: "ml001",
          password: "ml001",
          token: "e76g4r1w2", // random type, just use in demo of success login
        });

        // fetch way
        // const url = `http://222.222.119.72:15518/login?cpid=${this.cpid}&username=${this.username}&password=${this.password}`;
        // fetch(url, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // })
        //   .then(response => {
        //     if (!response.ok) {
        //       this.errorMessage = this.translations[this.selectedLanguage].connectionError;
        //       this.connecting = false;
        //     }
        //     return response.json();
        //   })
        //   .then(data => {
        //     const token = data.token;
        //     this.returnToken = token;
        //     console.log('Token:', token);
            
        //     this.connecting = false;
        //     this.errorMessage = '';
        //     this.setLanguageCookie(); // Call setLanguageCookie to set the selectedLanguage cookie
        //     const actualUser = this.cpid + this.username;
            
        //     this.$emit('login-success', {
        //       actualUser: actualUser,
        //       username: this.username,
        //       password: this.password,
        //       token: this.returnToken,
        //     });
        //   })
        //   .catch(error => {
        //     console.error('An error occurred:', error);
        //     this.errorMessage = this.translations[this.selectedLanguage].connectionError;
        //     this.connecting = false;
        //   });
          
        // Axios way
        // try {
        //   // Make the HTTP request to the API
        //   const response = await axios.get(
        //     'http://222.222.119.72:15518/login',
        //     {
        //       params: {
        //         cpid: this.cpid,
        //         username: this.username,
        //         password: this.password,
        //       }
        //     }
        //   );

        //   // Check if the response status is OK (200)
        //   if (response.status === 200) {
        //     // Assuming the response body contains a JSON object with a 'token' field
        //     const token = response.data.token;
        //     this.returnToken = token;
        //     console.log('Token:', token);
            
        //     this.connecting = false;
        //     this.errorMessage = '';
        //     this.setLanguageCookie(); // Call setLanguageCookie to set the selectedLanguage cookie
        //     const actualUser = this.cpid + this.username;
            
        //     this.$emit('login-success', {
        //       actualUser: actualUser,
        //       username: this.username,
        //       password: this.password,
        //       token: this.returnToken,
        //     });
        //   } else {
        //     console.error('Failed to retrieve token');
        //     this.errorMessage = this.translations[this.selectedLanguage].connectionError;
        //     this.connecting = false;
        //   }
        // } catch (error) {
        //   console.error('An error occurred:', error);
        //   this.errorMessage = this.translations[this.selectedLanguage].connectionError;
        //   this.connecting = false;
        // }
      }
    },
  },
};
</script>

<style>
@import '../CSS/LoginPage.css';
</style>