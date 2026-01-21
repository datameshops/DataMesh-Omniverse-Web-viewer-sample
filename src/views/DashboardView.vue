<template>
  <div
    class="viewer-container"
    v-loading="state.streamLoading"
    element-loading-text="Scene loading..."
  >
    <AppStreamer
      :handle-custom-event="handleCustomEvent"
      :on-started="onStarted"
      :on-failed="onFialed"
      ref="appStreamerRef"
    >
      <div class="dashboard-header">
        <span>Welding Workshop</span>
      </div>
      <template v-if="state.mqttConnected && !state.streamLoading">
        <DashboardPanel
          :base-panel-data="basePanelData"
          :base-panel-loading="basePanelLoading"
          :currentRobotId="currentRobotId"
          :robot-data="robotData"
          :robot-loading="robotLoading"
          @close-robot-panel="handleCloseRobotPanel"
        />
      </template>
    </AppStreamer>
  </div>
</template>
<script lang="ts" setup>
import { ElMessage, type MessageParamsWithType } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppStreamer from '@/components/AppStreamer.vue'
import { useAccountStore } from '@/stores/account'
import type { AppStreamMessageType } from '@/types/appStream'
import type { BasePanelTy, RobotTy } from '@/types/panel'
import { APP_CONFIG, useMqtt } from '@/utils/mqtt'
import mqtt from 'mqtt'
import DashboardPanel from '../components/Panel.vue'
const state = ref<{
  streamLoading?: boolean
  streamReady?: boolean
  mqttConnected: boolean
}>({
  streamLoading: true,
  streamReady: false,
  mqttConnected: false,
})

/**
 * Omniverse
 */
const appStreamerRef = ref<InstanceType<typeof AppStreamer>>()

// Connection to Omniverse service successful
const onStarted = () => {
  state.value.streamReady = appStreamerRef.value?.state.streamReady
  // Send message to Omniverse server
  initOVsetup()
}

// setAdaptorConfigRequest message to Omniverse server
const initOVsetup = () => {
  const settings_message: AppStreamMessageType = {
    event_type: 'setAdaptorConfigRequest',
    payload: {
      token: APP_CONFIG.OMNIVERSE.TOKEN,
      account_id: '',
      password: '',
      nucleus_ip: APP_CONFIG.OMNIVERSE.NUCLEUS_IP,
      server_url: APP_CONFIG.OMNIVERSE.SERVER_URL,
    },
  }
  appStreamerRef.value?.sendMessage(JSON.stringify(settings_message))
}

// Connection to Omniverse service failed
const onFialed = (err: MessageParamsWithType) => {
  state.value.streamLoading = false
  state.value.streamReady = false
  ElMessage.error(err)
}

// Handle custom event from Omniverse server
const handleCustomEvent = (event: AppStreamMessageType) => {
  if (event.event_type === 'setAdaptorConfigResponse') {
    // Open FactVerse scene
    const open_message: AppStreamMessageType = {
      event_type: 'openDTSceneRequest',
      payload: {
        scene_id: window.DASHBOARD_CONFIG.sceneId,
        record_id: window.DASHBOARD_CONFIG.simulatedId,
      },
    }
    appStreamerRef.value?.sendMessage(JSON.stringify(open_message))
  }
  // Initialize FactVerse scene openedStageResult
  if (event.event_type === 'openAdaptorResponse') {
    // Initialize FactVerse scene successful
    if (event.payload.result === 'success') {
      state.value.streamLoading = false
      // Subscribe Panel Data to MQTT topic
      if (state.value.mqttConnected) {
        basePanelLoading.value = true
        onSubscribe(topics.value.basePanel)
      }
    } else if (event.payload.result === 'error') {
      ElMessage.error('Initialize FactVerse scene failed')
    }
  }

  // Click on the screen to select a robot
  if (event.event_type === 'stageSelectionChanged') {
    currentRobotId.value = event.payload.dt_id
    robotLoading.value = true
    onSubscribe(topics.value.robot)
  }
}

/**
 * MQTT
 */
