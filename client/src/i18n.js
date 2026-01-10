import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: localStorage.getItem('user-locale') || 'en', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: {
        en: {
            ...en,
            authentication: 'Authentication',
            auth_disabled_tip: 'Authentication is currently disabled. Create an admin account to enable it.',
            admin_username: 'Admin Username',
            admin_password: 'Admin Password',
            enable_auth: 'Enable Authentication',
            auth_enabled: 'Authentication is enabled',
            disable_auth: 'Disable Authentication',
            disable_auth_confirm: 'Are you sure? This will delete ALL users and make the board public!',
            auth_enabled_success: 'Authentication enabled! Please login.',
            auth_disabled_success: 'Authentication disabled.',
            user_management: 'User Management',
        },
        ru
    }
})

export default i18n
