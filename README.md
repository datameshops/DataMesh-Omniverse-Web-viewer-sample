# DataMesh Omniverse Web Viewer Sample Application

此示例是一个基于 DataMesh 数字孪生平台 与 NVIDIA Omniverse 的 Web Viewer 数据可视化应用。该示例演示了在Web客户端如何使用 DataMesh 数字孪生平台与 NVIDIA Omniverse 渲染数字孪生场景并进行数据可视化。

此示例基于VueJS框架(https://vuejs.org/)构建的Vue应用程序。

## 前置条件

- 安装 Node.js 和 npm。
- Chromium 浏览器。
- 安装[Nucleus 资源引擎服务](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)
- 安装 [USD Viewer推流服务](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)

## 服务配置

本示例程序在运行前需进行以下的配置：

1. 打开 [src/config/dashboard.config.ts](src/config//dashboard.config.ts) 配置文件。

2. 找到 `DASHBOARD_CONFIG`的`streamUsd` 变量，并将其值设置为基于[USD Viewer服务](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)的USD文件地址。

3. 找到 `DASHBOARD_CONFIG`的`streamServer` 变量，并将其值设置为基于[USD Viewer服务](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)的服务地址。

4. 找到`PANEL_CONFIG`的`sceneId`变量，并将其值设置为基于 DataMesh 数字孪生平台的场景 ID（参考[USD Viewer服务](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)）。

```javascript
export const DASHBOARD_CONFIG = {
  streamServer: '192.168.19.211',
  streamUsd: 'omniverse://192.168.19.211/FactVerse/53e0a61bb71a4b1ebaf0055e19406cbf.usd',
  panelId: 'ba78fc18bb5ed047be1cb3c8fefff049',
}
```

## 运行程序

本章节介绍如何在本地使用开发模式运行本示例程序。

1. 确保满足[前置条件](#前置条件)

2. 启动基于DataMesh数字孪生创建的[USD Viewer服务](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)的应用程序。

3. 克隆本示例至本地:

```
git clone https:xxx
```

4. 进到本示例程序的根目录

```
cd web-viewer-sample
```

5. 安装npm依赖

```bash
npm install
```

6. 然后，运行以下命令启动程序：

```bash
npm run dev
```

打开浏览器，访问 http://localhost:8080/

## Web客户端开发

此示例基于VueJS框架构建，并使用了 NVIDIA Omniverse 作为数据可视化组件，数字孪生场景数据使用MQTT协议与DataMesh DFS服务进行传输，接收到数据后通过Echarts可视化图表呈现来自DataMesh数字孪生平台的场景数据。

### 组件库

本示例程序中，主要使用了以下组件：

- [NVIDIA Omniverse](https://github.com/NVIDIA-Omniverse/web-viewer-sample)：用于数据可视化的组件。
- [MQTT.js](https://github.com/mqttjs/MQTT.js)：用于MQTT协议的JavaScript客户端。
- [Echarts](https://echarts.apache.org/zh/index.html)：用于可视化图表的组件。

### NVIDIA Omniverse

要将 Omniverse Viewer 嵌入到Web客户端，您需要将 `omniverse-webrtc-streaming-library`作为依赖项加入到项目中：

- 请参考 [.npmrc](.npmrc) 的 `@nvidia:registry` 配置。
- 请参考 [package.json](package.json) 的 `dependencies` 部分

#### AppStreamer

The most important part of this sample is the [./src/components/AppStreamer.vue](./src/components/AppStreamer.vue) file and its
use of the `AppStreamer` class imported from the `omniverse-webrtc-streaming-library`.
The `AppStreamer` is used for any implementation and `AppStreamer.vue` is a reference implementation
for initializing the stream and providing bi-directional messaging between the front end client
and the Kit application.

### Initialize the Stream

The `AppStreamer`’s `connect()` function initializes the streaming and messaging. Here you provide a
`streamConfig` object with configuration settings and a set of functions to handle messages.

### Custom Messages with AppStreamer

There are two critical things to recognize when working with AppStreamer and custom messages:

- `AppStreamer.sendMessage()` lets you send a custom message.
- The stream config data that's passed to the `AppStreamer` (`RagnarokConfig` or `GFNConfig`) lets you register a handler for incoming messages via `onCustomEvent` (view code example [here](./src/components/AppStreamer.vue#L65)).

#### Message Format

All custom messages exchanged between the front end client and the streamed Omniverse Kit application follows the same format:
an object with properties `event_type` and `payload` that is JSON stringified prior to being sent off.

```typescript
{
    event_type: "myEvent",
    payload: {
        property_name  : value
    }
}
```

On the receiving end, the Omniverse Kit application will need an Extension that handles `myEvent` and it's `payload`. The Kit
application sends similar messages for this client to handle. Below we explore how messages are used in this solution for
opening a USD stage,

#### Send a Custom Message

Messages sent by `AppStreamer` are strings. To make a message usable by your custom Kit Extension based on
`omni.kit.livestream.messaging` usage you’ll need to comply with the message format stated above.
A practical and easy to read approach to do this is to first create an object:

```typescript
const message = {
  event_type: 'openStageRequest',
  payload: {
    url: `omniverse://127.0.0.1/FactVerse/53e0a61bb71a4b1ebaf0055e19406cbf.usd`, //Omniverse usd url
  },
}
```

Then use json to stringify the message object and ask AppStreamer to send it:

```typescript
AppStreamer.sendMessage(JSON.stringify(message))
```

This sample's [DashboardView.vue](src/views/DashboardView.vue#L55) shows many examples of sending messages.

#### Receive a Custom Message

The function registered for custom events with `AppStreamer.connect()` should expect the same message object
structure used to send messages.

```typescript
const handleCustomEvent (event: any): void {
  // Initialize FactVerse scene
  if (event.event_type === 'openedStageResult') {
    // Initialize FactVerse scene successful
    if (event.payload.result === 'success') {
      console.log('FactVerse scene initialized successfully')
    }
  }
}
```

This sample's [DashboardView.vue](src/views/DashboardView.vue#L77) has a `handleCustomEvent` that shows many examples of handling messages.

## 许可证

此项目将下载并安装其他第三方开源软件项目。在使用这些开源项目之前，请查看其许可条款。
