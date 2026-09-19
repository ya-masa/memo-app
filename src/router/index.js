import { createRouter, createWebHistory } from 'vue-router'

import ListView from '../views/ListView.vue'
import EditView from '../views/EditView.vue'

const router = createRouter({
    history: createWebHistory('/memo-app/'),
    routes: [
        {
            path: '/',
            component: ListView
        },
        {
            path: '/edit',
            component: EditView
        }
    ]
})

export default router