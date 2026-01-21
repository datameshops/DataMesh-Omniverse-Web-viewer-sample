/*
 * @Author: Gao
 * @Date: 2025-06-25 11:09:47
 * @LastEditors: Gao
 * @LastEditTime: 2026-01-21 10:03:52
 * @Description:
 */
// src/typings.d.ts
interface Window {
  DASHBOARD_CONFIG: {
    streamServer: string;
    sceneId:string;
    simulatedId?:string;
    panelId: string;
    // 可以根据需要添加更多属性
  };
}