const accountStore = useAccountStore()
const topics = computed(() => {
  return {
    basePanel: `/DFS/${accountStore.tenant.id}/${window.DASHBOARD_CONFIG.panelId}`, // Panel topic
    robot: `/DFS/${accountStore.tenant.id}/${currentRobotId.value}`, // Robot topic
  }
})
// connect MQTT
const mqttClient: mqtt.MqttClient | any = useMqtt()
let subscribeTopics = reactive<Array<string>>([])

// Initialize MQTT connection
const initMqtt = () => {
  if (!mqttClient) return
  mqttClient
    ?.on('connect', () => {
      state.value.mqttConnected = true
    })
    .on('error', (err: any) => {
      console.error('mqtt error', err)
      state.value.mqttConnected = false
      mqttClient.end()
    })

  mqttClient?.on('message', (topic: any, payload: { toString: () => string }) => {
    const data: any = JSON.parse(payload.toString())
    switch (topic) {
      // Base panel data
      case topics.value.basePanel:
        formatPanelData(basePanelData, data)
        basePanelLoading.value = false
        break
      case topics.value.robot:
        formatPanelData(robotData, data)
        robotLoading.value = false
        break
      default:
    }
  })
}
// Subscribe to a new topic if not already subscribed
const onSubscribe = (topic: string) => {
  if (subscribeTopics.includes(topic)) return
  subscribeTopics.push(topic)
  mqttClient?.subscribe(topic, (err: any) => {
    if (err) {
      console.error(err)
    }
  })
}
// Disconnect MQTT connection when the component is destroyed
onBeforeUnmount(() => {
  mqttClient?.end()
  state.value.mqttConnected = false
})
// Connect MQTT when the component is mounted
onMounted(() => {
  initMqtt()
})

/**
 * Dashboard Panel
 */
const basePanelLoading = ref(true)
const basePanelData = reactive<BasePanelTy>({
  averageHourCycleTime: {},
  stationInfo: {
    workerInfo: [{ currentCycleTime: 0, preCycleTime: 0, stationName: '' }],
  },
  CycleTime: {},
  averageHourOutput: {},
})

const currentRobotId = ref<string>('')
const robotLoading = ref(true)
const robotData = reactive<RobotTy>({
  Info: {},
  Data: {},
  PLC: {},
  Temp: {},
  Current: {},
})

const resetRobotData = () => {
  robotData.Info = {}
  robotData.Data = {}
  robotData.PLC = {}
  robotData.Temp = {}
  robotData.Current = {}
}

// Format panel data
const formatPanelData = (sourceData: any, data: any) => {
  for (const key in data) {
    if (key.includes('|')) {
      try {
        const [o1, o2] = key.split('|')
        if (sourceData[o1] !== undefined) {
          if (['Temp', 'Current'].includes(o1)) {
            sourceData[o1][o2] = parseFloat(data[key].toFixed(2))
          } else if (['stationInfo'].includes(o1)) {
            sourceData[o1][o2] = JSON.parse(data[key])
          } else {
            sourceData[o1][o2] = data[key]
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}

const handleCloseRobotPanel = () => {
  resetRobotData()
  // Unsubscribe from the robot topic
  if (currentRobotId.value != '') mqttClient?.unsubscribe(topics.value.robot)
  // Remove the corresponding data from subscribeTopics
  subscribeTopics = subscribeTopics.filter((topic) => topic !== topics.value.robot)
  currentRobotId.value = ''
}
</script>
<style lang="scss" scoped>
.viewer-container {
  width: 100vw;
  height: 100vh;
  background-color: #000000;
}

.dashboard-header {
  width: 100%;
  height: 80px;
  line-height: 54px;
  background-image: url('@/assets/dashboard/factverse-header.png');
  background-size: 1827px 80px;
  background-position: center 0;
  background-repeat: no-repeat;
  position: absolute;
  top: 0;
  pointer-events: none;

  text-align: center;
  span {
    color: #ffffff;
    font-size: 30px;
    font-weight: 600;
    padding-left: 15px;
  }
}
</style>
