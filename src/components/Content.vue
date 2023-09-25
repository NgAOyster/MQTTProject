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
          <br>
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
        <br>
      </div>      
      <div v-else>
        <i class="fas fa-question-circle"></i> 请选择需要监测的数据
      </div>
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
    },
    watch: {
      ChartTempX: {
        handler() {
          this.DisposeChart(true, false);
          this.renderTempChart();
        },
        deep: true, 
      },
      ChartCurrentX:{
        handler() {
          this.DisposeChart(false, true);
          this.renderCurrentChart();
        },
        deep: true,
      },
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
      renderTempChart() {
        const TempX = [], TempY1 = [], TempY2 = [], TempY3 = [], TempY4 = [];
        const limit = 20; // Set the limit to 20 data points

        for (let i = Math.max(0, this.ChartTempX.length - limit); i < this.ChartTempX.length; i++) {
          TempX.push(this.ChartTempX[i]);
          TempY1.push(this.ChartTempY[i][0]);
          TempY2.push(this.ChartTempY[i][1]);
          TempY3.push(this.ChartTempY[i][2]);
          TempY4.push(this.ChartTempY[i][3]);
        }
        const chart = echarts.init(this.$refs.tempChart);
        const option = {
          legend:{
            right: 10,
          },
          title: {
            text: "温度数据",
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
            axisLabel: {
              formatter: "{value} °C",
            },
          },
          series: [
            { name: '温度1', type: 'line', data: TempY1 },
            { name: '温度2', type: 'line', data: TempY2 },
            { name: '温度3', type: 'line', data: TempY3 },
            { name: '温度4', type: 'line', data: TempY4 },
          ],
        };
        chart.setOption(option);
      },
      renderCurrentChart() {
        const CurrentX = [], CurrentY1 = [], CurrentY2 = [], CurrentY3 = [], CurrentY4 = [];
        const limit = 20; // Set the limit to 20 data points

        for (let i = Math.max(0, this.ChartCurrentX.length - limit); i < this.ChartCurrentX.length; i++) {
          CurrentX.push(this.ChartCurrentX[i]);
          CurrentY1.push(this.ChartCurrentY[i][0]);
          CurrentY2.push(this.ChartCurrentY[i][1]);
          CurrentY3.push(this.ChartCurrentY[i][2]);
          CurrentY4.push(this.ChartCurrentY[i][3]);
        }
        const chart = echarts.init(this.$refs.currentChart);
        const option = {
          legend:{
            right: 10,
          },
          title: {
            text: "电流数据",
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
            axisLabel: {
              formatter: "{value} A",
            },
          },
          series: [
            { name: '电流1', type: 'line', data: CurrentY1 },
            { name: '电流2', type: 'line', data: CurrentY2 },
            { name: '电流3', type: 'line', data: CurrentY3 },
            { name: '电流4', type: 'line', data: CurrentY4 },
          ],
        };
        chart.setOption(option);
      },
      DisposeChart(DisposeTempChart, DisposeCurrentChart){
        const Existchart1 = DisposeTempChart ? echarts.getInstanceByDom(this.$refs.tempChart) : null;
        const Existchart2 = DisposeCurrentChart ? echarts.getInstanceByDom(this.$refs.currentChart) : null;
        if (Existchart1) { Existchart1.dispose(); }
        if (Existchart2) { Existchart2.dispose(); }
      }
    }
  };
  </script>
  