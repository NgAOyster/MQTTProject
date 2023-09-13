<template>
  <div v-if="dataType === '温度'">
    <h3><i class="fas fa-thermometer-half"></i> 温度监测数据</h3>
          <br>
          <div class="data-container" v-for="(data, index) in sortedTemperatureData()" :key="index">
            <table class="data-table">
              <tr>
                <th>时间：</th>
                <td>{{ data.time }}</td>
              </tr>
              <tr>
                <th>设备编号：</th>
                <td>{{ data.machineId }}</td>
              </tr>
              <tr>
                <th>设备类型：</th>
                <td :class="getMessageClass(data.equipment)">{{ data.equipment }}</td>
              </tr>
            </table>
            <br>
            <table class="data-table">
              <tr>
                <th>温度消息等级：</th>
                <td :class="getMessageClass(data.TempdgmgMessage)">{{ data.TempdgmgMessage }}</td>
              </tr>
            </table>
            <table class="data-table">
              <thead>
                <th colspan="4">温度监测</th>
              </thead>
              <tbody>
                <tr>
                  <td class="monitorWidth" v-for="i in 4" :key="`tempMonitor${i}`">监测{{ i }}</td>
                </tr>
                <tr>
                  <td class="dataWidth" v-for="i in 4" :key="`tempData${i}`">{{ data['temp' + i] }} 摄氏度</td>
                </tr>
              </tbody>
            </table>
            <br><br>
          </div>
      </div>
      <div v-else-if="dataType === '电流'">
        <h3><i class="fas fa-bolt"></i> 电流监测数据</h3>
        <br>
        <div class="data-container" v-for="(data, index) in sortedCurrentData()" :key="index">
          <table class="data-table">
            <tr>
              <th>时间：</th>
              <td>{{ data.time }}</td>
            </tr>
            <tr>
              <th>设备编号：</th>
              <td>{{ data.machineId }}</td>
            </tr>
            <tr>
              <th>设备类型：</th>
              <td :class="getMessageClass(data.equipment)">{{ data.equipment }}</td>
            </tr>
          </table>
          <br>
          <table class="data-table">
            <tr>
              <th>电流消息等级：</th>
              <td :class="getMessageClass(data.CurrentdgmgMessage)">{{ data.CurrentdgmgMessage }}</td>
            </tr>
          </table>
          <table class="data-table">
            <thead>
              <th colspan="4">电流监测</th>
            </thead>
            <tbody>
              <tr>
                <td class="monitorWidth" v-for="i in 4" :key="`currentMonitor${i}`">监测{{ i }}</td>
              </tr>
              <tr>
                <td class="dataWidth" v-for="i in 4" :key="`currentData${i}`">{{ data['current' + i] }} 安培</td>
              </tr>
            </tbody>
          </table>
          <br><br>
        </div>
      </div>      
      <div v-else>
        <i class="fas fa-question-circle"></i> 请选择需要监测的数据
      </div>
</template>
  
  <script>
  export default {
    name:"Main_Content",
    props: {
      dataType: String,
      temperatureData: Array,
      currentData: Array,
    },
    methods: {
      sortedTemperatureData() {
        return this.temperatureData.slice().sort((a, b) => a.machineId - b.machineId);
      },
      sortedCurrentData() {
        return this.currentData.slice().sort((a, b) => a.machineId - b.machineId);
      },
      getMessageClass(message) {
        let messageClass = '';
        switch (message) {
          case '普通消息': messageClass = 'normal-message'; break;
          case '控制消息': messageClass = 'control-message'; break;
          case '告警消息': messageClass = 'warning-message'; break;
          case '严重警告': messageClass = 'critical-message'; break;
        }
        return messageClass;
      },
    }
  };
  </script>
  