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
      <p class="current-status">
        目前状态:
        <span :class="getStatusColorClass()">
          {{ connected ? '已连接' : (reconnectStatus ? '重新连接中...' : '未连接') }}
        </span>
      </p>
      <p v-if="connectionTime" class="connection-time">
        已连接: {{ connectionTime }}
      </p>
      <br>
      <table class="styled-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>设备编号</th>
            <th v-for="i in 4" :key="i">温度监测 {{ i }}</th>
            <th>消息等级</th>
            <th>设备类型</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, index) in temperatureData" :key="index">
            <td>{{ data.time }}</td>
            <td>{{ data.machineId }}</td>
            <td v-for="i in 4" :key="i">{{ data['temp' + i] }} 摄氏度</td>
            <td :class="getMessageClass(data.dgmgMessage)">{{ data.dgmgMessage}}</td>
            <td :class="getMessageClass(data.equipment)">{{ data.equipment }}</td>
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
      reconnectStatus: false,
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
        alert("连接已断开，请检查网络连接并尝试重新连接。");
      };

      client.onMessageArrived = (message) => {
        console.log("Message Received: " + message.payloadString);
        const topic = message.destinationName;
        this.handleReceivedMessage(message.payloadString, topic);
      };

      const dgmgValues = ["dgmg01", "dgmg02", "dgmg03", "dgmg04"];
      const secondValues = ["asphaltmix", "asphaltcrush", "warmingmix", "stonecrush", "peripheral"];
      const deviceValues = Array.from({ length: 100 }, (_, index) => `device${index + 1}`);

      const topics = [];

      dgmgValues.forEach(dgmg => {
        secondValues.forEach(second => {
          deviceValues.forEach(device => {
            const topic = `${dgmg}/${second}/station1/${device}/othertemperature`;
            topics.push(topic);
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
          this.reconnectStatus = false;
          this.startConnectionTimer();

          topics.forEach(topic => {
            client.subscribe(topic, { qos: 0 });
          });
        },
        onFailure: (error) => {
          console.log('MQTT connection error:', error.errorMessage);
          this.reconnect();
        },
      };

      client.connect(options);
    },
    reconnect() {
      if (!this.reconnectStatus) {
        this.reconnectStatus = true;
        console.log('Attempting to reconnect...');
        this.connectionTime = 0;
        this.initMQTT();
      }
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

      let equipment = "沥青搅拌站";
      const charactersAfterSeventh = topic.substring(7, topic.indexOf('/', 7));

      if (charactersAfterSeventh === "asphaltcrush") {
      equipment = "沥青料破碎";
      } else if (charactersAfterSeventh === "warmingmix") {
       equipment = "温拌发泡设备";
      } else if (charactersAfterSeventh === "stonecrush") {
        equipment = "骨料整形破碎";
      } else if (charactersAfterSeventh === "peripheral") {
        equipment = "周边设备";
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
    },
    startConnectionTimer() {
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
    getStatusColorClass() {
      if (this.connected) {
        return 'connected';
      } else if (this.reconnectStatus) {
        return 'reconnecting';
      } else {
        return 'disconnected';
      }
    },
  },
};
</script>

<style>
@import '../CSS/MainPage.css';
</style>