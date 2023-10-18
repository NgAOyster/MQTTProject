<template>
  <div>
    <!-- Navbar Start -->
    <nav class="navbar navbar-expand-lg navbar-light sticky-top mainNav">
      <a class="navbar-brand" href="#" style="color: white; margin-left: 10px;">{{ $t('selectionPage.title') }}</a>
      <!-- Hamburger Menu Icon -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav" style="margin-right: 10px;">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mobileNav">
        <ul class="navbar-nav ms-auto p-2 align-items-center">
          <li class="nav-item">
            <div class="dropdown">
              <button class="btn dropdown-toggle" type="button" id="languageLogoutDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white;">
                <i class="fas fa-user"></i> {{ $t('navbar.welcomeMessage') }}, {{ username }}
              </button>
              <div class="dropdown-menu" aria-labelledby="languageLogoutDropdown">
                <a class="dropdown-item" href="#" @click="changeLanguage('en')">English</a>
                <a class="dropdown-item" href="#" @click="changeLanguage('cn')">中文</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click="confirmLogout()" style="color: black;">{{ $t('navbar.logout') }}</a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
    <!-- Navbar End -->
    <br>
    <h3>{{ $t('selectionPage.selectDevice') }}</h3><br>
    <div class="container">
    <div v-for="item in equiplist" :key="item.id" class="mt-4">
      <el-button
        @click="ButtonClick(item.equp_name, item.equp_topic)"
        type="primary"
        style="font-size: 20px; height: 50px;"
      >
        <i class="fas fa-folder icon-with-space"></i> {{ item.equp_name }}
      </el-button>
      <br>
      <ul class="list-unstyled tree">
        <li>
          <div class="d-flex flex-wrap">
            <div v-for="(device, deviceIndex) in item.devices" :key="deviceIndex" class="circular-div mb-4 mr-2" :class="device.type === 'main' ? 'main-device-text' : 'sub-device-text'">
              <i class="fas fa-cogs icon-with-space"></i> {{ device.name }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  emits: ['select-item'],
  props: {
    username: String,
    token: String,
  },
  computed: {
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
  created() {
    this.getEquipList();
    this.getCompanyList();
    this.getAllEquip();
    this.getUserAdmin();
  },
  watch: {
    '$i18n.locale'() {
      this.updateDevices();
    }, 
  },
  data() {
    return {
      equiplist: null,
    };
  },
  methods: {
    changeLanguage(language) {
      this.$i18n.locale = language;
    },
    confirmLogout() {
      const confirmLogout = window.confirm(this.$i18n.t('navbar.logoutConfirmation'));
      if (confirmLogout) {
        alert(this.$i18n.t('navbar.logoutSuccessMessage'));
        this.$emit('logout');
      }
    },
    ButtonClick(equp_name, equp_topic) {
      this.$emit('select-item', { device: equp_name, topic: equp_topic });
    },
    ButtonClickTest(item) {
      if (this.$i18n.locale === 'cn') {
        const deviceGroupCN = item.equp_name;
        // const Key = this.getKeyByValue(this.translations.chinese, deviceGroupCN);
        const deviceGroupEN = item.equp_name;
        this.$emit('select-item', { deviceGroupCN: deviceGroupCN, deviceGroupEN: deviceGroupEN, item: item });
      } else if (this.$i18n.locale === 'en') {
        const deviceGroupEN = item.equp_name;
        // const Key = this.getKeyByValue(this.translations.english, deviceGroupEN);
        const deviceGroupCN = item.equp_name;
        this.$emit('select-item', { deviceGroupCN: deviceGroupCN, deviceGroupEN: deviceGroupEN, item: item });
      }
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
          console.log('Current Language: ', this.$i18n.locale);
          // Assign the data to equiplist
          this.equiplist = response.data;
          this.putDevices();
        } else {
          console.error(this.$i18n.t('selectionPage.getEquipError'));
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    },
    putDevices() {
      for (let i = 0; i < this.equiplist.length; i++) {
        this.equiplist[i].devices = [
          { name: this.$i18n.t('selectionPage.mainDeviceA'), type: 'main' },
          { name: this.$i18n.t('selectionPage.subDeviceA'), type: 'sub' }
        ];
      }
    },
    updateDevices() {
      for (let i = 0; i < this.equiplist.length; i++) {
        this.equiplist[i].devices = [
          { name: this.$i18n.t('selectionPage.mainDeviceA'), type: 'main' },
          { name: this.$i18n.t('selectionPage.subDeviceA'), type: 'sub' }
        ];
      }
    },
    async changePassword() {
      const apiUrl = 'http://222.222.119.72:15518/user/changepw';

      // Define the request data
      const requestData = {
        cp_id: this.cpid,
        username: this.username,
        oldpw: this.password,
        newpw: this.newPassword,
      };

      // Define the request headers
      const headers = {
        'Authorization': `Bearer ${this.token}`,
      };

      try {
        // Make the POST request using Axios
        const response = await axios.post(apiUrl, null, {
          params: requestData,
          headers: headers,
        });

        // Handle the response data or any other logic here
        console.log(response.data);
      } catch (error) {
        // Handle any errors that occur during the request
        console.error('An error occurred:', error);
      }
    },
    async getCompanyList(){
      const apiUrl = 'http://222.222.119.72:15518/dg/companylist'; 
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
          const companyList = response.data;
          console.log("Company List: ", companyList);
        } else {
          console.log("获取公司列表失败 "+response.status)
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    },
    async getAllEquip(){
      const apiUrl = 'http://222.222.119.72:15518/dg/getequipall'; 
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
          const allEquip = response.data;
          console.log("All Equipment List: ", allEquip);
        } else {
          console.log("获取列表失败 " + response.status)
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    },
    async getUserAdmin(){
      const apiUrl = 'http://222.222.119.72:15518/dg/getusradminbycpid'; 
      const token = this.token;
      try {
        // Make the HTTP request to the API
        const response = await axios.get(
          apiUrl, {
          params: {
            cp_id: this.cpid,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        // Check if the response status is OK (200)
        if (response.status === 200) {
          const admin = response.data;
          console.log("User Admin: ", admin);
        } else {
          console.log("获取用户失败 " + response.status)
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    },
  },
};
</script>


<style>
@import '../CSS/SelectionPage.css';
</style>
