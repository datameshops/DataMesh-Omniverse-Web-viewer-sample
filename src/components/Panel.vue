<template>
  <!-- Left dashboard panel -->
  <div class="dashboard-card left-panel" v-loading="basePanelLoading">
    <!-- Hourly production -->
    <div class="dashboard-card-item">
      <div class="dashboard-title">Hourly Output</div>
      <div class="dashboard-card-content">
        <v-chart :option="barOptions" autoresize theme="datamesh-theme" style="height: 200px" />
      </div>
    </div>
    <!-- BPM -->
    <div class="dashboard-card-item">
      <div class="dashboard-title">Cycle Time</div>
      <div class="dashboard-card-content bpm-content">
        <div class="bpm-title">
          Average Cycle Time:
          <span>{{ basePanelData.CycleTime.averageCycleTime || 0 }}s</span>
        </div>
        <el-table
          :data="basePanelData.stationInfo.workerInfo"
          size="small"
          class="margin-top-8"
          stripe
        >
          <el-table-column prop="stationName" label="Workstation" align="center" />
          <el-table-column prop="currentCycleTime" label="Current Cycle Time" align="center">
            <template #default="scope"> {{ scope.row.currentCycleTime || 0 }}s </template>
          </el-table-column>
          <el-table-column prop="preCycleTime" label="Previous Cycle Time" align="center">
            <template #default="scope"> {{ scope.row.preCycleTime || 0 }}s </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- Hourly average production BPM -->
    <div class="dashboard-card-item">
      <div class="dashboard-title">Hourly Cycle Time</div>
      <div class="dashboard-card-content">
        <v-chart :option="lineOptions" autoresize theme="datamesh-theme" style="height: 180px" />
      </div>
    </div>
  </div>

  <!-- Right robot panel -->
  <div class="dashboard-card right-panel" v-show="currentRobotId !== ''" v-loading="robotLoading">
    <!-- Robot data details -->
    <div class="dashboard-card-item">
      <div class="robot-header">
        <div class="spacer"></div>
        <div class="close-btn" @click="onCloseRobotPanel"></div>
      </div>
      <div class="dashboard-title">Robot Data</div>
      <div class="dashboard-card-content">
        <el-descriptions v-if="robotData.Info" :column="1">
          <el-descriptions-item label="Robot Name">
            {{ robotData.Info?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="Equipment Status" v-if="robotData.Info?.equipmentStatus !== undefined">
            <span class="status">{{ EQUIPMENT_STATUS[robotData.Info?.equipmentStatus] }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Robot Serial Number">
            {{ robotData.Info?.serialNumber }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <!-- Telemetry information -->
    <div class="dashboard-card-item">
      <div class="dashboard-title">Telemetry Info</div>
      <div class="dashboard-card-content">
        <el-descriptions :column="1">
          <el-descriptions-item label="Operating Mode">
            {{ robotData.Data?.workingMode }}
          </el-descriptions-item>
          <el-descriptions-item label="Robot Status" v-if="robotData.Data?.robotStatus !== undefined">
            <span class="status">{{ ROBOT_STATUS[robotData.Data?.robotStatus] }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Current Active Program">
            {{ robotData.Data?.robotName }}
          </el-descriptions-item>
          <el-descriptions-item label="Operating Speed">
            {{ robotData.Data?.robotRate }}%
          </el-descriptions-item>
        </el-descriptions>
        <div class="robot-echart">
          <div class="robot-echart-content">
            <div class="robot-echart-title">Real-Time Temperature</div>
            <v-chart :option="TempBarOptions" autoresize theme="temperature-theme" style="height: 221px" />
          </div>
          <div class="robot-echart-content">
            <div class="robot-echart-title">Real-Time Current</div>
            <v-chart
              :option="currentBarOptions"
              autoresize
              theme="datamesh-theme"
              style="height: 221px"
            />
          </div>
      </div>
      </div>
    </div>
    <!-- Control cabinet -->
    <div class="dashboard-card-item">
      <div class="dashboard-title">Control Cabinet</div>
      <div class="dashboard-card-content">
        <el-descriptions :column="1">
          <el-descriptions-item label="Motherboard Temperature"> {{ robotData.PLC?.PCTemp }}℃ </el-descriptions-item>
          <el-descriptions-item label="Battery Status" v-if="robotData.PLC?.chargeStatus">
            {{ CHARGE_STATUS[robotData.PLC.chargeStatus] }}
          </el-descriptions-item>
          <el-descriptions-item label="CPU Usage">
            {{ robotData.PLC?.CPUUtility?.toFixed(2) }}%
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import VChart from 'vue-echarts'
import { use, registerTheme } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import theme from '@/config/echarts.theme'

import { GridComponent, TooltipComponent } from 'echarts/components'
import { computed } from 'vue'
import { CHARGE_STATUS, type BasePanelTy, type RobotTy } from '@/types/panel'
import { convertTime } from '@/utils/common'
import { ROBOT_STATUS } from '@/types/panel'
import { EQUIPMENT_STATUS } from '@/types/panel'
// import { ElDescriptions, ElDescriptionsItem, ElTable, ElTableColumn } from 'element-plus'

// Register echarts components
const temperatureTheme = theme;
use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent])
registerTheme('datamesh-theme', theme)
registerTheme('temperature-theme', {...temperatureTheme, color: ['rgba(4, 209, 255, 0.8)']})

const {
  basePanelData,
  basePanelLoading,
  currentRobotId,
  robotData,
  robotLoading,
  onCloseRobotPanel,
} = defineProps<{
  basePanelLoading: boolean
  basePanelData: BasePanelTy
  currentRobotId: string
  robotLoading: boolean
  robotData: RobotTy
  onCloseRobotPanel?: () => void
}>()

/**
 * Left dashboard panel
 */

// Hourly production chart options
const barOptions = computed(() => {
  const xAxisData: Array<any> = []
  const seriesData: Array<any> = []
  const HourCycleTime = basePanelData.averageHourCycleTime?.HourCycleTime
  if (HourCycleTime !== undefined) {
    for (const key in basePanelData.averageHourCycleTime?.HourCycleTime) {
      xAxisData.push(key)
      seriesData.push(basePanelData.averageHourCycleTime?.HourCycleTime[key])
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        return `<strong>${convertTime(
          parseInt(params[0].name),
        )}</strong><br/>JPH: ${params[0].value}`
      },
    },
    grid: {
      top: '10%',
      bottom: '15%',
      left: '10%',
      right: '0',
    },
    xAxis: {
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: seriesData,
        type: 'bar',
      },
    ],
  }
})

// Hourly average production BPM chart options
const lineOptions = computed(() => {
  const xAxisData: Array<any> = []
  const seriesData: Array<any> = []
  const HourOutput = basePanelData.averageHourOutput?.HourOutput
  if (HourOutput !== undefined) {
    for (const key in basePanelData.averageHourOutput?.HourOutput) {
      xAxisData.push(key)
      seriesData.push(basePanelData.averageHourOutput?.HourOutput[key])
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        return `<strong>${params[0].name }</strong><br/> ${params[0].value}min`
      },
    },
    grid: {
      top: '10%',
      bottom: '15%',
      left: '10%',
      right: '0',
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: true,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: seriesData,
        type: 'line',
        areaStyle: {
          // Adjust areaStyle to gradient effect
          gradient: true, // Need to enable gradient
          color: {
            type: 'linear', // Use linear gradient
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(4, 209, 255, 0.6)' }, // Gradient start color
              { offset: 1, color: 'rgba(4, 209, 255, 0)' }, // Gradient end color
            ],
          },
        },
      },
    ],
  }
})

