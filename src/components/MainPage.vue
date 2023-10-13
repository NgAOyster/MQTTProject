<template>
  <div>
    <div class="connecting" v-if="!connected">
      <p>{{ $t('mainPage.connectingToMQTT') }}</p>
      <p>{{ $t('mainPage.pleaseWait') }}</p>
    </div>
    <div v-else>
      <!-- Navbar Start -->
      <nav class="navbar navbar-expand-lg navbar-light sticky-top mainNav">
        <button class="navbar-brand btn" @click="returnFunc()">
          <i class="fas fa-arrow-left" style="color: white;"></i>
        </button>
        <a class="navbar-brand" href="#" style="color: white;">{{ device }}</a>
        <!-- Hamburger Menu Icon -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav" style="margin-right: 10px;">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mobileNav">
          <ul class="navbar-nav ms-auto p-8 align-items-center">
            <li class="nav-item">
              <div class="mx-4">{{ $t('mainPage.currentStatus') }}<span :class="getStatusColorClass()">{{ getStatusText() }}</span></div>
            </li>
            <li class="nav-item">
              <div class="mx-4" v-if="Timer">
              {{ $t('mainPage.connected') }}: {{ connectionTime }}
              </div>
              <div class="mx-4" v-else>
              {{ $t('mainPage.disconnected') }}
              </div>
            </li>
            <li class="nav-item">
              <div class="dropdown">
                      <button class="btn dropdown-toggle" type="button" id="languageLogoutDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white;">
                      <i class="fas fa-user"></i> {{ $t('navbar.welcomeMessage') }} {{ username }}
                      </button>
                    <div class="dropdown-menu" aria-labelledby="languageLogoutDropdown">
                      <a class="dropdown-item" href="#" @click="changeLanguage('en')">English</a>
                      <a class="dropdown-item" href="#" @click="changeLanguage('cn')">中文</a>
                      <div class="dropdown-divider"></div>
                      <a class="dropdown-item" href="#" @click="confirmLogout()" style="color: black;">{{ $t('navbar.logout') }}</a>
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
            <Sidebar @data-type-selected="updateDataType" 
            :selectedDataType="selectedDataType" />
          </div>
          <div class="col-md-10 text-start">
            <!-- Content Component -->
            <Content
              :dataType="selectedDataType"
              :temperatureData="temperatureData"
              :currentData="currentData"
              :ChartTempX="ChartTempX"
              :ChartTempY="ChartTempY"
              :ChartCurrentX="ChartCurrentX"
              :ChartCurrentY="ChartCurrentY"
              :machineID="machineID"
              :equipment="equipment"
            />
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
    device: String,
    topic: String,
  },
  components: {
    Sidebar,
    Content,
  },
  data() {
    return {
      temperatureData: [], // Array for temperature data
      ChartTempX:[],
      ChartTempY:[],
      currentData: [],     // Array for current data
      ChartCurrentX:[],
      ChartCurrentY:[],
      connected: false,
      connectStatus: false,
      Timer: false,
      connectionTime: null,
      reconnectStatus: false,
      disconnect: false,
      onlineStatus: true,
      selectedDataType: this.$i18n.t('mainPage.default'), // Default data type
      mqttClient: null,
      machineID: null,
      equipment:null,
    };
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale;
    },
  },
  created() {
    console.log("Device: ", this.device);
    console.log("Topic: ", this.topic);
    this.initMQTT();
    
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    const tempData = localStorage.getItem('周边设备_54_temp');
    const tempData2 = localStorage.getItem('周边设备_54_tempData');
    const currentData = localStorage.getItem('周边设备_54_current');
    const currentData2 = localStorage.getItem('周边设备_54_currentData');
    if (tempData && tempData2) {
      const parsedTempData = JSON.parse(tempData);
      const parsedTempData2 = JSON.parse(tempData2);
      this.ChartTempX = parsedTempData.TempX;
      const maxLength = Math.max(parsedTempData.TempY1.length);
      for (let i = 0; i < maxLength; i++) {
        const tempArray = [];
        tempArray.push(parsedTempData.TempY1[i]);
        tempArray.push(parsedTempData.TempY2[i]);
        tempArray.push(parsedTempData.TempY3[i]);
        tempArray.push(parsedTempData.TempY4[i]);
        this.ChartTempY.push(tempArray);
      }
      this.temperatureData.push(parsedTempData2);
    }

    if (currentData && currentData2) {
      const parsedCurrentData = JSON.parse(currentData);
      const parsedCurrentData2 = JSON.parse(currentData2);
      this.ChartCurrentX = parsedCurrentData.CurrentX;
      const maxLength = Math.max(parsedCurrentData.CurrentY1.length);
      for (let i = 0; i < maxLength; i++) {
        const currentArray = [];
        currentArray.push(parsedCurrentData.CurrentY1[i]);
        currentArray.push(parsedCurrentData.CurrentY2[i]);
        currentArray.push(parsedCurrentData.CurrentY3[i]);
        currentArray.push(parsedCurrentData.CurrentY4[i]);
        this.ChartCurrentY.push(currentArray);
      }
      this.currentData.push(parsedCurrentData2);
    }
    
    setInterval(() => {
      this.publishDataToTopic();
    }, 30000);
  },
  methods: {
    changeLanguage(language) {
      this.$i18n.locale = language;
    },
    initMQTT() {
      this.disconnect = false;
      const randomPart = Math.random().toString(36).substr(2, 8); // Generate a random string
      const uniqueClientId = `mqttx_${randomPart}`;
      this.mqttClient = new Paho.Client(
        "ws://222.222.119.72:8083/mqtt", uniqueClientId
      );
      this.mqttClient.onConnectionLost = (responseObject) => {
        console.log("Connection lost: " + responseObject.errorMessage);
        this.connectStatus = false;
        this.reconnectStatus = false;
        this.disconnect = true;
        alert(this.$i18n.t('mainPage.connectionLostAlert'));
        setTimeout(() => {
          this.clearConnectionTimer();
          this.reconnect();
        }, 3000);
      };
      this.mqttClient.onMessageArrived = (message) => {
        console.log("Message Received: " + message.payloadString);
        const topic = message.destinationName;
        if (topic.endsWith("/othertemperature")) {
          this.handleMessage(message.payloadString, topic, this.temperatureData);
        } else if (topic.endsWith("/othercurrent")) {
          this.handleMessage(message.payloadString, topic, this.currentData);
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
        userName: 'ml001',
        password: 'ml001',
        onSuccess: () => {
          console.log('Connected to MQTT broker(Testing Use)');
          this.connected = true;
          this.connectStatus = true;
          this.reconnectStatus = false;
          this.startConnectionTimer();
          topics.forEach(topic => {
            this.mqttClient.subscribe(topic, { qos: 0 });
          });
        },
        onFailure: (error) => {
          console.log('MQTT connection error:', error.errorMessage);
          this.connectStatus = false;
          this.reconnectStatus = true;
          alert(this.$i18n.t('mainPage.mqttConnectionErrorAlert'));
          this.reconnect();
        },
      };
      // const options2 = {
      //   useSSL: false,
      //   userName: this.username,
      //   password: this.password,
      //   onSuccess: () => {
      //     console.log('Connected to MQTT broker(API returned)');
      //     this.connected = true;
      //     this.connectStatus = true;
      //     this.reconnectStatus = false;
      //     this.startConnectionTimer();
      //     this.mqttClient.subscribe(this.topic, { qos: 0 });
      //   },
      //   onFailure: (error) => {
      //     console.log('MQTT connection error:', error.errorMessage);
      //     this.connectStatus = false;
      //     this.reconnectStatus = true;
      //     alert(this.$i18n.t('mainPage.mqttConnectionErrorAlert'));
      //     this.reconnect();
      //   },
      // };
      this.mqttClient.connect(options);
      //this.mqttClient.connect(options2);
    },
    reconnect() {
      if (!this.reconnectStatus) {
        this.reconnectStatus = true;
        console.log('Attempting to reconnect...');
        this.initMQTT();
      }
    },
    publishDataToTopic() {
      // Check if the MQTT client is connected before publishing
      if (this.mqttClient.isConnected()) {
        const tempTopic = "dgmg01/peripheral/station1/device54/othertemperature";
        const tempData = {
          temp1: this.getRandomNumber(50, 120), temp2: this.getRandomNumber(50, 120), 
          temp3: this.getRandomNumber(50, 120), temp4: this.getRandomNumber(50, 120),
        };
        const currentTopic = "dgmg01/peripheral/station1/device54/othercurrent";
        const currentData = {
          current1: this.getRandomDecimal(5.00, 20.00, 2), current2: this.getRandomDecimal(5.00, 20.00, 2), 
          current3: this.getRandomDecimal(5.00, 20.00, 2), current4: this.getRandomDecimal(5.00, 20.00, 2),
        };
        const tempMessage = new Paho.Message(JSON.stringify(tempData));
        tempMessage.destinationName = tempTopic;
        const currentMessage = new Paho.Message(JSON.stringify(currentData));
        currentMessage.destinationName = currentTopic;
        this.mqttClient.send(tempMessage); 
        this.mqttClient.send(currentMessage); 
        console.log("Published JSON data:", tempData);
        console.log("Published JSON data:", currentData);
      } else {
        console.error("MQTT client is not connected.");
      }
    },
    getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getRandomDecimal(min, max, decimalPlaces) {
      const factor = 10 ** decimalPlaces;
      return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    },
    handleMessage(message, topic, dataCollection) {
      const isTemperature = topic.endsWith("/othertemperature");
      const isCurrent = topic.endsWith("/othercurrent");
      if (isTemperature || isCurrent) {
        const jsonData = JSON.parse(message);
        const localTimeString = new Date().toLocaleString();
        const currentTime = new Date().toLocaleTimeString();
        let dgmgMessage = '普通消息';
        const topicPrefix = topic.substring(0, 6); // Get the first 6 characters of the topic
        if (topicPrefix === "dgmg02") { dgmgMessage = '控制消息'; }
        else if (topicPrefix === "dgmg03") { dgmgMessage = '告警消息'; }
        else if (topicPrefix === "dgmg04") { dgmgMessage = '严重警告'; }
        let equipment = '沥青搅拌站';
        const charactersAfterSeventh = topic.substring(7, topic.indexOf('/', 7));
        if (charactersAfterSeventh === "asphaltcrush") { equipment =  '沥青料破碎'; }
        else if (charactersAfterSeventh === "warmingmix") { equipment = '温拌发泡设备'; }
        else if (charactersAfterSeventh === "stonecrush") { equipment = '骨料整形破碎'; }
        else if (charactersAfterSeventh === "peripheral") { equipment = '周边设备'; }
        // Extract machineId from the topic
        const topicParts = topic.split('/');
        const machineIdPart = topicParts[topicParts.length - 2]; // Assuming machineId is the second-to-last part of the topic
        const machineId = parseInt(machineIdPart.replace('device', '')); // Remove 'device' prefix and parse as an integer
        const typeEquipment = equipment;
        this.machineID = machineId.toString();
        this.equipment = typeEquipment;
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
          this.ChartTempX.push(currentTime);
          this.ChartTempY.push([jsonData.temp1, jsonData.temp2, jsonData.temp3, jsonData.temp4]);
        } else if (isCurrent) {
          data.CurrentdgmgMessage = dgmgMessage;
          data.current1 = jsonData.current1;
          data.current2 = jsonData.current2;
          data.current3 = jsonData.current3;
          data.current4 = jsonData.current4;
          this.ChartCurrentX.push(currentTime);
          this.ChartCurrentY.push([jsonData.current1, jsonData.current2, jsonData.current3, jsonData.current4]);
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
      alert(this.$i18n.t('mainPage.networkDisconnectMessage'));
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
      if (!this.onlineStatus) { return this.$i18n.t('mainPage.networkDisconnect'); }
      if (this.connectStatus) { return this.$i18n.t('mainPage.connected'); }
      if (this.reconnectStatus) { return this.$i18n.t('mainPage.reconnecting'); }
      if (this.disconnect) { return this.$i18n.t('mainPage.disconnected'); }
    },
    confirmLogout() {
      const confirmLogout = window.confirm(this.$i18n.t('navbar.logoutConfirmation'));
      if (confirmLogout) {
        alert(this.$i18n.t('navbar.logoutSuccessMessage'));
        this.$emit('logout');
      }
    },
    returnFunc(){
      this.$emit('returnBack');
    }
  },
};
</script>
<style>
@import '../CSS/MainPage.css';
</style>

