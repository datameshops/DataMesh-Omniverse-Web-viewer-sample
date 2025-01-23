import axios from 'axios'
import qs from 'qs'
import { useAccountStore } from '@/stores/account'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { LANGUAGE } from '@/config'

interface RequestConfig {
  withCredentials?: boolean
  cancelToken?: any
  headers?: any
  url?: string
  method?: string
}

interface PendingRequest {
  conf: string
  func: () => void
}
const pending: PendingRequest[] = []
const removePending = (config: RequestConfig) => {
  for (let i = 0; i < pending.length; i++) {
    const item = pending[i]
    if (item.conf === config.url + '&' + config.method) {
      item.func()
      pending.splice(i, 1)
      i--
    }
  }
}

// Add a request interceptor
const CancelToken = axios.CancelToken
axios.interceptors.request.use(
  (config) => {
    removePending(config)
    if (config.url) {
      config.cancelToken = new CancelToken((c) => {
        pending.push({ conf: config.url + '&' + config.method, func: c })
      })
      if (config.url.indexOf('https:') == -1 && config.url.indexOf('http:') == -1) {
        const accountStore = useAccountStore()
        if (accountStore.token) {
          config.headers['Authorization'] = 'Bearer ' + accountStore.token
        }
        config.headers['x-dm-app'] = 'DcsWeb'
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    removePending(response.config)
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Post request
const poster = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'x-dm-app': 'DcsWeb',
  },
  transformRequest: [
    function (data) {
      return qs.stringify(data, { arrayFormat: 'repeat' })
    },
  ],
})
// Post request interceptor
poster.interceptors.request.use(
  (config) => {
    // Token processing
    const accountStore = useAccountStore()
    const token = accountStore.token
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Post json request
const posterJson = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'x-dm-app': 'DcsWeb',
  },
})
// Post json request interceptor
posterJson.interceptors.request.use(
  (config) => {
    // Token processing
    const accountStore = useAccountStore()
    const token = accountStore.token
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// response error message
function errorResponse(res: any, reject: any) {
  const accountStore = useAccountStore()
  const router = useRouter()
  const lang = LANGUAGE
  const errMsg = (res.data.msg_i18n && res.data.msg_i18n[lang]) || res.data.msg || 'err'
  switch (res.data.code) {
    case 10500026: // 10500026: User does not exist
    case 10500027: // 10500027: Invalid user credentials
    case 10500077: // 10500077: Login renewal
    case 10500065: // 10500065: License does not exist or expired
    case 10500062: // 10500062: This account hash no license permission
      ElMessage.error(errMsg)
      accountStore.userLogout()
      router.push('/login')
      break
    default:
      ElMessage.error(errMsg)
      break
  }
  reject(errMsg)
}

// Parse URL parameters
function parseUrlParams(url: string, data: any) {
  return url.replace(/(\$(\w*?)\$)/g, function (match, full, n1) {
    if (full === '$$') {
      return data
    } else if (data[n1] !== undefined) {
      const rs = data[n1]
      delete data[n1]
      return rs
    }
    return full
  })
}

export function requestControl(api: { url: string; method: string }, data = {}) {
  const url = parseUrlParams(api.url, data)
  switch (api.method.toLowerCase()) {
    case 'post':
      return new Promise((resolve, reject) => {
        poster({
          method: 'post',
          url: url,
          data: data,
          timeout: 15 * 1000,
        })
          .then((res) => {
            if (res.data.code === 0) {
              resolve(res.data.data)
            } else {
              errorResponse(res, reject)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    case 'json':
      return new Promise((resolve, reject) => {
        posterJson({
          method: 'post',
          url: url,
          data: data,
          timeout: 60 * 1000,
        })
          .then((res) => {
            if (res.data.code === 0) {
              resolve(res.data.data)
            } else {
              errorResponse(res, reject)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    case 'get':
    default:
      return new Promise((resolve, reject) => {
        axios({
          method: 'get',
          url: url,
          params: Object.assign(data, {
            dcs_request_unit: new Date().getTime(),
          }),
          timeout: 60 * 1000,
        })
          .then((res) => {
            if (res.data.code === 0) {
              resolve(res.data.data)
            } else {
              errorResponse(res, reject)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
  }
}
