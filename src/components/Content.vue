<template>
  <div v-if="dataType === '温度' || dataType ==='Temperature'">
    <h3><i class="fas fa-thermometer-half"></i> {{ $t('content.temperatureDataTitle') }}</h3>
    <br>
    <div class="data-container" v-for="(data, index) in temperatureData" :key="index">
      <table class="data-table">
        <tr>
          <th>{{ $t('content.timeLabel') }}：</th>
          <td>{{ data.time }}</td>
        </tr>
        <tr>
          <th>{{ $t('content.machineIdLabel') }}：</th>
          <td>{{ data.machineId }}</td>
        </tr>
        <tr>
          <th>{{ $t('content.equipmentLabel') }}：</th>
          <td>{{ PageLanguage(data.equipment) }}</td>
        </tr>
      </table>
      <br>
      <table class="data-table">
        <tr>
          <th>{{ $t('content.temperatureMessageLabel') }}：</th>
          <td :class="getMessageClass(data.TempdgmgMessage)">{{ PageLanguage(data.TempdgmgMessage) }}</td>
        </tr>
      </table>
      <table class="data-table">
        <thead>
          <th colspan="4">{{ $t('content.temperatureMonitoringLabel') }}</th>
        </thead>
        <tbody>
          <tr>
            <td class="monitorWidth" v-for="i in 4" :key="`tempMonitor${i}`">{{ $t('content.monitorLabel') }} {{ i }}</td>
          </tr>
          <tr>
            <td class="dataWidth" v-for="i in 4" :key="`tempData${i}`">{{ data['temp' + i] }} {{ $t('content.celsiusLabel') }}</td>
          </tr>
        </tbody>
      </table>
      <br><br>
    </div>
    <br>
  </div>
  <div v-else-if="dataType === '电流' || dataType ==='Current'">
    <h3><i class="fas fa-bolt"></i> {{ $t('content.currentDataTitle') }}</h3>
    <br>
    <div class="data-container" v-for="(data, index) in currentData" :key="index">
      <table class="data-table">
        <tr>
          <th>{{ $t('content.timeLabel') }}：</th>
          <td>{{ data.time }}</td>
        </tr>
        <tr>
          <th>{{ $t('content.machineIdLabel') }}：</th>
          <td>{{ data.machineId }}</td>
        </tr>
        <tr>
          <th>{{ $t('content.equipmentLabel') }}：</th>
          <td>{{ PageLanguage(data.equipment) }}</td>
        </tr>
      </table>
      <br>
      <table class="data-table">
        <tr>
          <th>{{ $t('content.currentMessageLabel') }}：</th>
          <td :class="getMessageClass(data.CurrentdgmgMessage)">{{ PageLanguage(data.CurrentdgmgMessage) }}</td>
        </tr>
      </table>
      <table class="data-table">
        <thead>
          <th colspan="4">{{$t('content.currentMonitoringLabel') }}</th>
        </thead>
        <tbody>
          <tr>
            <td class="monitorWidth" v-for="i in 4" :key="`currentMonitor${i}`">{{ $t('content.monitorLabel') }} {{ i }}</td>
          </tr>
          <tr>
            <td class="dataWidth" v-for="i in 4" :key="`currentData${i}`">{{ data['current' + i] }} {{ $t('content.ampereLabel') }}</td>
          </tr>
        </tbody>
      </table>
      <br><br>
    </div>
    <br>
  </div>
  <div v-else>
    <i class="fas fa-question-circle"></i>
    {{ isMobile ? $t('content.selectDataMessageMobile') : $t('content.selectDataMessage') }}
    <br><br>
  </div>
  <div v-if="dataType !== '选择设备' || dataType !== 'Choose Equipment'">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <div ref="tempChart" style="width: 100%; height: 300px;"></div>
        </div>
        <div class="col-md-6">
          <div ref="currentChart" style="width: 100%; height: 300px;"></div>
        </div>
      </div>
    </div>
  </div>
  <br><br>
</template>
  
