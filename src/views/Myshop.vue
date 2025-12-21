<template>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>Мой магазин  </h1>
      <router-link to="/item/new" class="btn btn-success">
        + Добавить объявление
      </router-link>
      
    </div>
    загрузить прайслист
    <form @submit.prevent="upload_table">
      <div>
        <label>прайс</label>
          <input 
            type="file" 
            multiple 
            accept=".xlsx,.xls"
            @change="handleFileSelect"
          />

      </div>
       <div class="actions">
          <button type="submit" class="btn btn-success" :disabled="loading">
            {{ loading ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <router-link to="/dashboard" class="btn btn-secondary">
            Отмена
          </router-link>
        </div>
    </form>
    

    <div v-if="loading" class="card">
      <p>Загрузка...</p>
    </div>
    
    
    
    
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { itemAPI, format_image_src } from '../api/api'

const router = useRouter()

//const items = ref([])
const loading = ref(false)
const error = ref('')
const images = ref([])
const fileInput = ref(null)
const selectedFile = ref(null)

const form = ref({
  id: null,
  table: null,
})


onMounted(() => {
  //loadItems()
})

const upload_table = async () => {
  try {
    const response = await itemAPI.upload_parts( selectedFile.value)
    console.log("upload_table", response)
  } catch (error) {
    console.error('Ошибка загрузки таблицы:', error)
  }
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]

  // const files = Array.from(event.target.files)
  // files.forEach(file => {
  //   if (file.type.startsWith('image/')) {
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       images.value.push({
  //         file: file,
  //         preview: e.target.result
  //       })
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // })
}


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


