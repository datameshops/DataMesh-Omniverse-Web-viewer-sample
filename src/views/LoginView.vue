<template>
  <div class="login-container">
    <div class="login-card">
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-width="100px"
        label-position="top"
      >
        <h2>Sign in</h2>
        <el-form-item label="Account" prop="username">
          <el-input v-model="loginForm.username" placeholder="Please enter your account"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="Please enter your password"
            type="password"
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" :loading="loading" @click="handleLogin" @keyup.enter="handleLogin">
        Sign in
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getTenantsByUsernameAPI } from '@/api/account'
import { RSA_PUBLIC_KEY } from '@/config'
import { useAccountStore } from '@/stores/account'
import type { LoginTy } from '@/types'
import { ElMessage, type FormRules } from 'element-plus'
import JSEncrypt from 'jsencrypt'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()

const loginForm: LoginTy<string> = reactive({
  username: '',
  password: '',
})
const loading = ref<boolean>(false)
const loginFormRef = ref<any>(null)
const loginRules = reactive<FormRules<LoginTy<string>>>({
  username: [
    {
      required: true,
      message: 'Please enter your account',
    },
  ],
  password: [
    {
      required: true,
      message: 'Please enter your password',
      trigger: ['blur', 'change'],
    },
  ],
})

const handleLogin = async () => {
  loading.value = true
  try {
    await loginFormRef.value.validate()
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(RSA_PUBLIC_KEY)

    const data: LoginTy<string> = {
      username: loginForm.username,
      password: encryptor.encrypt(loginForm.password) as string,
    }
    await accountStore.checkUserName(data)

    const res: any = await getTenantsByUsernameAPI({ username: data.username })
    accountStore.userLogin({ ...data, tenantId: res.tenants[0].id }).then(() => {
      ElMessage.success('Login successful')
      if (route.query.redirect) {
        router.push(decodeURIComponent(route.query.redirect as string))
      } else {
        router.push('/')
      }
    })
  } catch (error) {
    console.log(error)
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-card {
    width: 600px;
    margin: 0 auto;
    padding: 40px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    h2 {
      margin-bottom: 20px;
    }

    .el-button {
      width: 100%;
    }
  }
}
</style>