<script>
  import * as echarts from 'echarts';
  export default {
    name:"Main_Content",
    props: {
      dataType: String,
      temperatureData: Array,
      currentData: Array,
      ChartTempX: Array,
      ChartTempY: Array,
      ChartCurrentX: Array,
      ChartCurrentY: Array,
      machineID: String,
      equipment: String,
    },
    data() {
      return {
        initial: true,
        isMobile: false,
      }
    },
    mounted() {
      const TempChart = echarts.getInstanceByDom(this.$refs.tempChart);
      const CurrentChart = echarts.getInstanceByDom(this.$refs.currentChart);

      if (this.ChartTempX.length > 0 && this.ChartCurrentX.length > 0 && TempChart && CurrentChart) {
        this.renderChart();
      }
      this.initial = false;
      this.checkMobileDevice();
    },
    watch: {
      dataType: {
        handler() {
          if (this.dataType === '选择设备' || this.dataType === 'Choose Equipment') {
            if (!this.initial) { this.DisposeChart(); }
          } else {
            this.DisposeChart();
            this.renderChart();
          }
        },
      },
      temperatureData:{
        handler() {
          this.LocalStore();
        },
        deep: true, 
      },
      currentData:{
        handler() {
          this.LocalStore();
        },
        deep: true, 
      },
      ChartTempX:{
        handler() {
          if (this.dataType === '选择设备' || this.dataType === 'Choose Equipment') {
            if (!this.initial) { this.DisposeChart(); }
          } else {
            this.DisposeChart();
            this.renderChart();
          }
        },
        deep: true,
      },
      ChartCurrentX:{
        handler() {
          if (this.dataType === '选择设备' || this.dataType === 'Choose Equipment') {
            if (!this.initial) { this.DisposeChart(); }
          } else {
            this.DisposeChart();
            this.renderChart();
          }
        },
        deep: true,
      }
    },
    methods: {
      checkMobileDevice() {
        if (window.innerWidth <= 768) {
          // Set isMobile to true if the screen width is less than or equal to 768 pixels (adjust this threshold as needed)
          this.isMobile = true;
        }
      },
      getMessageClass(message) {
        let messageClass = '';
        switch (message) {
          case '普通消息': 
            messageClass = 'normal-message';
            break;
          case  '控制消息': 
            messageClass = 'control-message';
            break;
          case '告警消息': 
            messageClass = 'warning-message';
            break;
          case '严重警告': 
            messageClass = 'critical-message';
            break;
          default:
            messageClass = ''; // Default class if no match is found
        }
        return messageClass;
      },
      renderChart() {
        const limit = 15;
        
        const TempX = [], TempY1 = [], TempY2 = [], TempY3 = [], TempY4 = [];
        for (let i = Math.max(0, this.ChartTempX.length - limit); i < this.ChartTempX.length; i++) {
          TempX.push(this.ChartTempX[i]);
          TempY1.push(this.ChartTempY[i][0]);
          TempY2.push(this.ChartTempY[i][1]);
          TempY3.push(this.ChartTempY[i][2]);
          TempY4.push(this.ChartTempY[i][3]);
        }

        const TempLatestData = {
          TempX: TempX.slice(-5), // Get the last 3 values of TempX.
          TempY1: TempY1.slice(-5), // Get the last 3 values of TempY1.
          TempY2: TempY2.slice(-5), // Get the last 3 values of TempY2.
          TempY3: TempY3.slice(-5), // Get the last 3 values of TempY3.
          TempY4: TempY4.slice(-5), // Get the last 3 values of TempY4.
        };

        if(this.initial === false) {
          localStorage.setItem(this.equipment + '_' + this.machineID + '_temp', JSON.stringify(TempLatestData));
        }

        const TempChart = echarts.init(this.$refs.tempChart);
        const TempOption = {
          title: {
            text: this.$i18n.t('content.temperatureChartTitle'),
            left: 'center',
          },
          legend: {  
            top: '10%',     
          },
          grid: {
            left: '5%',      // Left padding
            right: '5%',     // Right padding
            top: '30%',
            containLabel: true, // Ensure that labels (axis names, legends) are contained within the grid
          },
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            type: "category",
            data: TempX,
          },
          yAxis: {
            type: "value",
            nameLocation: 'start',
            axisLabel: {
              formatter: "{value} °C",
            },
          },
          series: [
          { name: this.$i18n.t('content.temperature1'), type: 'line', data: TempY1 },
          { name: this.$i18n.t('content.temperature2'), type: 'line', data: TempY2 },
          { name: this.$i18n.t('content.temperature3'), type: 'line', data: TempY3 },
          { name: this.$i18n.t('content.temperature4'), type: 'line', data: TempY4 },
        ],
        };
        TempChart.setOption(TempOption);

        const CurrentX = [], CurrentY1 = [], CurrentY2 = [], CurrentY3 = [], CurrentY4 = [];

        for (let i = Math.max(0, this.ChartCurrentX.length - limit); i < this.ChartCurrentX.length; i++) {
          CurrentX.push(this.ChartCurrentX[i]);
          CurrentY1.push(this.ChartCurrentY[i][0]);
          CurrentY2.push(this.ChartCurrentY[i][1]);
          CurrentY3.push(this.ChartCurrentY[i][2]);
          CurrentY4.push(this.ChartCurrentY[i][3]);
        }

        const CurrentLatestData = {
          CurrentX: CurrentX.slice(-5), // Get the last 3 values of CurrentX.
          CurrentY1: CurrentY1.slice(-5), // Get the last 3 values of CurrentY1.
          CurrentY2: CurrentY2.slice(-5), // Get the last 3 values of CurrentY2.
          CurrentY3: CurrentY3.slice(-5), // Get the last 3 values of CurrentY3.
          CurrentY4: CurrentY4.slice(-5), // Get the last 3 values of CurrentY4.
        };

        if(this.initial === false){
          localStorage.setItem(this.equipment + '_' + this.machineID + '_current', JSON.stringify(CurrentLatestData));
        }

        const CurrentChart = echarts.init(this.$refs.currentChart);
        const CurrentOption = {
          title: {
            text: this.$i18n.t('content.currentChartTitle'),
            left: 'center',
          },
          legend: { 
            top: '10%',     
          },
          grid: {
            left: '5%',      // Left padding
            right: '5%',     // Right padding
            top: '30%',
            containLabel: true, // Ensure that labels (axis names, legends) are contained within the grid
          },
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            type: "category",
            data: CurrentX,
          },
          yAxis: {
            type: "value",
            nameLocation: 'start',
            axisLabel: {
              formatter: "{value} A",
            },
          },
          series: [
          { name: this.$i18n.t('content.current1'), type: 'line', data: CurrentY1 },
          { name: this.$i18n.t('content.current2'), type: 'line', data: CurrentY2 },
          { name: this.$i18n.t('content.current3'), type: 'line', data: CurrentY3 },
          { name: this.$i18n.t('content.current4'), type: 'line', data: CurrentY4 },
        ],
        };
        CurrentChart.setOption(CurrentOption);
      },
      DisposeChart(){
        const TempChart = echarts.getInstanceByDom(this.$refs.tempChart);
        const CurrentChart = echarts.getInstanceByDom(this.$refs.currentChart);
        if(TempChart){ TempChart.dispose(); } 
        if(CurrentChart){ CurrentChart.dispose(); } 
      },
      LocalStore() {
        if (this.temperatureData.length > 0) {
          const lastTemperature = this.temperatureData[this.temperatureData.length - 1];
          localStorage.setItem(this.equipment + '_' + this.machineID + '_tempData', JSON.stringify(lastTemperature));
        }
        if (this.currentData.length > 0) {
          const lastCurrent = this.currentData[this.currentData.length - 1];
          localStorage.setItem(this.equipment + '_' + this.machineID + '_currentData', JSON.stringify(lastCurrent));
        }
      },
      PageLanguage(dataText){
        if (this.$i18n.locale === 'en'){
          switch(dataText){
            case '普通消息': dataText = 'Ordinary Message'; break;
            case '控制消息': dataText = 'Control Message'; break;
            case '告警消息': dataText = 'Alarm Message'; break;
            case '严重警告': dataText = 'Serious Warning'; break;
            case '沥青搅拌站': dataText = 'Asphalt Mixing Plant'; break;
            case '沥青料破碎': dataText = 'Asphalt Crushing'; break;
            case '温拌发泡设备': dataText = 'Warming Mixing Foaming'; break;
            case '骨料整形破碎': dataText = 'Aggregate Shaping Crushing'; break;
            case '周边设备': dataText = 'Peripheral Equipment'; break;
          } 
        }
        return dataText;
      }
    }
  };
</script>
  