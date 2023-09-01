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
      <p class="current-status"> 目前状态：<span :class="getStatusColorClass()"> {{ getStatusText() }} </span> </p>
      <p v-if="Timer" class="connection-time">
        已连接: {{ connectionTime }}
      </p>
      <br>
      <div class="data-container" v-for="(data, index) in temperatureData" :key="index">
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
            <td :class="getMessageClass(data.equipment)" >{{ data.equipment }}</td>
          </tr>
          <tr>
            <th>消息等级：</th>
            <td :class="getMessageClass(data.dgmgMessage)">{{ data.dgmgMessage }}</td>
          </tr>
        </table>
        <br>
        <table class="styled-table">
          <thead>
            <th v-for="i in 4" :key="i">温度监测 {{ i }}</th>
          </thead>
          <tbody>
            <td v-for="i in 4" :key="i">{{ data['temp' + i] }} 摄氏度</td>
          </tbody>
        </table>
        <br><br>
      </div>
      
      <!-- Add a section for current data -->
      <div class="data-container" v-for="(data, index) in currentData" :key="index">
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
            <td :class="getMessageClass(data.equipment)" >{{ data.equipment }}</td>
          </tr>
          <tr>
            <th>消息等级：</th>
            <td :class="getMessageClass(data.dgmgMessage)">{{ data.dgmgMessage }}</td>
          </tr>
        </table>
        <br>
        <table class="styled-table">
          <thead>
            <th v-for="i in 4" :key="i">电流监测 {{ i }}</th>
          </thead>
          <tbody>
            <td v-for="i in 4" :key="i">{{ data['current' + i] }} 安培</td>
          </tbody>
        </table>
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
          this.handleTemperatureMessage(message.payloadString, topic);
        } else if (topic.endsWith("/othercurrent")) {
          this.handleCurrentMessage(message.payloadString, topic);
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
    handleTemperatureMessage(message, topic) {
      // Check if the topic ends with /othertemperature
      if (topic.endsWith("/othertemperature")) {
        // Process the message for /othertemperature
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

        // Find the index of existing data with the same MachineId
        const existingIndex = this.temperatureData.findIndex(data => data.machineId === jsonData.MachineId && data.equipment === equipment);
        if (existingIndex !== -1) {
          // If existing data with the same MachineId is found, replace it
          this.temperatureData[existingIndex] = {
            time: localTimeString,
            machineId: jsonData.MachineId,
            temp1: jsonData.temp1,
            temp2: jsonData.temp2,
            temp3: jsonData.temp3,
            temp4: jsonData.temp4,
            dgmgMessage: dgmgMessage, // Use different property name for dgmgMessage
            equipment: equipment
          };
        } else {
          // If no existing data with the same MachineId is found, push new data
          this.temperatureData.push({
            time: localTimeString,
            machineId: jsonData.MachineId,
            temp1: jsonData.temp1,
            temp2: jsonData.temp2,
            temp3: jsonData.temp3,
            temp4: jsonData.temp4,
            dgmgMessage: dgmgMessage, // Use different property name for dgmgMessage
            equipment: equipment 
          });
        }
      }
    },

    handleCurrentMessage(message, topic) {
      // Check if the topic ends with /othercurrent
      if (topic.endsWith("/othercurrent")) {
        // Process the message for /othercurrent
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

        // Find the index of existing data with the same MachineId
        const existingIndex = this.currentData.findIndex(data => data.machineId === jsonData.MachineId && data.equipment === equipment);
        if (existingIndex !== -1) {
          // If existing data with the same MachineId is found, replace it
          this.currentData[existingIndex] = {
            time: localTimeString,
            machineId: jsonData.MachineId,
            current1: jsonData.current1,
            current2: jsonData.current2,
            current3: jsonData.current3,
            current4: jsonData.current4,
            dgmgMessage: dgmgMessage, // Use different property name for dgmgMessage
            equipment: equipment
          };
        } else {
          // If no existing data with the same MachineId is found, push new data
          this.currentData.push({
            time: localTimeString,
            machineId: jsonData.MachineId,
            current1: jsonData.current1,
            current2: jsonData.current2,
            current3: jsonData.current3,
            current4: jsonData.current4,
            dgmgMessage: dgmgMessage, // Use different property name for dgmgMessage
            equipment: equipment 
          });
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