<template>
  <!-- Left dashboard panel -->
  <div class="dashboard-card left-panel" v-loading="basePanelLoading">
    <!-- Hourly production -->
    <div class="data-panel-title">每小时产量</div>
    <div class="dashboard-card-content">
      <v-chart :option="barOptions" autoresize theme="liauto-theme" style="height: 140px" />
    </div>
    <!-- BPM -->
    <div class="data-panel-title">节拍</div>
    <div class="dashboard-card-content bpm-content">
      <div class="bpm-title">
        平均节拍:
        <span>{{ basePanelData.CycleTime.averageCycleTime || 0 }}s</span>
      </div>
      <el-table
        :data="basePanelData.stationInfo.workerInfo"
        size="small"
        class="margin-top-8"
        stripe
      >
        <el-table-column prop="stationName" label="工位" align="center" />
        <el-table-column prop="currentCycleTime" label="当前节拍" align="center">
          <template #default="scope"> {{ scope.row.currentCycleTime || 0 }}s </template>
        </el-table-column>
        <el-table-column prop="preCycleTime" label="前车节拍" align="center">
          <template #default="scope"> {{ scope.row.preCycleTime || 0 }}s </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- Hourly average production BPM -->
    <div class="data-panel-title">每小时平均生产节拍</div>
    <div class="dashboard-card-content">
      <v-chart :option="lineOptions" autoresize theme="liauto-theme" style="height: 140px" />
    </div>
  </div>

  <!-- Right robot panel -->
  <div class="dashboard-card right-panel" v-show="currentRobotId !== ''" v-loading="robotLoading">
    <div class="robot-header">
      机械臂数据详情
      <div class="spacer"></div>
      <div class="close-btn" @click="onCloseRobotPanel"></div>
    </div>
    <!-- Robot data details -->
    <el-descriptions v-if="robotData.Info" :column="2">
      <el-descriptions-item label="机器人名称">
        {{ robotData.Info?.name }}
      </el-descriptions-item>
      <el-descriptions-item label="设备状态" v-if="robotData.Info?.equipmentStatus !== undefined">
        {{ EQUIPMENT_STATUS[robotData.Info?.equipmentStatus] }}
      </el-descriptions-item>
      <el-descriptions-item label="机器人序列号">
        {{ robotData.Info?.serialNumber }}
      </el-descriptions-item>
    </el-descriptions>
    <!-- Telemetry information -->
    <div class="robot-title">遥测信息</div>
    <el-descriptions :column="2">
      <el-descriptions-item label="工作模式">
        {{ robotData.Data?.workingMode }}
      </el-descriptions-item>
      <el-descriptions-item label="机器人状态" v-if="robotData.Data?.robotStatus !== undefined">
        {{ ROBOT_STATUS[robotData.Data?.robotStatus] }}
      </el-descriptions-item>
      <el-descriptions-item label="当前激活程序名称">
        {{ robotData.Data?.robotName }}
      </el-descriptions-item>
      <el-descriptions-item label="程序倍率">
        {{ robotData.Data?.robotRate }}%
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions :column="1">
      <el-descriptions-item label="各轴实时温度"> </el-descriptions-item>
      <el-descriptions-item label="各轴实时电流"> </el-descriptions-item>
    </el-descriptions>
    <div class="robot-echart">
      <div class="robot-echart-content">
        <el-descriptions :column="1">
          <el-descriptions-item label="各轴实时温度"> </el-descriptions-item>
        </el-descriptions>
        <v-chart :option="TempBarOptions" autoresize theme="liauto-theme" style="height: 140px" />
      </div>
      <div class="robot-echart-content">
        <el-descriptions :column="1">
          <el-descriptions-item label="各轴实时电流"> </el-descriptions-item>
        </el-descriptions>
        <v-chart
          :option="currentBarOptions"
          autoresize
          theme="liauto-theme"
          style="height: 140px"
        />
      </div>
    </div>
    <!-- Control cabinet -->
    <div class="robot-title">控制柜</div>
    <el-descriptions :column="2">
      <el-descriptions-item label="PC主板温度"> {{ robotData.PLC?.PCTemp }}℃ </el-descriptions-item>
      <el-descriptions-item label="电池状态" v-if="robotData.PLC?.chargeStatus">
        {{ CHARGE_STATUS[robotData.PLC.chargeStatus] }}
      </el-descriptions-item>
      <el-descriptions-item label="PC CPU使用率">
        {{ robotData.PLC?.CPUUtility?.toFixed(2) }}%
      </el-descriptions-item>
    </el-descriptions>
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
use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent])
registerTheme('liauto-theme', theme)

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
      bottom: '20%',
      left: '12%',
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
    },
    grid: {
      top: '10%',
      bottom: '20%',
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
              { offset: 0, color: 'rgba(74, 130, 234, 0.8)' }, // Gradient start color
              { offset: 1, color: 'rgba(74, 130, 234, 0.0)' }, // Gradient end color
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

  width: 280px;
  background-color: rgba(4, 18, 48, 0.9);
  border: 1px #2194ff solid;
  padding: 10px;

  // Left panel
  &.left-panel {
    left: 40px;
  }
  .data-panel-title {
    font-size: 1.5rem;
    line-height: 28px;
    height: 38px;
    padding: 10px 20px 0;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 1px 1px #001845;

    background: url('@/assets/dashboard/card-header-bg.png') no-repeat;
    background-position: center bottom;
  }
  .dashboard-card-content {
    padding: 0 10px;
  }

  .bpm-content {
    padding: 0 15px 15px;
    .bpm-title {
      line-height: 40px;
      color: #ffffff;
      font-size: 16px;
      padding-left: 20px;
      background: url('@/assets/dashboard/item-bg.png') no-repeat left center;
      background-size: 10px 10px;
      span {
        color: #ffae3f;
        font-weight: bold;
      }
    }
    :deep(.el-table) {
      --el-table-bg-color: none;
      --el-table-tr-bg-color: none;
      --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.1);
      --el-fill-color-lighter: var(--el-table-row-hover-bg-color);
      --el-table-header-bg-color: none;
      --el-table-border-color: none;
      --el-table-text-color: rgba(255, 255, 255, 0.8);

      margin-top: 0 !important;

      $table-border-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        #ffffff,
        rgba(255, 255, 255, 0)
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
          background-color: rgba(114, 114, 114, 0.2);
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
    width: 460px;
    padding: 16px 16px 24px;
  }
  .robot-header {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    line-height: 32px;
    font-weight: bold;
    color: #ffffff;
    .close-btn {
      width: 24px;
      height: 24px;
      background: url('@/assets/dashboard/close-btn.png') center center no-repeat;
      background-size: 24px 24px;
      cursor: pointer;
    }
  }

  .robot-title {
    margin-top: 10px;
    margin-bottom: 2px;
    font-size: 1.25rem;
    line-height: 32px;
    font-weight: bold;
    color: #ffffff;
    position: relative;
    &::after {
      content: '';
      width: 100%;
      height: 2px;
      background-image: linear-gradient(to right, rgba(25, 159, 255, 0.5), rgba(25, 159, 255, 0));
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }

  :deep(.el-descriptions) {
    --el-fill-color-blank: none;
    .el-descriptions__cell {
      padding-bottom: 0;
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
      background-size: 10px 10px;
    }
    .el-descriptions__content {
      font-weight: bold;
      font-size: 16px;
    }
  }

  .robot-echart {
    display: flex;
    .robot-echart-content {
      width: 100%;
      &:first-child {
        margin-right: 20px;
      }
    }
  }
}

.spacer {
  flex: 1;
}
</style>
