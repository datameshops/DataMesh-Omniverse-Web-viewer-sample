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

// Switch current user API
export function currentUserSwitchAPI(data: ObjTy) {
  return requestControl(
    {
      url: '/api/v6/auth/switch',
      method: 'post',
    },
    data,
  )
}

// Get all tenant list for current user API
export function getTenantsAPI(data?: ObjTy) {
  return requestControl(
    {
      url: '/api/v6/auth/user/listCurrentUserTenant',
      method: 'get',
    },
    data || {},
  )
}

// Check if tenant has SMS authentication enabled API
export function selectTenantAPI(data: ObjTy) {
  return requestControl(
    {
      url: '/api/v6/auth/selectTenant',
      method: 'json',
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
