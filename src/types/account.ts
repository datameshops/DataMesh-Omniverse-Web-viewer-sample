import type { ObjTy } from './common'
export interface UserTy {
  id?: string
  company?: CompanyTy | ObjTy
  headPic?: string
  username?: string
  nickName?: string
  realName?: string
  mobile?: string
  email?: string
  region?: string
  source?: string
  address?: string
  roles?: Array<any>
  depts?: Array<any>
  customConfig?: ObjTy
  password?: string
  repeatPwd?: string
}
export type UserInfoTy = UserTy & any

export interface CompanyTy {
  id?: string
  contactEmail?: string
  contactMobile?: string
  contactName?: string
  customConfig?: string
  domainName?: string
  loginSign?: string
  loginTypeList?: Array<any>
  logoUri?: string
  name?: string
  source?: string
  status?: string
}
// 登录
export interface LoginTy<T> {
  identityType?: T
  clientType?: T
  username: T
  password: T
  captcha?: T
  captchaId?: T
  tenantId?: T
}
