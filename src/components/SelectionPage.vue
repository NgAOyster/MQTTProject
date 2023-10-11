<template>
  <div>
    <!-- Navbar Start -->
    <nav class="navbar navbar-expand-lg navbar-light sticky-top mainNav">
      <a class="navbar-brand" href="#" style="color: white; margin-left: 10px;">{{ currentTranslations.title }}</a>
      <!-- Hamburger Menu Icon -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav" style="margin-right: 10px;">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mobileNav">
        <ul class="navbar-nav ms-auto p-2 align-items-center">
          <li class="nav-item">
            <div class="dropdown">
              <button class="btn dropdown-toggle" type="button" id="languageLogoutDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white;">
                <i class="fas fa-user"></i> {{ currentTranslations.welcomeMessage }}, {{ username }}
              </button>
              <div class="dropdown-menu" aria-labelledby="languageLogoutDropdown">
                <a class="dropdown-item" href="#" @click="changeLanguage('english')">English</a>
                <a class="dropdown-item" href="#" @click="changeLanguage('chinese')">中文</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click="confirmLogout()" style="color: black;">{{ currentTranslations.logout }}</a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
    <!-- Navbar End -->
    <br>
    <h3>{{ currentTranslations.selectDevice }}</h3><br>
    <div class="container">
      <div class="row">
        <div v-for="item in equiplist" :key="item.id" class="col-md-6 device-group-space col-sm-12">
          <div class="text-center mt-4">
            <ul class="list-unstyled tree">
              <li>
                <!-- Apply circular container to the button element -->
                <button class="circular-btn" @click="ButtonClick(item.equp_name)">
                  <i class="fas fa-folder icon-with-space"></i> {{ item.equp_name }}
                </button>
                <br><br>
                <div class="row">
                  <div class="col-sm-12">
                    <div class="d-flex flex-wrap">
                      <div class="circular-div mb-4 mr-2 main-device-text">
                        <i class="fas fa-cogs icon-with-space"></i> Device1
                      </div>
                      <div class="circular-div mb-4 mr-2 sub-device-text">
                        <i class="fas fa-cogs icon-with-space"></i> Device2
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie'; // Import the js-cookie library
export default {
  props: {
    username: String,
    token: String,
  },
  computed: {
    currentTranslations() {
      return this.translations[this.selectedLanguage] || {};
    },
    // deviceGroups() {
    //   return [
    //     { name: this.currentTranslations.deviceGroupA, devices: [ { name: this.currentTranslations.mainDeviceA, type: 'main' }, { name: this.currentTranslations.subDeviceA, type: 'sub' } ]},
    //     { name: this.currentTranslations.deviceGroupB, devices: [ { name: this.currentTranslations.mainDeviceB, type: 'main' }, { name: this.currentTranslations.subDeviceB, type: 'sub' } ] },
    //     { name: this.currentTranslations.deviceGroupC, devices: [ { name: this.currentTranslations.mainDeviceC, type: 'main' }, { name: this.currentTranslations.subDeviceC, type: 'sub' } ] },
    //     { name: this.currentTranslations.deviceGroupD, devices: [ { name: this.currentTranslations.mainDeviceD, type: 'main' }, { name: this.currentTranslations.subDeviceD, type: 'sub' } ] },
    //   ];
    // },

    deviceGroups() {
    if (this.equiplist) {
      return this.equiplist.map((item) => {
        return {
          name: item.equp_name,
          devices: [
            { name: this.currentTranslations.mainDeviceA, type: 'main' },
            { name: this.currentTranslations.subDeviceA, type: 'sub' }
          ]
        };
      });
    } else {
      // Fallback if equiplist is not available
      return [];
    }
  },
  },
  data() {
    return {
      selectedLanguage: 'chinese', // Set the default language
      equiplist: null,
      translations: {
        chinese: {
          title: '设备',
          selectDevice: '請选择设备',
          connectingToMQTT: '正在连接MQTT服务器...',
          pleaseWait: '这可能需要几秒钟时间。请稍等...',
          welcomeMessage: '欢迎您',
          logout: '登出',
          deviceGroupA: '设备组A',
          deviceGroupB: '设备组B',
          deviceGroupC: '设备组C',
          deviceGroupD: '设备组D',
          mainDeviceA: '主设备A',
          mainDeviceB: '主设备B',
          mainDeviceC: '主设备C',
          mainDeviceD: '主设备D',
          subDeviceA: '子设备A',
          subDeviceB: '子设备B',
          subDeviceC: '子设备C',
          subDeviceD: '子设备D',
          logoutConfirmation: '确定要登出吗？',
          logoutSuccessMessage: '您已成功登出',
        },
        english: {
          title: 'Device',
          selectDevice: 'Please select a device',
          connectingToMQTT: 'Currently connecting to MQTT Services...',
          pleaseWait: 'This will take a few seconds, please wait for a while...',
          welcomeMessage: 'Welcome',
          logout: 'Logout',
          deviceGroupA: 'DeviceGroupA',
          deviceGroupB: 'DeviceGroupB',
          deviceGroupC: 'DeviceGroupC',
          deviceGroupD: 'DeviceGroupD',
          mainDeviceA: 'MainDeviceA',
          mainDeviceB: 'MainDeviceB',
          mainDeviceC: 'MainDeviceC',
          mainDeviceD: 'MainDeviceD',
          subDeviceA: 'SubDeviceA',
          subDeviceB: 'SubDeviceB',
          subDeviceC: 'SubDeviceC',
          subDeviceD: 'SubDeviceD',
          logoutConfirmation: 'Are you sure you want to logout?',
          logoutSuccessMessage: 'You have successfully logged out',
        },
      },
    };
  },
  methods: {
    changeLanguage(language) {
      this.selectedLanguage = language;
      Cookies.set('selectedLanguage', language); // Update the cookie with the selected language
    },
    confirmLogout() {
      const confirmLogout = window.confirm(this.currentTranslations.logoutConfirmation);
      if (confirmLogout) {
        alert(this.currentTranslations.logoutSuccessMessage);
        this.$emit('logout');
      }
    },
    ButtonClick(groupName) {
    if (this.selectedLanguage === 'chinese') {
    const deviceGroupCN = groupName;
    const Key = this.getKeyByValue(this.translations.chinese, deviceGroupCN);
    const deviceGroupEN = this.translations.english[Key];
    this.$emit('select-item', { deviceGroupCN: deviceGroupCN, deviceGroupEN: deviceGroupEN });
    } else if (this.selectedLanguage === 'english') {
    const deviceGroupEN = groupName;
    const Key = this.getKeyByValue(this.translations.english, deviceGroupEN);
    const deviceGroupCN = this.translations.chinese[Key];
    this.$emit('select-item', { deviceGroupCN: deviceGroupCN, deviceGroupEN: deviceGroupEN });
    }
},

    getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    },
    async getEquipList(){
      const apiUrl = 'http://222.222.119.72:15518/equip/allequiplist'; 
      const token = this.token;
      try {
        // Make the HTTP request to the API
        const response = await axios.get(
          apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        // Check if the response status is OK (200)
        if (response.status === 200) {
          // Assign the data to equiplist
          this.equiplist = response.data;
          console.log('Equipment list: ', this.equiplist);
        } else {
          console.error('无法获取设备列表');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    },
  },
  created() {
    const selectedLanguageCookie = Cookies.get('selectedLanguage');
    
    // Check if the cookie is set and update the selectedLanguage data property
    if (selectedLanguageCookie) {
      this.selectedLanguage = selectedLanguageCookie;
    }

    this.getEquipList();
  }
};
</script>


<style>
@import '../CSS/SelectionPage.css';
</style>
