import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,

  {
    // 全局配置 rules
    rules: {
      'vue/multi-word-component-names': 'off', // 关闭 vue component命名提示
      '@typescript-eslint/no-explicit-any': 'off', //关闭any类型警告
      '@typescript-eslint/no-non-null-assertion': 'off', // 关闭禁止非空断言
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
]
