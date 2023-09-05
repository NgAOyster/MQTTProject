<template>
  <div class="container">
    <div class="connecting" v-if="!connected">
      <p>登入成功 !</p>
      <p>正在连接MQTT服务器...</p>
      <p>这可能需要几秒钟时间。请稍等...</p>
    </div>
    <div v-else>
      <h1 class="main-title">主页</h1>
      <p class="welcome-message">欢迎, {{ username }} !</p>
      <p class="current-status">目前状态：<span :class="getStatusColorClass()">{{ getStatusText() }}</span></p>
      <p v-if="Timer" class="connection-time">已连接: {{ connectionTime }}</p>
      <br />
      <!-- Sort the data based on machineId in ascending order -->
      <div class="data-container" v-for="(data, index) in combinedData" :key="index">
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
        <div v-if="isTemperatureAndCurrentEmpty(data)">
          <!-- Temperature Monitoring -->
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
          <br>
          <!-- Current Monitoring -->
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
        </div>
        <div v-else-if="hasTemperatureData(data.machineId, data.equipment)">
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
        </div>
        <div v-else-if="hasCurrentData(data.machineId, data.equipment)">
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
        </div>
        <br><br>
      </div>
    </div>
  </div>
</template>

<script>
import Paho from "paho-mqtt";

