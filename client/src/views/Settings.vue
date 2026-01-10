<template>
  <div class="settings-container">
    <h2 class="settings-title">{{ $t('settings') }}</h2>
    
    <div class="settings-card">
      <div class="setting-item">
        <div class="setting-header">
          <div class="setting-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <label class="setting-label">{{ $t('language') }}</label>
        </div>
        
        <div class="language-selector">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            class="language-option"
            :class="{ active: currentLocale === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <span class="language-flag">{{ lang.flag }}</span>
            <span class="language-name">{{ lang.name }}</span>
          </button>
        </div>
      </div>

      <div class="setting-item auth-section">
        <div class="setting-header">
          <div class="setting-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <label class="setting-label">{{ $t('authentication') }}</label>
        </div>

        <div class="auth-controls">
          <div v-if="!authStatus.authEnabled" class="auth-setup">
            <p class="auth-tip">{{ $t('auth_setup_tip') }}</p>
            <div class="form-group">
              <input v-model="adminForm.username" class="form-input" :placeholder="$t('admin_username')">
            </div>
            <div class="form-group">
              <input v-model="adminForm.password" type="password" class="form-input" :placeholder="$t('admin_password')">
            </div>
            <button class="btn btn-primary" @click="enableAuth" :disabled="!adminForm.username || !adminForm.password">
              {{ $t('enable_auth') }}
            </button>
          </div>
          
          <div v-else class="auth-enabled">
            <p class="auth-tip success">{{ $t('auth_enabled_tip') }}</p>
            <button class="btn btn-secondary danger-hover" @click="disableAuth">
              {{ $t('disable_auth') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { ref, watch, onMounted } from 'vue'
import { authApi } from '../api'

export default {
  name: 'Settings',
  setup() {
    const { locale, t } = useI18n()
    const currentLocale = ref(locale.value)
    const authStatus = ref({ authEnabled: false })
    const adminForm = ref({ username: '', password: '' })

    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ]

    const fetchAuthStatus = async () => {
      try {
        const { data } = await authApi.getStatus()
        authStatus.value = data
      } catch (err) {
        console.error('Failed to fetch auth status', err)
      }
    }

    const enableAuth = async () => {
      try {
        await authApi.enable(adminForm.value.username, adminForm.value.password)
        await fetchAuthStatus()
        alert(t('auth_enabled_success'))
        // Login automatically if possible or redirect to login
        window.location.reload()
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to enable auth')
      }
    }

    const disableAuth = async () => {
      if (!confirm(t('disable_auth_confirm'))) return
      try {
        await authApi.disable()
        localStorage.removeItem('auth-token')
        await fetchAuthStatus()
        alert(t('auth_disabled_success'))
        window.location.reload()
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to disable auth')
      }
    }

    const selectLanguage = (code) => {
      currentLocale.value = code
      locale.value = code
      localStorage.setItem('user-locale', code)
    }

    watch(locale, (newVal) => {
      currentLocale.value = newVal
    })

    onMounted(fetchAuthStatus)

    return {
      currentLocale,
      languages,
      selectLanguage,
      authStatus,
      adminForm,
      enableAuth,
      disableAuth
    }
  }
}
</script>

<style scoped>
.auth-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.auth-controls {
  margin-top: 8px;
}

.auth-setup {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-tip {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.auth-tip.success {
  color: var(--success);
}

.danger-hover:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

.form-group {
  margin-bottom: 4px;
}


.settings-container {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.settings-card {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  color: var(--accent);
  display: flex;
  align-items: center;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.language-selector {
  display: flex;
  gap: 12px;
}

.language-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  font-weight: 500;
}

.language-option:hover {
  border-color: var(--accent);
  color: var(--text-primary);
  background: rgba(99, 102, 241, 0.1);
}

.language-option.active {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.language-flag {
  font-size: 20px;
}

.language-name {
  font-weight: 500;
}
</style>
