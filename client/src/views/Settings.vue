<template>
  <div class="settings-container">
    <h2>{{ $t('settings') }}</h2>
    <div class="setting-item">
      <label for="language-select">{{ $t('language') }}:</label>
      <select id="language-select" v-model="currentLocale" @change="changeLocale">
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </select>
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

    const changeLocale = () => {
      locale.value = currentLocale.value
      localStorage.setItem('user-locale', currentLocale.value)
    }

    // Sync if locale changes elsewhere
    watch(locale, (newVal) => {
      currentLocale.value = newVal
    })

    return {
      currentLocale,
      changeLocale
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.setting-item {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white; /* Ensure visibility in dark mode if applicable */
  color: black;
}
</style>
