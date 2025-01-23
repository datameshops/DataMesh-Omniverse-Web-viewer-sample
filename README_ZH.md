# DataMesh Omniverse Web Viewer Sample Application

<p align="center">
  <img src="public/sample.jpg" width=100% />
</p>

此示例是一个基于 DataMesh 数字孪生平台 与 NVIDIA Omniverse 的 Web Viewer 数据可视化应用。该示例演示了在Web客户端如何使用 DataMesh 数字孪生平台与 NVIDIA Omniverse 渲染数字孪生场景并进行数据可视化。

此示例基于VueJS框架([https://vuejs.org/](https://vuejs.org/))构建的Vue应用程序。

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

这个示例中最重要的部分是 [./src/components/AppStreamer.vue](./src/components/AppStreamer.vue) 文件，该文件基于 `omniverse-webrtc-streaming-library` 库，并使用了 `AppStreamer` 类。`AppStreamer.vue` 提供了一个用于初始化流并实现 Web 客户端与 Kit 应用程序之间双向消息传递的参考实现。

#### 初始化流

`AppStreamer`的`connect()`函数用于初始化流和消息传递。你需要提供一个包含配置设置的`streamConfig`对象以及一组用于处理消息的函数。

#### 自定义消息

在使用 AppStreamer 和自定义消息时，需要注意以下两个关键点：

- `AppStreamer.sendMessage()` 用于发送自定义消息。
- 传递给 `AppStreamer` 的流配置数据（`RagnarokConfig` 或 `GFNConfig`）允许你通过 `onCustomEvent` 注册一个处理传入消息的处理器 ([查看代码示例](./src/components/AppStreamer.vue#L65)).

#### 消息格式

`AppStreamer` 与 Web客户端之间的消息格式为包含 `event_type`和`playload`的 JSON 对象字符串。 消息的结构如下：

```typescript
{
    event_type: "myEvent",
    payload: {
        property_name  : value
    }
}
```

在接收端，Kit应用程序需要一个扩展来处理`myEvent`和它的`payload`。Kit应用程序发送类似的消息给客户端来处理。下面我们探索如何在这个解决方案中使用消息打开USD场景。

#### 发送自定义消息

`AppStreamer` 发送的消息为JSON字符串，为了让自定义的Kit扩展基于`omni.kit.livestream.messaging`的使用，需要遵循上述消息格式。

示例：

```typescript
const message = {
  event_type: 'openStageRequest',
  payload: {
    url: `omniverse://127.0.0.1/FactVerse/53e0a61bb71a4b1ebaf0055e19406cbf.usd`, //Omniverse usd url
  },
}
```

然后将消息对象序列化为JSON字符串，并使用`AppStreamer.sendMessage()`发送消息。

```typescript
AppStreamer.sendMessage(JSON.stringify(message))
```

此示例的[DashboardView.vue](src/views/DashboardView.vue#L55)文件提供了发送消息的示例。

#### 接收自定义消息

使用`AppStreamer.connect()`注册自定义事件处理器时，需要提供一个处理传入消息的函数。该函数需要接收一个包含`event_type`和`payload`的消息对象。

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

此示例的[DashboardView.vue](src/views/DashboardView.vue#L77)文件提供了处理消息的示例。

## 许可证

此项目将下载并安装其他第三方开源软件项目。在使用这些开源项目之前，请查看其许可条款。
