import { ACCOUNT_TOKEN } from '@/config'
import router from '@/router'
import { useAccountStore } from '@/stores/account'
import { Local } from '@/utils/storage'

router.beforeEach(async (to, from, next) => {
  if (['/login'].includes(to.path)) {
    next()
  } else if (!Local.get(ACCOUNT_TOKEN)) {
    return next('/login?redirect=' + encodeURIComponent(to.path))
  } else {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const accountStore = useAccountStore()
      let userInfo: any = accountStore.userInfo
      if (!userInfo) {
        try {
          userInfo = await accountStore.getUserInfo()
          next({ ...to, replace: true })
        } catch (error) {
          console.log(error)
          accountStore.clearToken()
          next('/login')
        }
      } else {
        next()
      }
    }
  }
})
