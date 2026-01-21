
import { requestControl } from '@/utils/request'
import type { ObjTy } from '@/types'

// Login API
export function accountLoginAPI(data: ObjTy) {
  return requestControl(
    {
      url: '/api/v6/auth/login',
      method: 'json',
    },
    data,
  )
}
// Logout API
export function logoutAPI() {
  return requestControl(
    {
      url: '/api/v6/auth/logout',
      method: 'post',
    },
    {},
  )
}
// Check user account API
export function checkUserAPI(data?: ObjTy) {
  return requestControl(
    {
      url: '/api/v6/auth/checkUserNameAndPassword',
      method: 'json',
    },
    data,
  )
}

// Get user information API
export function getUserInfoAPI(data: ObjTy) {
  return requestControl(
    {
      url: '/api/v6/auth/user/userinfo',
      method: 'get',
    },
    data,
  )
}


// Get all tenant information by username API
export function getTenantsByUsernameAPI(data: ObjTy = {}) {
  return requestControl(
    {
      url: '/api/v6/auth/user/tenants',
      method: 'get',
    },
    data,
  )
}
