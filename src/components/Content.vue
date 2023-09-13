<template>
    <div>
        <h3>
            <div v-if="dataType === '温度'">温度监测数据</div>
            <div v-else-if="dataType === '电流'">电流监测数据</div>
            <div v-else>请选择需要监测的数据</div>
        </h3>
    </div>
  </template>
  
  <script>
  export default {
    name:"Main_Content",
    props: {
      dataType: String,
    },
  };
  </script>
  