export default {
  props: {
    username: String,
    password: String,
  },
  
  data() {
    return {
      temperatureData: [], // Array for temperature data
      currentData: [],     // Array for current data
      connected: false,
      connectStatus: false,
      Timer: false,
      connectionTime: null,
      reconnectStatus: false,
      disconnect: false,
      onlineStatus: true,
    };
  },

  created() {
    this.initMQTT();
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  },
  
  computed: {
    combinedData() {
      // Create an empty array to store the combined data
      const combinedData = [];

      // Iterate over temperatureData and add data to combinedData
      for (const tempData of this.temperatureData) {
        // Check if there is matching data in currentData
        const matchingData = this.currentData.find(
          (currentData) =>
            currentData.machineId === tempData.machineId &&
            currentData.equipment === tempData.equipment
        );

        if (matchingData) {
          const latestTime = tempData.time > matchingData.time ? tempData.time : matchingData.time;
          // Combine data from both arrays
          const combinedItem = {
            time: latestTime,
            machineId: tempData.machineId,
            equipment: tempData.equipment,
            TempdgmgMessage: tempData.TempdgmgMessage,
            CurrentdgmgMessage: matchingData.CurrentdgmgMessage,
            temp1: tempData.temp1,
            temp2: tempData.temp2,
            temp3: tempData.temp3,
            temp4: tempData.temp4,
            current1: matchingData.current1,
            current2: matchingData.current2,
            current3: matchingData.current3,
            current4: matchingData.current4
          };

          combinedData.push(combinedItem);
        } 
        else{
          combinedData.push(tempData);
        }
      }
      for (const currentDataItem of this.currentData) {
        const hasMatchingItem = combinedData.some(
          (combinedItem) =>
            combinedItem.machineId === currentDataItem.machineId &&
            combinedItem.equipment === currentDataItem.equipment
        );

        if (!hasMatchingItem) {
          combinedData.push(currentDataItem);
        }
      }
      console.log(combinedData);
      // Sort the combined data by machineId in ascending order
      return combinedData.sort((a, b) => a.machineId - b.machineId);
    },
  },

  methods: {
    initMQTT() {
      this.disconnect = false;
      const randomPart = Math.random().toString(36).substr(2, 8); // Generate a random string
      const uniqueClientId = `mqttx_${randomPart}`;
      const client = new Paho.Client(
        "ws://222.222.119.72:8083/mqtt", uniqueClientId
      );

      client.onConnectionLost = (responseObject) => {
        console.log("Connection lost: " + responseObject.errorMessage);
        this.connectStatus = false;
        this.reconnectStatus = false;
        this.disconnect = true;
        alert("与MQTT服务器的连接已断开...");
        setTimeout(() => {
          this.clearConnectionTimer();
          this.reconnect();
        }, 3000);
      };

      client.onMessageArrived = (message) => {
        console.log("Message Received: " + message.payloadString);
        const topic = message.destinationName;

        if (topic.endsWith("/othertemperature")) {
          this.handleMessage(message.payloadString, topic, this.temperatureData);
        } else if (topic.endsWith("/othercurrent")) {
          this.handleMessage(message.payloadString, topic, this.currentData);
        } else {
          // Handle other topics or do nothing
        }
      };

      const dgmgValues = ["dgmg01", "dgmg02", "dgmg03", "dgmg04"];
      const secondValues = ["asphaltmix", "asphaltcrush", "warmingmix", "stonecrush", "peripheral"];
      const deviceValues = Array.from({ length: 100 }, (_, index) => `device${index + 1}`);

      const topics = [];

      dgmgValues.forEach(dgmg => {
        secondValues.forEach(second => {
          deviceValues.forEach(device => {
            const tempTopic = `${dgmg}/${second}/station1/${device}/othertemperature`;
            const currentTopic = `${dgmg}/${second}/station1/${device}/othercurrent`;
            topics.push(tempTopic, currentTopic);
          });
        });
      });

      const options = {
        useSSL: false,
        userName: this.username,
        password: this.password,
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          this.connected = true;
          this.connectStatus = true;
          this.reconnectStatus = false;
          this.startConnectionTimer();

          topics.forEach(topic => {
            client.subscribe(topic, { qos: 0 });
          });
        },
        onFailure: (error) => {
          console.log('MQTT connection error:', error.errorMessage);
          this.connectStatus = false;
          this.reconnectStatus = true;
          alert("无法连接到MQTT服务器, 请检查服务器配置并尝试重新连接。");
          this.reconnect();
        },
      };

      client.connect(options);
    },
    reconnect() {
      if (!this.reconnectStatus) {
        this.reconnectStatus = true;
        console.log('Attempting to reconnect...');
        this.initMQTT();
      }
    },
    handleMessage(message, topic, dataCollection) {
    const isTemperature = topic.endsWith("/othertemperature");
    const isCurrent = topic.endsWith("/othercurrent");

    if (isTemperature || isCurrent) {
      const jsonData = JSON.parse(message);
      const localTimeString = new Date().toLocaleString();

      let dgmgMessage = "普通消息";
      const topicPrefix = topic.substring(0, 6); // Get the first 6 characters of the topic
      if (topicPrefix === "dgmg02") { dgmgMessage = "控制消息"; } 
      else if (topicPrefix === "dgmg03") { dgmgMessage = "告警消息"; } 
      else if (topicPrefix === "dgmg04") { dgmgMessage = "严重警告"; }

      let equipment = "沥青搅拌站";
      const charactersAfterSeventh = topic.substring(7, topic.indexOf('/', 7));
      if (charactersAfterSeventh === "asphaltcrush") { equipment = "沥青料破碎"; } 
      else if (charactersAfterSeventh === "warmingmix") { equipment = "温拌发泡设备"; } 
      else if (charactersAfterSeventh === "stonecrush") { equipment = "骨料整形破碎"; } 
      else if (charactersAfterSeventh === "peripheral") { equipment = "周边设备"; }

      // Extract machineId from the topic
      const topicParts = topic.split('/');
      const machineIdPart = topicParts[topicParts.length - 2]; // Assuming machineId is the second-to-last part of the topic
      const machineId = parseInt(machineIdPart.replace('device', '')); // Remove 'device' prefix and parse as an integer

      const data = {
        time: localTimeString,
        machineId,
        equipment,
      };

      if (isTemperature) {
        data.TempdgmgMessage = dgmgMessage;
        data.temp1 = jsonData.temp1;
        data.temp2 = jsonData.temp2;
        data.temp3 = jsonData.temp3;
        data.temp4 = jsonData.temp4;
      } else if (isCurrent) {
        data.CurrentdgmgMessage = dgmgMessage;
        data.current1 = jsonData.current1;
        data.current2 = jsonData.current2;
        data.current3 = jsonData.current3;
        data.current4 = jsonData.current4;
      }

      const existingIndex = dataCollection.findIndex(
        (dataItem) =>
          dataItem.machineId === machineId &&
          dataItem.equipment === equipment
      );

      if (existingIndex !== -1) {
        dataCollection[existingIndex] = data;
      } else {
        dataCollection.push(data);
      }
    }
  },
    clearConnectionTimer() {
      if (this.connectionTimer) {
        clearInterval(this.connectionTimer);
        this.connectionTimer = null; // Reset the timer variable
        this.connectionTime = null;
        this.Timer = false;
      }
    },
    startConnectionTimer() {
      this.clearConnectionTimer();
      this.Timer = true;
      const startTime = new Date().getTime();
      this.connectionTimer = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
        // Convert seconds to HH:mm:ss format
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
        this.connectionTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
      }, 1000); // Update every second
    },
    padZero(num) {
      return num.toString().padStart(2, '0');
    },
    beforeDestroy() {
      if (this.connectionTimer) {
        clearInterval(this.connectionTimer); // Clear the timer when the component is destroyed
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
      }
    },
    handleOnline() {
      this.onlineStatus = true;
      this.connectStatus = true;
      this.startConnectionTimer();
    },
    handleOffline() {
      this.onlineStatus = false;
      this.connectStatus = false;
      this.clearConnectionTimer();
      alert("网络连接已断开，您现在处于离线状态。");
    },
    hasCurrentData(machineId, equipment) {
      return this.currentData.some(
        (item) => item.machineId === machineId && item.equipment === equipment
      );
    },
    hasTemperatureData(machineId, equipment) {
      return this.temperatureData.some(
        (item) => item.machineId === machineId && item.equipment === equipment
      );
    },
    isTemperatureAndCurrentEmpty(data) {
      for (let i = 1; i <= 4; i++) {
        if (data['temp' + i] == null || data['current' + i] == null) {
          return false; // If any temperature or current value is empty, return false
        }
      }
      return true; // If all temperature and current values are not empty, return true
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
    getStatusColorClass() {
      if (this.connectStatus) { return 'connected'; } 
      if (!this.onlineStatus) { return 'internetDisconnect'; }
      if (this.reconnectStatus) { return 'reconnecting'; } 
      if (this.disconnect) { return 'disconnected'; }
    },
    getStatusText() {
      if (!this.onlineStatus) { return '网络断开'; }
      if (this.connectStatus) { return '已连接'; } 
      if (this.reconnectStatus) { return '重新连接中...'; } 
      if (this.disconnect) { return '连接断开'; }
    }
  },
};
</script>

<style>
@import '../CSS/MainPage.css';
</style>