import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'
import i18n from './i18n'

const router = createRouter({
    history: createWebHistory('/kaban-board/'),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/Home.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/board/:id',
            name: 'board',
            component: () => import('./views/BoardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('./views/Settings.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('./views/Login.vue')
        }
    ]
})

import { authApi } from './api'

router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('auth-token')

    // Check if auth is enabled on server
    try {
        const { data } = await authApi.getStatus()
        const authEnabled = data.authEnabled

        if (authEnabled) {
            if (to.meta.requiresAuth && !token) {
                next('/login')
            } else if (to.name === 'login' && token) {
                next('/')
            } else {
                next()
            }
        } else {
            // If auth not enabled, allow access unless they are trying to go to login
            if (to.name === 'login') {
                next('/')
            } else {
                next()
            }
        }
    } catch (error) {
        console.error('Auth status check failed:', error)
        next()
    }
})

createApp(App)
    .use(router)
    .use(i18n)
    .mount('#app')
