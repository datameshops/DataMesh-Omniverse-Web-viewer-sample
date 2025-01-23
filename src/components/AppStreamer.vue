<template>
  <div class="app-streamer" :style="videoStyle">
    <div
      class="local-viewer"
      id="main-div"
      key="stream-canvas"
      :style="{
        visibility: state.streamReady ? 'visible' : 'visible',
      }"
    >
      <video key="video-canvas" id="remote-video" :tabindex="-1" autoplay playsinline muted></video>
      <audio id="remote-audio" muted></audio>
      <h3 style="visibility: hidden" id="message-display">...</h3>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {
  AppStreamer,
  type GFNConfig,
  type RagnarokConfig,
  type StreamEvent,
  type StreamProps,
} from '@nvidia/omniverse-webrtc-streaming-library'
import { onMounted, onUpdated, reactive, ref } from 'vue'
import { DASHBOARD_CONFIG } from '@/config/dashboard.config'

const {
  server = DASHBOARD_CONFIG.streamServer,
  onStarted = () => {},
  onFailed = (error: any) => {
    console.error(error)
  },
  onLoggedIn = (userId: string) => {
    console.info('Logged in as', userId)
  },
  handleCustomEvent = (event: any) => {
    console.info('Custom event', event)
  },
} = defineProps<{
  server?: string
  onStarted?: () => void
  onFailed?: (error: any) => void
  onLoggedIn?: (userId: string) => void
  handleCustomEvent?: (event: any) => void
}>()

interface AppStreamState {
  streamReady: boolean
}

const videoStyle = reactive({
  width: '100%',
  height: '100%',
})

const _requested = ref<boolean>(false)
const state = reactive<AppStreamState>({
  streamReady: false,
})

// Initialize the streamer on component mount
onMounted(() => {
  if (!_requested.value) {
    _requested.value = true

    let streamProps: StreamProps
    const streamSource: 'gfn' | 'direct' = 'direct'
    const streamConfig: RagnarokConfig | GFNConfig = {
      videoElementId: 'remote-video',
      audioElementId: 'remote-audio',
      authenticate: false,
      maxReconnects: 20,
      server,
      nativeTouchEvents: true,
      width: 1920,
      height: 1080,
      fps: 60,
      onUpdate: (message: StreamEvent) => _onUpdate(message),
      onStart: (message: StreamEvent) => _onStart(message),
      onCustomEvent: (message: any) => _onCustomEvent(message),
      onStop: (message: StreamEvent) => {
        console.log(message)
      },
      onTerminate: (message: StreamEvent) => {
        console.log(message)
      },
    }
    try {
      streamProps = { streamConfig, streamSource }
      AppStreamer.connect(streamProps)
        .then((result: StreamEvent) => {
          console.info(result)
        })
        .catch((error: StreamEvent) => {
          onFailed(error)
          console.error(error)
        })
    } catch (error) {
      onFailed(error)
      console.error(error)
    }
  }
})

// Handle component update
onUpdated(() => {})

// Handle stream start event
const _onStart = (message: any) => {
  if (message.action === 'start' && message.status === 'success' && !state.streamReady) {
    console.info('streamReady')
    state.streamReady = true
    onStarted()
  } else {
    // onFailed(message);
    console.error(message)
  }
}

const _onUpdate = (message: any) => {
  try {
    if (message.action === 'authUser' && message.status === 'success') {
      onLoggedIn(message.info)
    }
  } catch (error) {
    console.error(error)
  }
}

const _onCustomEvent = (message: any) => {
  console.info('Custom event', message)
  handleCustomEvent(message)
}

defineExpose({
  sendMessage: (message: any) => {
    console.info('Sending message', message)
    AppStreamer.sendMessage(message)
  },
  state,
})
</script>

<style lang="scss" scoped>
.app-streamer {
  position: relative;
  .gfn-viewer {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }
  .local-viewer {
    width: 100%;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
