<template>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>Мой кабинет Dashboard </h1>
      <router-link to="/item/new" class="btn btn-success">
        + Добавить объявление
      </router-link>
    </div>
    
    <div v-if="loading" class="card">
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <p>У вас пока нет объявлений</p>
      <p>s</p>
      <p>s</p>
      <p>s</p>
      <router-link to="/item/new" class="btn btn-success" style="margin-top: 20px;">
        Создать первое объявление
      </router-link>
    </div>
    
     <div v-else class="grid">
       <div v-for="item in items" :key="item.id" class="item-card">
         <div @click="viewItem(item.Items.id)" style="cursor: pointer;">
           <img 
             v-if="item.Items.images_list" 
             
             :src = "getFormattedImageSrc(item.Items)" 
             :alt="item.Items.title"
             @error="handleImageError"
           />
           <div v-else class="no-image">Нет изображения1</div>
           <h3>{{ item.Items.title }}</h3>
           <p class="price">{{ formatPrice(item.Items.price, item.Items.price_for) }}</p>
           <p class="location">{{ item.Items.city_name }}</p>
           <p class="type">{{ item.Items.itemtype_name }}</p>
         </div>
         <div class="actions">
           <div class="small-button">
              <button 
              @click.stop="viewItem(item.id)" 
              class="btn btn-secondary"
              style="flex: 1;"
            >
              Просмотр
              </button>
          
           <router-link 
             :to="`/item/edit/${item.Items.id}`" 
             class="btn btn-primary"
             style="flex: 1;"
             @click.stop
           >
             Редактировать
           </router-link>
           <button 
             @click.stop="deleteItem(item.id)" 
             class="btn btn-danger"
             style="flex: 1;"
           >
             Удалить
           </button>
            </div>
          </div>
       </div>
     </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { itemAPI, format_image_src } from '../api/api'

const router = useRouter()

const items = ref([])
const loading = ref(false)
const error = ref('')

onMounted(() => {
  loadItems()
})





const getFormattedImageSrc = (item) => {
  console.log("getFormattedImageSrc",item.images_list, )
   try {
    const images = JSON.parse(item.images_list)
    return format_image_src(item.user_id, item.id, images[0])
  } catch (error) {
    console.error('Error parsing images_list:', error)
    return '/default-image.jpg'
  }
}


const loadItems = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await itemAPI.getAllMyItems()
    console.log("get_all_my_items", data.my_items)
    items.value = Array.isArray(data.my_items) ? data.my_items : []
    
    // Загружаем изображения для каждого объявления. my_items[0].Items.contacts
    for (let item of items.value) {
      if (item.id) {
        try {
          const files = await itemAPI.getItemFiles(item.id)
          if (files && files.length > 0 && files[0].img) {
            const userId = item.user_id || files[0].user_id
            item.main_image = itemAPI.getImageUrl(userId, item.id, 's', files[0].img)
          }
        } catch (err) {
          console.error('Ошибка загрузки изображения:', err)
        }
      }
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке объявлений'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (itemId) => {
  if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
    return
  }
  
  try {
    await itemAPI.deleteItem(itemId)
    items.value = items.value.filter(item => item.id !== itemId)
  } catch (err) {
    alert('Ошибка при удалении объявления')
    console.error(err)
  }
}

const formatPrice = (price, priceFor) => {
  if (!price) return 'Цена не указана'
  return `${price.toLocaleString()} ${priceFor || 'руб.'}`
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const viewItem = (itemId) => {
  router.push({ name: 'ItemDetail', params: { id: itemId } })
}
</script>

<style scoped>
.no-image {
  width: 100%;
  height: 200px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  color: #999;
  margin-bottom: 10px;
}
</style>


