<template>
  <div>
    <!-- Header for mobile sidebar -->
    <button class="mobile-toggle-button" @click="toggleMobileSidebar" v-if="isMobile">
      <i class="fas fa-bars"></i> &nbsp;&nbsp; {{ currentTranslations.menu }}
    </button>

    <!-- Sidebar content -->
    <div class="sidebar" :class="{ 'mobile-visible': isMobileSidebarVisible }">
      <h5><i class="fas fa-chart-bar"></i>{{ currentTranslations.monitoringData }}</h5>
      <ul class="list-group">
        <li
          v-for="dataType in dataTypes"
          :key="dataType"
          @click="selectDataType(dataType)"
          class="list-group-item"
          :class="{ active: selectedDataType === dataType }"
          :style="{ backgroundColor: selectedDataType === dataType ? 'blue' : 'white' }"
        >
          {{ dataType }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "Main_Sidebar",
  created() {
    this.updateDataTypes(); // Initialize dataTypes
    this.checkMobile(); // Check mobile status on component creation
  },
  data() {
    return {
      translations: {
        chinese: {
          menu: '目录',
          monitoringData: '监测数据',
          temperature: '温度',
          current: '电流',
        },
        english: {
          menu: 'Menu',
          monitoringData: 'Monitoring Data',
          temperature: 'Temperature',
          current: 'Current',
        },
      },
      dataTypes: [], // Initialize dataTypes as an empty array
      isMobileSidebarVisible: true, // Display sidebar content by default
    };
  },
  props: {
    selectedDataType: String,
    selectedLanguage: String,
  },
  computed: {
    currentTranslations() {
      return this.translations[this.selectedLanguage] || {};
    },
    isMobile() {
      // Define a breakpoint for mobile screens (adjust as needed)
      return window.innerWidth <= 768;
    },
  },
  watch: {
    selectedLanguage: 'updateDataTypes', // Watch for changes in selectedLanguage and call updateDataTypes
    // Watch for changes in window.innerWidth and update isMobileSidebarVisible
    '$route'() {
      this.checkMobile();
    },
  },
  methods: {
    updateDataTypes() {
      this.dataTypes = [this.currentTranslations.temperature, this.currentTranslations.current];
      const language = this.selectedLanguage;
      if (language === 'chinese') {
        this.selectDataType("选择设备");
      } else if (language === 'english') {
        this.selectDataType("Choose Equipment");
      }
    },
    selectDataType(dataType) {
      this.$emit("data-type-selected", dataType);
    },
    toggleMobileSidebar() {
      this.isMobileSidebarVisible = !this.isMobileSidebarVisible;
    },
    checkMobile() {
      this.isMobileSidebarVisible = window.innerWidth > 768;
    },
  },
};
</script>

<style>
  @import '../CSS/Sidebar.css';
</style>





