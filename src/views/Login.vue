<template>
  <div class="container">
    <div class="card" style="max-width: 400px; margin: 50px auto;">
      <h2>Вход в личный кабинет</h2>
      
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <label>Email или имя пользователя</label>
          <input 
            v-model="form.username" 
            type="text" 
            required
            placeholder="Введите email или имя пользователя"
          />
        </div>
        
        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            placeholder="Введите пароль"
          />
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/api'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const me = ref([])

const login = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await authAPI.login(form.value.username, form.value.password)
    console.log("login response", response)
    localStorage.setItem('access_token', response.access_token)
    const me = await authAPI.getCurrentUser()
    localStorage.setItem('me', me)
    localStorage.setItem('me_id', me.current_user.id)
    
    console.log("me! ", me)

    //location.reload();
    router.push('/dashboard')

  } catch (err) {
      error.value = 'Неверный email или пароль'
      console.error('Ошибка входа:', err)
  } finally {
      loading.value = false
  }
}
</script>




