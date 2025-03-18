import { config } from '@atomicbi/devkit/eslint'

export default config(import.meta.dirname, [{
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off'
  }
}])
