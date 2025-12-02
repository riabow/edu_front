import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import ItemForm from '../views/ItemForm.vue'
import ItemDetail from '../views/ItemDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/item/new',
    name: 'NewItem',
    component: ItemForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/item/edit/:id',
    name: 'EditItem',
    component: ItemForm
    //meta: { requiresAuth: true }
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: ItemDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Проверка авторизации
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router


