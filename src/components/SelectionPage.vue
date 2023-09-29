<template>
  <div>
    <!-- Navbar Start -->
    <nav class="navbar navbar-expand-lg navbar-light sticky-top mainNav" style="padding: 10px;">
      <a class="navbar-brand" href="#" style="color: white;">{{ currentTranslations.temperature }}</a>
      <!-- Hamburger Menu Icon -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mobileNav">
        <ul class="navbar-nav ms-auto p-8 align-items-center">
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
        <div v-for="(deviceGroup, index) in deviceGroups" :key="index" class="col-md-6 device-group-space">
          <div class="text-center mt-4">
            <ul class="list-unstyled tree">
              <li>
                <!-- Apply circular container to the button element -->
                <button class="circular-btn" @click="ButtonClick(deviceGroup.name)">
                  <i class="fas fa-folder icon-with-space"></i> {{ deviceGroup.name }}
                </button>
                <br><br>
                <div class="row">
                  <div class="col-md-6" v-for="(device, deviceIndex) in deviceGroup.devices" :key="deviceIndex">
                    <!-- Apply circular container to the div element -->
                    <div class="circular-div mb-4">
                      <i class="fas fa-cogs icon-with-space"></i> {{ device }}
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
import Cookies from 'js-cookie'; // Import the js-cookie library
export default {
  props: {
    username: String,
  },
  computed: {
    currentTranslations() {
      return this.translations[this.selectedLanguage] || {};
    },
    deviceGroups() {
      return [
        { name: this.currentTranslations.deviceGroupA, devices: [this.currentTranslations.mainDeviceA, this.currentTranslations.subDeviceA] },
        { name: this.currentTranslations.deviceGroupB, devices: [this.currentTranslations.mainDeviceB, this.currentTranslations.subDeviceB] },
        { name: this.currentTranslations.deviceGroupC, devices: [this.currentTranslations.mainDeviceC, this.currentTranslations.subDeviceC] },
        { name: this.currentTranslations.deviceGroupD, devices: [this.currentTranslations.mainDeviceD, this.currentTranslations.subDeviceD] },
      ];
    },
  },
  data() {
    return {
      deviceGroup: '',
      selectedLanguage: 'chinese', // Set the default language
      translations: {
        chinese: {
          temperature: '温度',
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
        },
        english: {
          temperature: 'temperature',
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
      this.deviceGroup = groupName;
      this.$emit('select-item', { deviceGroup: this.deviceGroup });
    }
  },
  created() {
    const selectedLanguageCookie = Cookies.get('selectedLanguage');
    
    // Check if the cookie is set and update the selectedLanguage data property
    if (selectedLanguageCookie) {
      this.selectedLanguage = selectedLanguageCookie;
    }
  }
};
</script>


<style>
  .icon-with-space {
    margin-right: 5px;
  }

  .device-group-space {
    border: 1px solid #ccc;
    padding: 20px; 
  }

  .tree-node {
    list-style-type: none;
    padding-left: 20px;
  }

  .tree-node:before {
    content: "";
    position: absolute;
    top: 0;
    left: -15px;
    border-left: 1px solid #ccc;
    height: 100%;
  }

  .tree-node:first-child:before {
    border: none;
  }

  .circular-btn,
  .circular-div {
    width: 150px;
    height: 100px;
    border-radius: 50%;
    background-color: #007bff;
    color: #fff;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    margin-bottom: 10px;
    position: relative;
  }

  .circular-btn:hover {
    background-color: #0056b3;
  }
</style>
