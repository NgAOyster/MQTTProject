<template>
  <div class="container">
    <div class="connecting" v-if="!connected">
      <p>登入成功 !</p>
      <p>正在连接MQTT服务器...</p>
      <p>这可能需要几秒钟时间。请稍等...</p>
    </div>
    <div v-else>
      <h1 class="main-title">Main Page</h1>
      <p class="welcome-message">Welcome, {{ username }}!</p>
      <p v-if="connectionTime" class="connection-time">
        Connected for: {{ connectionTime }} seconds
      </p>
      <br>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Machine ID</th>
            <th v-for="i in 4" :key="i">Temperature {{ i }}</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, index) in temperatureData" :key="index">
            <td>{{ data.time }}</td>
            <td>{{ data.machineId }}</td>
            <td v-for="i in 4" :key="i">{{ data['temp' + i] }} 摄氏度</td>
            <td :class="getMessageClass(data.message)">{{ data.message }}</td>
          </tr>
        </tbody>
      </table>
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
      temperatureData: [],
      connected: false,
      connectionTime: 0,
    };
  },

  created() {
    this.initMQTT();
  },
  
  methods: {
    initMQTT() {
      const client = new Paho.Client(
        "ws://222.222.119.72:8083/mqtt",
        "clientId"
      );

      client.onConnectionLost = (responseObject) => {
        console.log("Connection lost: " + responseObject.errorMessage);
      };

      client.onMessageArrived = (message) => {
        console.log("Message Received: " + message.payloadString);
        const topic = message.destinationName;
        this.handleReceivedMessage(message.payloadString, topic);
      };

      const options = {
        useSSL: false,
        userName: this.username, // Use the passed username
        password: this.password, // Use the passed password
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          this.connected = true;
          this.startConnectionTimer();
          client.subscribe("dgmg01/peripheral/station1/device54/othertemperature", { qos: 0 });
          client.subscribe("dgmg02/peripheral/station1/device54/othertemperature", { qos: 0 });
          client.subscribe("dgmg03/peripheral/station1/device54/othertemperature", { qos: 0 });
          client.subscribe("dgmg04/peripheral/station1/device54/othertemperature", { qos: 0 });
        },
        onFailure: (error) => {
          console.log('MQTT connection error:', error.errorMessage);
        },
      };
      client.connect(options);
    },
    handleReceivedMessage(message, topic) {
      const jsonData = JSON.parse(message);
      const localTimeString = new Date().toLocaleString();

      let dgmgMessage = "普通消息";
      const topicPrefix = topic.substring(0, 6); // Get the first 6 characters of the topic
      if (topicPrefix === "dgmg02") {
        dgmgMessage = "控制消息";
      } else if (topicPrefix === "dgmg03") {
        dgmgMessage = "告警消息";
      } else if (topicPrefix === "dgmg04") {
        dgmgMessage = "严重警告";
      }

      // Find the index of existing data with the same MachineId
      const existingIndex = this.temperatureData.findIndex(data => data.machineId === jsonData.MachineId);
      if (existingIndex !== -1) {
        // If existing data with the same MachineId is found, replace it
        this.temperatureData[existingIndex] = {
          time: localTimeString,
          machineId: jsonData.MachineId,
          temp1: jsonData.temp1,
          temp2: jsonData.temp2,
          temp3: jsonData.temp3,
          temp4: jsonData.temp4,
          message: dgmgMessage
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
          message: dgmgMessage
        });
      }
    },
    startConnectionTimer() {
      const startTime = new Date().getTime();
      this.connectionTimer = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
        this.connectionTime = elapsedTime;
      }, 1000); // Update every second
    },
    beforeDestroy() {
      if (this.connectionTimer) {
        clearInterval(this.connectionTimer); // Clear the timer when the component is destroyed
      }
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
  },
};
</script>

<style>
@import '../CSS/MainPage.css';
</style>