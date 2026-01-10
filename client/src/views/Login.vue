<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-logo">Kaban</h1>
        <p class="login-subtitle">{{ $t('login_subtitle') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">{{ $t('username') }}</label>
          <input 
            v-model="username" 
            type="text" 
            class="form-input" 
            :placeholder="$t('username_placeholder')"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('password') }}</label>
          <input 
            v-model="password" 
            type="password" 
            class="form-input" 
            :placeholder="$t('password_placeholder')"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? $t('logging_in') : $t('login') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      error.value = ''
      loading.value = true
      
      try {
        const response = await authApi.login(username.value, password.value)
        localStorage.setItem('auth-token', response.data.token)
        router.push('/')
      } catch (err) {
        error.value = err.response?.data?.error || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      error,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
}

.login-card {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent) 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.login-subtitle {
  color: var(--text-muted);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 8px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  text-align: center;
}
</style>
