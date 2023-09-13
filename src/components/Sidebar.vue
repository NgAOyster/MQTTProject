<template>
    <div>
      <h4><i class="fas fa-chart-bar"></i> 监测数据</h4>
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
  export default {
    name:"Main_Sidebar",
    data() {
      return {
        dataTypes: ["温度", "电流"], // Add more data types if needed
      };
    },
    props: {
      selectedDataType: String,
    },
    methods: {
      selectDataType(dataType) {
        this.$emit("data-type-selected", dataType);
      },
    },
  };
</script>
  
  