<template>
  <div>
    <h5><i class="fas fa-chart-bar"></i>{{ currentTranslations.monitoringData }}</h5>
    <ul class="list-group">
      <li
        v-for="dataType in dataTypes"
        :key="dataType"
        @click="selectDataType(dataType)"
        class="list-group-item"
        :class="{ active: selectedDataType === dataType}"
        :style="{ backgroundColor: selectedDataType === dataType ? 'blue' : 'white' }"
      >
      {{ dataType }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Main_Sidebar",
  created() {
    this.updateDataTypes(); // Initialize dataTypes
  },
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
          temperature: 'Temperature',
          current: 'Current',
        },
      },
      dataTypes: [], // Initialize dataTypes as an empty array
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
  },
  watch: {
    selectedLanguage: 'updateDataTypes', // Watch for changes in selectedLanguage and call updateDataTypes
  },
  methods: {
    updateDataTypes() {
      this.dataTypes = [this.currentTranslations.temperature, this.currentTranslations.current];
      const language = this.selectedLanguage;
      if(language === 'chinese') { this.selectDataType("选择设备"); }
      else if (language === 'english') {this.selectDataType("Choose Equipment"); }
    },
    selectDataType(dataType) {
      this.$emit("data-type-selected", dataType);
    },
  }, 
};
</script>
