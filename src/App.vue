<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">Объявления</router-link>
        <div>
          <router-link v-if="!isAuthenticated" to="/login" class="btn btn-primary">
            Войти
          </router-link>
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
  return !!localStorage.getItem('access_token')
})

const logout = () => {
  localStorage.removeItem('access_token')
  router.push('/')
}
</script>




