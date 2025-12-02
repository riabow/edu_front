<template>
  <div class="container">
    <div class="card" style="max-width: 800px; margin: 0 auto;">
      <h2>{{ isEdit ? 'Редактировать объявление' : 'Новое объявление' }}</h2>
      
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>
      
      <form @submit.prevent="saveItem">
        <div class="form-group">
          <label>Заголовок *</label>
          <input 
            v-model="form.title" 
            type="text" 
            required
            placeholder="Введите заголовок объявления"
          />
        </div>
        
        <div class="form-group">
          <label>Описание *</label>
          <textarea 
            v-model="form.descr" 
            required
            placeholder="Опишите ваше объявление"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Город *</label>
          <input 
            v-model="citySearch" 
            type="text" 
            required
            placeholder="Начните вводить город..."
            @input="searchCities"
            @focus="showCityDropdown = true"
          />
          <div 
            v-if="showCityDropdown && cities.length" 
            class="city-dropdown"
            @click.stop
          >
            <div 
              v-for="city in cities" 
              :key="city.id"
              @click="selectCity(city)"
              class="city-item"
            >
              {{ city.name }}
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Тип объявления *</label>
          <select v-model="form.itemtype_id" required>
            <option :value="null">Выберите тип</option>
            <option v-for="type in itemTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Категория</label>
          <input 
            v-model="categorySearch" 
            type="text" 
            placeholder="Начните вводить категорию..."
            @input="searchCategories"
            @focus="showCategoryDropdown = true"
          />
          <div 
            v-if="showCategoryDropdown && categories.length" 
            class="city-dropdown"
            @click.stop
          >
            <div 
              v-for="category in categories" 
              :key="category.id"
              @click="selectCategory(category)"
              class="city-item"
            >
              {{ category.name }}
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Цена *</label>
          <input 
            v-model.number="form.price" 
            type="number" 
            required
            min="0"
            placeholder="0"
          />
        </div>
        
        <div class="form-group">
          <label>Валюта/Единица измерения *</label>
          <input 
            v-model="form.price_for" 
            type="text" 
            required
            placeholder="руб., $, за м² и т.д."
          />
        </div>
        
        <div class="form-group">
          <label>Контакты *</label>
          <textarea 
            v-model="form.contacts" 
            required
            placeholder="Телефон, email, адрес и т.д."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Изображения</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            @change="handleFileSelect"
          />
          <div v-if="images.length" class="images-preview">
            <div v-for="(img, index) in images" :key="index" class="image-preview">
              <img :src="img.preview" alt="Preview" />
              <button type="button" @click="removeImage(index)" class="btn btn-danger btn-sm">
                Удалить
              </button>
            </div>
          </div>
          <div v-if="existingImages.length" class="existing-images">
            <h4>Текущие изображения:</h4>
            <div class="images-preview">
              <div v-for="(img, index) in existingImages" :key="index" class="image-preview">
                <img :src="img.url" alt="Existing" />
                <button 
                  type="button" 
                  @click="deleteExistingImage(img)" 
                  class="btn btn-danger btn-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { itemAPI, referenceAPI } from '../api/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  id: null,
  title: '',
  descr: '',
  city_id: null,
  itemtype_id: null,
  category_id: null,
  price: 0,
  price_for: 'руб.',
  contacts: '',
  images_list: null,
  geo_lat: null,
  geo_lon: null
})

const citySearch = ref('')
const cities = ref([])
const showCityDropdown = ref(false)

const categorySearch = ref('')
const categories = ref([])
const showCategoryDropdown = ref(false)

const itemTypes = ref([])
const images = ref([])
const existingImages = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  await loadItemTypes()
  if (isEdit.value) {
    await loadItem()
  } else {
    await createNewItemId()
  }
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const closeDropdowns = () => {
  showCityDropdown.value = false
  showCategoryDropdown.value = false
}

