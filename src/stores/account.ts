import { defineStore } from 'pinia'
import { ACCOUNT_REFRESH_TOKEN, ACCOUNT_TOKEN } from '@/config'
import { Local } from '@/utils/storage'
import { accountLoginAPI, checkUserAPI, getUserInfoAPI, logoutAPI } from '@/api/account'
import type { LoginTy, UserInfoTy } from '@/types'

export const useAccountStore = defineStore('account', {
  state: () => {
    return {
      token: Local.get(ACCOUNT_TOKEN) || '',
      userInfo: null as UserInfoTy,
      tenant: null as any,
    }
  },
  actions: {
    setToken(token: string) {
      this.$patch((state) => {
        state.token = token
      })
      Local.set(ACCOUNT_TOKEN, token)
    },
    clearToken() {
      this.$patch((state) => {
        state.token = ''
      })
      Local.remove(ACCOUNT_TOKEN)
      Local.remove(ACCOUNT_REFRESH_TOKEN)
      this.clearUserInfo()
    },
    setUserInfo(user: UserInfoTy) {
      this.$patch((state) => {
        state.userInfo = user
        if (user?.company) {
          state.tenant = user.company
        }
      })
    },
    clearUserInfo() {
      this.$patch((state) => {
        state.userInfo = null
        state.tenant = null
      })
    },
    // User sign in
    async userLogin(params: LoginTy<string | number>): Promise<any> {
      return new Promise((resolve, reject) => {
        accountLoginAPI({
          ...params,
        })
          .then((res: any) => {
            this.setToken(res.token as string)
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // User sign out
    userLogout() {
      return new Promise((resolve, reject) => {
        try {
          logoutAPI().then((res) => {
            this.clearToken()
            resolve(res)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    //Check user name
    checkUserName(params: LoginTy<string | number>) {
      return new Promise((resolve, reject) => {
        checkUserAPI(params)
          .then((res: any) => {
            resolve(res)
          })
          .catch((error: any) => {
            reject(error.data || error)
          })
      })
    },
    // User information
    getUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfoAPI({})
          .then((res) => {
            this.setUserInfo(res)
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
  },
})
