<template>
  <div>
    <!-- Header for mobile sidebar -->
    <button class="mobile-toggle-button" @click="toggleMobileSidebar" v-if="isMobile">
      <i class="fas fa-bars"></i> &nbsp;&nbsp; {{ $t('sidebar.menu') }}
    </button>

    <!-- Sidebar content -->
    <div class="sidebar" :class="{ 'mobile-visible': isMobileSidebarVisible }">
      <h5><i class="fas fa-chart-bar"></i>{{ $t('sidebar.monitoringData') }}</h5>
      <ul class="list-group">
        <li
          v-for="dataType in dataTypes"
          :key="dataType"
          @click="selectDataType(dataType)"
          class="list-group-item"
          :class="{ active: selectedDataType === dataType }"
          :style="{ backgroundColor: selectedDataType === dataType ? (dataType === $t('sidebar.current') ? 'green' : (dataType === $t('sidebar.temperature') ? 'blue' : 'white')) : 'white'}"
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
      dataTypes: [], // Initialize dataTypes as an empty array
      isMobileSidebarVisible: true, // Display sidebar content by default
    };
  },
  props: {
    selectedDataType: String,
    selectedLanguage: String,
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale;
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
      this.dataTypes = [this.$i18n.t('sidebar.temperature'), this.$i18n.t('sidebar.current')];
      this.selectDataType(this.$i18n.t('sidebar.default'));
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