const createNewItemId = async () => {
  try {
    const data = await itemAPI.getNewItemId()
    form.value.id = data.id || data.item_id || data
    if (!form.value.id) {
      error.value = 'Не удалось получить ID для нового объявления'
    }
  } catch (err) {
    error.value = 'Ошибка при создании объявления'
    console.error(err)
  }
}

const loadItem = async () => {
  loading.value = true
  try {
    const data = await itemAPI.getMyItem(route.params.id)
    form.value = {
      id: data.id,
      title: data.title || '',
      descr: data.descr || '',
      city_id: data.city_id,
      itemtype_id: data.itemtype_id,
      category_id: data.category_id,
      price: data.price || 0,
      price_for: data.price_for || 'руб.',
      contacts: data.contacts || '',
      images_list: data.images_list,
      geo_lat: data.geo_lat,
      geo_lon: data.geo_lon
    }
    
    if (data.city_name) {
      citySearch.value = data.city_name
    }
    
    // Загружаем существующие изображения
    try {
      const files = await itemAPI.getItemFiles(data.id)
      if (files && Array.isArray(files)) {
        existingImages.value = files.map(file => ({
          url: itemAPI.getImageUrl(data.user_id, data.id, 's', file.img),
          user_id: data.user_id,
          item_id: data.id,
          bs: file.bs || 's',
          img: file.img
        }))
      }
    } catch (err) {
      console.error('Ошибка загрузки изображений:', err)
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке объявления'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadItemTypes = async () => {
  try {
    const data = await referenceAPI.getItemTypes()
    itemTypes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Ошибка загрузки типов объявлений:', err)
  }
}

const searchCities = async () => {
  if (citySearch.value.length <= 0) {
    cities.value = []
    return
  }
  try {
    const data = await referenceAPI.searchCities(citySearch.value)
    cities.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Ошибка поиска городов:', err)
    cities.value = []
  }
}

const selectCity = (city) => {
  form.value.city_id = city.id
  citySearch.value = city.name
  showCityDropdown.value = false
}

const searchCategories = async () => {
  if (categorySearch.value.length < 2) {
    categories.value = []
    return
  }
  try {
    const data = await referenceAPI.getCategories(categorySearch.value)
    categories.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Ошибка поиска категорий:', err)
    categories.value = []
  }
}

const selectCategory = (category) => {
  form.value.category_id = category.id
  categorySearch.value = category.name
  showCategoryDropdown.value = false
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push({
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const deleteExistingImage = async (img) => {
  try {
    await itemAPI.deleteImage(img.user_id, img.item_id, img.bs, img.img)
    existingImages.value = existingImages.value.filter(i => i !== img)
  } catch (err) {
    alert('Ошибка при удалении изображения')
    console.error(err)
  }
}

const saveItem = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Загружаем изображения
    for (let img of images.value) {
      await itemAPI.uploadImage(form.value.id, img.file)
    }
    
    // Сохраняем объявление
    const itemData = {
      id: form.value.id,
      city_id: form.value.city_id,
      itemtype_id: form.value.itemtype_id,
      category_id: form.value.category_id,
      title: form.value.title,
      descr: form.value.descr,
      contacts: form.value.contacts,
      price: form.value.price,
      price_for: form.value.price_for,
      images_list: form.value.images_list,
      geo_lat: form.value.geo_lat,
      geo_lon: form.value.geo_lon
    }
    
    await itemAPI.editItem(itemData)
    
    success.value = 'Объявление успешно сохранено!'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    error.value = 'Ошибка при сохранении объявления'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.city-dropdown {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.city-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.city-item:hover {
  background-color: #f5f5f5;
}

.city-item:last-child {
  border-bottom: none;
}

.form-group {
  position: relative;
}

.images-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-preview {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-preview .btn-sm {
  width: 100%;
  padding: 5px;
  font-size: 12px;
  margin-top: 5px;
}

.existing-images {
  margin-top: 20px;
}

.existing-images h4 {
  margin-bottom: 10px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 14px;
}
</style>

