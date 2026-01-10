import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'
import i18n from './i18n'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/Home.vue')
        },
        {
            path: '/board/:id',
            name: 'board',
            component: () => import('./views/BoardView.vue')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('./views/Settings.vue')
        }
    ]
})

createApp(App)
    .use(router)
    .use(i18n)
    .mount('#app')
