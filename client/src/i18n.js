import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: localStorage.getItem('user-locale') || 'en', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: {
        en,
        ru
    }
})

export default i18n
