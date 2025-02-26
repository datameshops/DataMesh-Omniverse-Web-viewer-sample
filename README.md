# DataMesh Omniverse Web Viewer Sample Application

<p align="center">
  <img src="public/sample.jpg" width=100% />
</p>

This sample is a Web Viewer data visualization application based on the DataMesh digital twin platform and NVIDIA Omniverse. It demonstrates how to use the DataMesh digital twin platform with NVIDIA Omniverse to render digital twin scenes and visualize data in a web client.

This sample is built as a Vue application using the VueJS framework ([https://vuejs.org/](https://vuejs.org/)).

## Prerequisites

- Install Node.js and npm.
- Chromium browser.
- Install the [Omniverse Nucleus](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ).
- Install the [USD Viewer Streaming Application](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ).

## Service Configuration

Before running this sample application, you need to configure the following:

1. Open the [src/config/dashboard.config.ts](src/config//dashboard.config.ts) configuration file.

2. Find the `streamUsd` variable in `DASHBOARD_CONFIG` and set its value to the USD file address based on the [USD Viewer Streaming Application](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ).

3. Find the `streamServer` variable in `DASHBOARD_CONFIG` and set its value to the service address based on the [USD Viewer Streaming Application](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ).

4. Find the `sceneId` variable in `PANEL_CONFIG` and set its value to the scene ID based on the DataMesh digital twin platform (refer to the [USD Viewer Streaming Application](https://81biz.sharepoint.com/:o:/s/DataMeshDev/EjQ66QdSmNxBn8YBzOoXazABpth5pxqqnSgh0-gPSvpIMw?e=kso5oZ)).

```javascript
export const DASHBOARD_CONFIG = {
  streamServer: '192.168.19.211',
  streamUsd: 'omniverse://192.168.19.211/FactVerse/53e0a61bb71a4b1ebaf0055e19406cbf.usd',
  panelId: 'ba78fc18bb5ed047be1cb3c8fefff049',
}
```

## Running the Application

This section explains how to run this sample application locally in development mode.

1. Ensure that you meet the [Prerequisites](#Prerequisites)

2. Start the USD Viewer Streaming Application created based on the DataMesh digital twin platform.

3. Clone this sample to your local machine:

```
git clone https://github.com/datameshops/DataMesh-Omniverse-Web-viewer-sample.git
```

4. Navigate to the root directory of this sample application:

```
cd DataMesh-Omniverse-Web-viewer-sample
```

5. Install npm dependencies:

```bash
npm install
```

6. Run the following command to start the application:

```bash
npm run dev
```

Open a browser and visit http://localhost:8080/

## Web Client Development

This sample is built using the VueJS framework and employs NVIDIA Omniverse as the data visualization component. The digital twin scene data is transmitted via the MQTT protocol with DataMesh DFS. Once the data is received, it is visualized and displayed using Echarts.

### Component Library

The following components are primarily used in this sample application:

- [NVIDIA Omniverse](https://github.com/NVIDIA-Omniverse/web-viewer-sample): A component for data visualization.
- [MQTT.js](https://github.com/mqttjs/MQTT.js): A JavaScript client for the MQTT protocol.
- [Echarts](https://echarts.apache.org/zh/index.html): A component for visualizing charts.

### NVIDIA Omniverse

To embed Omniverse Viewer into the web client, you need to add `omniverse-webrtc-streaming-library` as a dependency to the project:

- Refer to the `@nvidia:registry` configuration in [.npmrc](.npmrc).
- Refer to the `dependencies` section in [package.json](package.json).

#### AppStreamer

The most important part of this example is the [./src/components/AppStreamer.vue](./src/components/AppStreamer.vue) file, which is based on the `omniverse-webrtc-streaming-library` and uses the `AppStreamer` class. `AppStreamer.vue` provides a reference implementation for initializing the stream and enabling bi-directional messaging between the web client and the Kit application.

#### Initialize the Stream

The `connect()` function of `AppStreamer` is used to initialize the stream and messaging. You need to provide a `streamConfig`object containing configuration settings, along with a set of functions to handle the messages.

#### Custom Messages

When using `AppStreamer` and custom messages, there are two key points to note:

- `AppStreamer.sendMessage()` is used to send custom messages.
- The stream configuration data passed to `AppStreamer` (`RagnarokConfig` or `GFNConfig`) allows you to register a handler for incoming messages via `onCustomEvent` ([view code example](./src/components/AppStreamer.vue#L65)).

#### Message Format

The message format between `AppStreamer` and the web client is a JSON object string containing `event_type` and `playload`. The structure of the message is as follows:

```typescript
{
    event_type: "myEvent",
    payload: {
        property_name  : value
    }
}
```

On the receiving end, the Kit application requires an extension to handle `myEvent` and its `payload`。The Kit application sends similar messages to the client for processing. Below, we explore how messages are used to open a USD scene in this solution.

#### Sending Custom Messages

Messages sent by `AppStreamer` are JSON strings. To ensure that your custom Kit extension based on `omni.kit.livestream.messaging` can process these messages, you need to follow the message format mentioned above.

Example:

```typescript
const message = {
  event_type: 'openStageRequest',
  payload: {
    url: `omniverse://127.0.0.1/FactVerse/53e0a61bb71a4b1ebaf0055e19406cbf.usd`, //Omniverse usd url
  },
}
```

Then, serialize the message object into a JSON string and send it using `AppStreamer.sendMessage()`.

```typescript
AppStreamer.sendMessage(JSON.stringify(message))
```

The [DashboardView.vue](src/views/DashboardView.vue#L55) file in this sample provides an example of sending messages.

#### Receiving Custom Messages

When using `AppStreamer.connect()` to register a custom event handler, you need to provide a function to process incoming messages. This function should receive a message object that contains both `event_type` and `payload`.

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

The [DashboardView.vue](src/views/DashboardView.vue#L77) file in this sample provides an example of handling messages.

## License

This project downloads and installs other third-party open-source software. Please review their license terms before using them.
