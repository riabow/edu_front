<template>
  <div class="container">
    <div class="card" style="max-width: 400px; margin: 50px auto;">
      <h2>Регистрация нового пользователя</h2>
      
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <form @submit.prevent="register">
        <div class="form-group">
          <label>Логин</label>
          <input 
            v-model="form.name" 
            type="text" 
            required
            placeholder="Введите логин"
          />
        </div>
        
        <div class="form-group">
          <label>Имя пользователя</label>
          <input 
            v-model="form.fullname" 
            type="text" 
            required
            placeholder="Введите имя пользователя"
          />
        </div>


        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="form.password_str" 
            type="password" 
            required
            placeholder="Введите пароль"
          />
        </div>
        <div class="form-group">
          <label>email</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            placeholder="Введите email"
          />
        </div>

        <div class="form-group">
          <label>phone</label>
          <input 
            v-model="form.phone" 
            type="phone" 
            required
            placeholder="Введите phone"
          />
        </div>

        <div class="form-group">
          <label>descr</label>
          <input 
            v-model="form.descr" 
            type="descr" 
            required
            placeholder="Введите descr"
          />
        </div>
        
        
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Вход...' : 'Регистрация' }}
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
  name: '',
  fullname: "",
  password_str: "",
  email: "",
  phone: "",
  descr: ""
})

const loading = ref(false)
const error = ref('')
const me = ref([])

const register = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await authAPI.register(
      form.value.name, 
      form.value.fullname, 
      form.value.password_str, 
      form.value.email, 
      form.value.phone, 
      form.value.descr, 
    )

    console.log("register response", response)
    //localStorage.setItem('access_token', response.access_token)
    //const me = await authAPI.getCurrentUser()
    //localStorage.setItem('me', me)
    //localStorage.setItem('me_id', me.current_user.id)
    
    //console.log("me! ", me)

    //location.reload();
    router.push('/login')

  } catch (err) {
      error.value = 'не получилось зарегистрироваться'+response
      console.error('Ошибка регистрации:', err)
  } finally {
      loading.value = false
  }
}
</script>




