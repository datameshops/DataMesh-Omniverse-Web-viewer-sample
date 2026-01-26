
import { useAccountStore } from '@/stores/account';
import mqtt from 'mqtt';
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
// Configure constants
export const APP_CONFIG = {
  OMNIVERSE: {
    NUCLEUS_IP: 'localhost',
    TOKEN:token,
    DEPlOY_CODE:'cn',
  },
  HEARTBEAT_INTERVAL: 5000,
} as const
