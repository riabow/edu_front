<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">Объявления</router-link>
        <div>
          {{ me  }}
          <template v-if="!isAuthenticated" >
            <router-link to="/login" class="btn btn-primary">
              Войти
            </router-link>
          
          </template>
          <template v-else>
            <router-link to="/dashboard" class="btn btn-secondary" style="margin-right: 10px;">
              Мой кабинет
            </router-link>
            <button @click="logout" class="btn btn-secondary">
              Выйти
            </button>
          </template>
        </div>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isAuthenticated = computed(() => {
  console.log("isAuthenticated ", localStorage.getItem('access_token'))
  return !!localStorage.getItem('access_token')
  
})


const me = computed(() => {
  console.log("me ", localStorage.getItem('me'))
  return localStorage.getItem('me')
  
})


const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('me')
  
  router.push('/')
}
</script>




