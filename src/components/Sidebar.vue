<template>
  <div>
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
</template>

<script>
import Cookies from 'js-cookie'; // Import the js-cookie library
export default {
  name: "Main_Sidebar",
  data() {
    return {
      translations: {
        chinese: {
          monitoringData: '监测数据',
          temperature: '温度',
          current: '电流',
        },
        english: {
          monitoringData: 'Monitoring Data',
          temperature: 'temperature',
          current: 'current',
        },
      },
      selectedLanguage: '', // Initialize selectedLanguage
      dataTypes: [], // Initialize dataTypes as an empty array
    };
  },
  props: {
    selectedDataType: String,
  },
  computed: {
    currentTranslations() {
      return this.translations[this.selectedLanguage] || {};
    },
  },
  methods: {
    selectDataType(dataType) {
      this.$emit("data-type-selected", dataType);
    },
  },
  created() {
    const selectedLanguageCookie = Cookies.get('selectedLanguage');
    
    // Check if the cookie is set and update the selectedLanguage data property
    if (selectedLanguageCookie) {
      this.selectedLanguage = selectedLanguageCookie;
    }
    
    // Initialize dataTypes based on the current selected language
    this.dataTypes = [this.currentTranslations.temperature, this.currentTranslations.current];
  },
};
</script>
