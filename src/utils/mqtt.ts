import { useAccountStore } from '@/stores/account'
import mqtt from 'mqtt' // 仅导入默认导出
import { v4 as uuidv4 } from 'uuid'

export function useMqtt() {
  const accountStore = useAccountStore()
  const token = accountStore.token
  const userInfo = accountStore.userInfo
  const company = userInfo?.company
  const mqConnInfoList = company?.mqConnInfoList
  const mqConnInfo = mqConnInfoList?.[0]

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
