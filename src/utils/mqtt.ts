/*
 * @Author: Gao
 * @Date: 2025-02-25 21:39:46
 * @LastEditors: Gao
 * @LastEditTime: 2025-11-11 10:27:41
 * @Description:
 */
import { useAccountStore } from '@/stores/account';
import mqtt from 'mqtt'; // 仅导入默认导出
import { v4 as uuidv4 } from 'uuid';


  const accountStore = useAccountStore()
  const token = accountStore.token
  const userInfo = accountStore.userInfo
  const company = userInfo?.company
  const mqConnInfoList = company?.mqConnInfoList
  const mqConnInfo = mqConnInfoList?.[0]

  const voHttps=company.dfsDomain
export function useMqtt() {

  let client: mqtt.MqttClient
  if (mqConnInfo) {
    client = mqtt.connect(`${mqConnInfo.protocol}://${mqConnInfo.address}`, {
      username: token,
      clientId: `web-FactVerse-${uuidv4()}`,
    })
    const onClose = () => {
      client.removeListener('close', onClose)
    }
    client.on('close', onClose)
    return client
  }
}
// 配置常量
export const APP_CONFIG = {
  OMNIVERSE: {
    NUCLEUS_IP: 'localhost',
    SERVER_URL: voHttps,
    TOKEN:token,
  },
  HEARTBEAT_INTERVAL: 5000,
} as const
