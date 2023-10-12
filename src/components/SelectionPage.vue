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
                <i class="fas fa-user"></i> {{ $t('selectionPage.welcomeMessage') }}, {{ username }}
              </button>
              <div class="dropdown-menu" aria-labelledby="languageLogoutDropdown">
                <a class="dropdown-item" href="#" @click="changeLanguage('en')">English</a>
                <a class="dropdown-item" href="#" @click="changeLanguage('cn')">中文</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click="confirmLogout()" style="color: black;">{{ $t('selectionPage.logout') }}</a>
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
                      <div v-for="(device, deviceIndex) in item.devices" :key="deviceIndex" class="circular-div mb-4 mr-2" :class="device.type === 'main' ? 'main-device-text' : 'sub-device-text'">
                        <i class="fas fa-cogs icon-with-space"></i> {{ device.name }}
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
export default {
  emits: ['select-item'],
  props: {
    username: String,
    token: String,
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale;
    },
  },
  created() {
    this.getEquipList();
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
      const confirmLogout = window.confirm(this.$i18n.t('selectionPage.logoutConfirmation'));
      if (confirmLogout) {
        alert(this.$i18n.t('selectionPage.logoutSuccessMessage'));
        this.$emit('logout');
      }
    },
    ButtonClick(equp_name) {
      this.$emit('select-item', { device: equp_name });
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
      console.log('Updated Equipment list: ', this.equiplist);
    },
  },
};
</script>


<style>
@import '../CSS/SelectionPage.css';
</style>
