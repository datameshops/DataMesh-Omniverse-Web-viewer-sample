
/**
 * src/typings.d.ts
 * Additional attributes can be added as needed
 * */
interface Window {
  DASHBOARD_CONFIG: {
    streamServer: string;
    sceneId:string;
    simulatedId?:string;
    panelId: string;
  };
}
