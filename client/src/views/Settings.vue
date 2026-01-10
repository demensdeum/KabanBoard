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
          <label for="language-select" class="setting-label">{{ $t('language') }}</label>
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
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'

export default {
  name: 'Settings',
  setup() {
    const { locale } = useI18n()
    const currentLocale = ref(locale.value)

    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ]

    const selectLanguage = (code) => {
      currentLocale.value = code
      locale.value = code
      localStorage.setItem('user-locale', code)
    }

    watch(locale, (newVal) => {
      currentLocale.value = newVal
    })

    return {
      currentLocale,
      languages,
      selectLanguage
    }
  }
}
</script>

<style scoped>
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
