<template>
  <div>
    <div class="connecting" v-if="!connected">
      <p>登入成功 ! </p>
      <p>正在连接MQTT服务器...</p>
      <p>这可能需要几秒钟时间。请稍等...</p>
    </div>
    <div v-else>
      <h1>Main Page</h1>
      <p>Welcome, {{ username }}!</p>
      <p>Password: {{ password }}</p>
      <p v-if="connectionTime">Connected for: {{ connectionTime }} seconds</p>
      <br/>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Machine ID</th>
            <th v-for="i in 4" :key="i">Temperature {{ i }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, index) in temperatureData" :key="index">
            <td>{{ data.time }}</td>
            <td>{{ data.machineId }}</td>
            <td v-for="i in 4" :key="i">{{ data['temp' + i] }} 摄氏度</td>
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
        this.handleReceivedMessage(message.payloadString);
      };

      const options = {
        useSSL: false,
        userName: this.username, // Use the passed username
        password: this.password, // Use the passed password
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          this.connected = true;
          this.startConnectionTimer();
          //client.subscribe("DataTopic", { qos: 0 });
        },
        onFailure: (error) => {
          console.log('MQTT connection error:', error.errorMessage);
        },
      };
      client.connect(options);
    },
    handleReceivedMessage(message) {
      const jsonData = JSON.parse(message);
      const localTimeString = new Date().toLocaleString();

      // Replace old temperatureData with new data
      this.temperatureData = [{
        time: localTimeString,
        machineId: jsonData.MachineId,
        temp1: jsonData.temp1,
        temp2: jsonData.temp2,
        temp3: jsonData.temp3,
        temp4: jsonData.temp4,
      }];
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
  },
};
</script>

<style>
@import '../CSS/MainPage.css';
</style>