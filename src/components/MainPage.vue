<template>
  <div>
    <div class="connecting" v-if="!connected">
      <p>登入成功 !</p>
      <p>正在连接MQTT服务器...</p>
      <p>这可能需要几秒钟时间。请稍等...</p>
    </div>
    <div v-else>
      <!-- Navbar Start -->
      <nav class="navbar navbar-expand-lg navbar-light sticky-top mainNav" style="padding: 10px;">
  <a class="navbar-brand" href="#" style="color: white;">主页</a>
  <!-- Hamburger Menu Icon -->
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="mobileNav">
    <ul class="navbar-nav ms-auto p-8 align-items-center">
      <li class="nav-item">
        <div class="mx-4">目前状态: <span :class="getStatusColorClass()">{{ getStatusText() }}</span></div>
      </li>
      <li class="nav-item">
        <div class="mx-4" v-if="Timer">已连接: {{ connectionTime }}</div>
        <div class="mx-4" v-else>未连接服务器</div>
      </li>
      <li class="nav-item">
        <div class="dropdown">
          <button class="btn dropdown-toggle" type="button" id="logoutDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white;">
            <i class="fas fa-user"></i> 欢迎您, {{ username }}
          </button>
          <div class="dropdown-menu" aria-labelledby="logoutDropdown">
            <a class="dropdown-item" href="#" @click="confirmLogout()" style="color: black;">登出</a>
          </div>
        </div>
      </li>
    </ul>
  </div>
</nav>
      <!-- Navbar End -->
      <div class="container-fluid" style="height: 100vh;">
        <div class="row">
          <div class="col-md-2 sideComp text-start">
            <!-- Sidebar Component -->
            <Sidebar @data-type-selected="updateDataType" :selectedDataType="selectedDataType" />
          </div>
          <div class="col-md-10 text-start">
            <!-- Content Component -->
            <Content :dataType="selectedDataType" :temperatureData="temperatureData" :currentData="currentData" />
          </div>
        </div>
      </div>
      <br />
    </div>
  </div>
</template>
<script>
import Paho from "paho-mqtt";
import Sidebar from "../components/Sidebar.vue";
import Content from "../components/Content.vue";
export default {
  props: {
    username: String,
    password: String,
  },
  components: {
    Sidebar,
    Content,
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
      selectedDataType: "temperature", // Default data type
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
    updateDataType(dataType) {
      this.selectedDataType = dataType;
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
    },
    confirmLogout() {
      const confirmLogout = window.confirm('确定要登出吗？');
      if (confirmLogout) {
        alert("您已成功登出");
        this.$emit('logout');
      }
    },
  },
};
</script>
<style>
@import '../CSS/MainPage.css';
</style>