/**
 * Right robot panel
 */

// Axis real-time temperature data
const TempBarOptions = computed(() => {
  const seriesData = [0, 0, 0, 0, 0, 0]
  if (robotData.Temp?.A1Temp) seriesData[0] = robotData.Temp?.A1Temp
  if (robotData.Temp?.A2Temp) seriesData[1] = robotData.Temp?.A2Temp
  if (robotData.Temp?.A3Temp) seriesData[2] = robotData.Temp?.A3Temp
  if (robotData.Temp?.A4Temp) seriesData[3] = robotData.Temp?.A4Temp
  if (robotData.Temp?.A5Temp) seriesData[4] = robotData.Temp?.A5Temp
  if (robotData.Temp?.A6Temp) seriesData[5] = robotData.Temp?.A6Temp
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        return `<strong>${params[0].name }</strong><br/> ${params[0].value}°C`
      },
    },
    grid: {
      top: '10px',
      bottom: '25px',
      left: '30px',
      right: '10px',
    },
    xAxis: {
      data: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: robotLoading ? [0, 0, 0, 0, 0, 0] : seriesData,
        type: 'bar',
      },
    ],
  }
})
// Axis real-time current data
const currentBarOptions = computed(() => {
  const seriesData = [0, 0, 0, 0, 0, 0]
  if (robotData.Current?.A1Current) seriesData[0] = robotData.Current?.A1Current
  if (robotData.Current?.A2Current) seriesData[1] = robotData.Current?.A2Current
  if (robotData.Current?.A3Current) seriesData[2] = robotData.Current?.A3Current
  if (robotData.Current?.A4Current) seriesData[3] = robotData.Current?.A4Current
  if (robotData.Current?.A5Current) seriesData[4] = robotData.Current?.A5Current
  if (robotData.Current?.A6Current) seriesData[5] = robotData.Current?.A6Current

  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        return `<strong>${params[0].name }</strong><br/> ${params[0].value}A`
      },
    },
    grid: {
      top: '10px',
      bottom: '25px',
      left: '30px',
      right: '10px',
    },
    xAxis: {
      data: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: robotLoading ? [0, 0, 0, 0, 0, 0] : seriesData,
        type: 'bar',
      },
    ],
  }
})
</script>
<style lang="scss" scoped>
.dashboard-card {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  // Left panel
  &.left-panel {
    left: 44px;
  }

  .dashboard-card-item {
    width: 326px;
    background-color: rgba(8, 59, 88, 0.55);
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 6px;
  }

  .dashboard-title {
    width: 291px;
    height: 37px;
    font-size: 1.5rem;
    line-height: 26px;
    padding-left: 25px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 1px 1px #001845;

    background: url('@/assets/dashboard/card-header-01-bg.png') no-repeat;
    background-size: 292px 21.5px;
    background-position: left bottom;
  }
  .dashboard-card-content {
    padding: 0 10px;

    .status {
      color: #00F6FF;
      font-weight: 600;
    }
  }

  .bpm-content {
    padding: 0 15px 15px;
    .bpm-title {
      line-height: 40px;
      color: #DFDFDF;
      font-size: 16px;
      padding-left: 20px;
      background: url('@/assets/dashboard/item-bg.png') no-repeat left center;
      background-size: 10px 10px;
      span {
        color: #ffffff;
        font-weight: bold;
      }
    }
    :deep(.el-table) {
      --el-table-bg-color: none;
      --el-table-tr-bg-color: none;
      --el-table-row-hover-bg-color: rgba(0, 217, 255, 0.1);
      --el-fill-color-lighter: var(--el-table-row-hover-bg-color);
      --el-table-header-bg-color: none;
      --el-table-border-color: none;
      --el-table-text-color: rgba(255, 255, 255, 0.8);

      margin-top: 0 !important;

      $table-border-image: linear-gradient(
        to right,
        rgba(0, 217, 255, 0),
        #00D9FF,
        rgba(0, 217, 255, 0)
      );

      // border
      .el-table__header-wrapper {
        position: relative;
        &::before,
        &::after {
          content: '';
          width: 100%;
          height: 1px;
          background-image: $table-border-image;
          position: absolute;
          left: 0;
        }
        &::before {
          top: 0;
        }
        &::after {
          bottom: 0;
        }
        tr {
          background-color: rgba(0, 217, 255, 0.2);
          .cell {
            color: #ffffff;
            line-height: 18px;
          }
        }
      }
      td.el-table__cell {
        border-bottom: none;
      }

      .el-table__inner-wrapper::before {
        background-image: $table-border-image;
      }

      // Table decoration
      &:before,
      &:after,
      .el-table__header th:first-child:before,
      .el-table__header th:last-child:before,
      .el-table__row td:first-child:before,
      .el-table__row td:last-child:before {
        content: '';
        width: 2px;
        height: 2px;
        background-color: #05b4ff;
        position: absolute;
      }

      &:before {
        top: 0;
        left: 0;
      }
      &:after {
        top: 0;
        right: 0;
      }
      .el-table__header th:first-child:before,
      .el-table__row td:first-child:before {
        bottom: 0;
        left: 0;
      }
      .el-table__header th:last-child:before,
      .el-table__row td:last-child:before {
        bottom: 0;
        right: 0;
      }
    }
  }

  // Right robot panel
  &.right-panel {
    right: 40px;
    .dashboard-card-item{
      width: 436px;
      padding: 18px 16px;
    }

    .dashboard-title {
      width: 403px;
      background: url('@/assets/dashboard/card-header-02-bg.png') no-repeat;
      background-size: 403px 21.5px;
      background-position: left bottom;
    }
    .dashboard-card-content {
      padding-top: 20px;
    }
  }
  .robot-header {
    display: flex;
    .close-btn {
      width: 17px;
      height: 17px;
      background: url('@/assets/dashboard/close-btn.png') center center no-repeat;
      background-size: 17px 17px;
      cursor: pointer;
    }
  }

  :deep(.el-descriptions) {
    --el-fill-color-blank: none;
    .el-descriptions__cell {
      padding-bottom: 0;
      line-height: 28px;
    }
    .el-descriptions__label,
    .el-descriptions__content {
      color: #ffffff;
    }
    .el-descriptions__label {
      font-weight: normal;
      line-height: 24px !important;
      height: 24px !important;
      padding-left: 18px;
      background: url('@/assets/dashboard/item-bg.png') no-repeat left center;
      background-size: 9px 9px;
    }
    .el-descriptions__content {
      font-weight: bold;
      font-size: 16px;
    }
  }

  .robot-echart {
    display: flex;
    margin-top: 20px;
    .robot-echart-content {
      .robot-echart-title {
        width: 100%;
        height: 30px;
        background: url('@/assets/dashboard/card-header-03-bg.png') no-repeat;
        background-position: left bottom;
        background-size: 240px 26px;

        color: #ffffff;
        padding-left: 24px;
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
      }
      width: 100%;
      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.spacer {
  flex: 1;
}
</style>
