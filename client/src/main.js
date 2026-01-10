import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

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
        }
    ]
})

createApp(App)
    .use(router)
    .mount('#app')
