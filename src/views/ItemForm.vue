<template>
  <div class="container">
    <div class="card" style="max-width: 800px; margin: 0 auto;">
      <h2>{{ isEdit ? 'Редактировать объявление' : 'Новое объявление!' }}</h2>
      ItemForm ID:{{ form.id }}
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
        
        


        

        <div class="form-group city-input-group">
          <label>Город</label>
          <input 
            ref="cityInputRef"
            v-model="citySearch" 
            type="text" 
            placeholder="Начните вводить город..."
            @input="searchCities"
            @focus="handleCityInputFocus"
            @click.stop
          />
          <div 
            v-if="showCityDropdown" 
            class="city-dropdown"
            @click.stop
          >
            <div 
              @click="clearCitySelection"
              class="city-item city-item-clear"
            >
              <strong>Любой город</strong>
            </div>
            <div 
              v-for="city in cities" 
              :key="city.id"
              @click="selectCity(city)"
              class="city-item"
            >
              {{ city.name }}
            </div>
            <div v-if="cities.length === 0 && citySearch.length > 0" class="city-item city-item-empty">
              Города не найдены
            </div>
          </div>
        </div>
        



        
        <div class="form-group">
          <label>Тип объявления @*</label>
          <select v-model="form.itemtype_id" required>
            <option :value="null">Выберите тип</option>
            <option v-for="type in itemTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        
        {{  }}  

        <div class="form-group">
          <label>category_id!</label>
          <select v-model="form.category_id" required>
            <option :value="null">Выберите category_id </option>
            <option v-for="cat in categories_2" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        

        <!-- 
        <div class="form-group">
          <label>Категория</label>
          <input 
            v-model="categorySearch" 
            type="text" 
            placeholder="Начните вводить категорию...!"
            @input="searchCategories"
            @focus="showCategoryDropdown.value = true"
          />
          <div 
            v-if="showCategoryDropdown.value && categories.length" 
            class="city-dropdown"
            @click.stop
          >
            <div 
              v-for="category in categories.value" 
              :key="category.id" :value="type.id"
              @click="selectCategory(category)"
              class="city-item"
            >
              {{ category.name }}
            </div>
          </div>
        </div>
        -->
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

if (isEdit){
  if (!localStorage.getItem('me_id')) {
    router.push('/login')
  }
}

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

//const citySearch = ref('')

// const cities = ref([])
//const showCityDropdown = ref(false)

const categorySearch = ref('')
const categories = ref([])
const categories_2 = ref([])
const showCategoryDropdown = ref(false)

const itemTypes = ref([])
const images = ref([])
const existingImages = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  await loadItemTypes()
  await loadCategory()

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


const citySearch = ref('')
const cities = ref([])
const showCityDropdown = ref(false)
const cityInputRef = ref(null)
const isUpdatingCities = ref(false)

const closeDropdowns = () => {
  showCityDropdown.value = false
  showCategoryDropdown.value = false
}


const closeCityDropdown = (event) => {
  console.log("closeCityDropdown")
  // Не закрываем список, если идет обновление данных
  if (isUpdatingCities.value) {
    return
  }
  
  // Проверяем, что клик был не на инпуте и не на выпадающем списке
  const target = event.target
  const cityInputGroup = target.closest('.city-input-group')
  const dropdown = target.closest('.city-dropdown')
  
  // Также проверяем, что клик не на самом инпуте
  if (cityInputRef.value && (target === cityInputRef.value || cityInputRef.value.contains(target))) {
    return
  }
  
  if (!cityInputGroup && !dropdown) {
    showCityDropdown.value = false
  }
}

const handleCityInputFocus = () => {
  console.log("handleCityInputFocus")
  showCityDropdown.value = true
  // Если есть текст, выполняем поиск
  if (citySearch.value.length >= 1) {
    searchCities()
  }
}

const searchCities1 = async () => {
  console.log("searchCities")
  if (citySearch.value.length < 1) {
    cities.value = []
    showCityDropdown.value = false
    isUpdatingCities.value = false
    return
  }
  
  // Устанавливаем флаг обновления
  isUpdatingCities.value = true
  
  // Показываем выпадающий список перед загрузкой
  showCityDropdown.value = true
  
  try {
    const data = await referenceAPI.searchCities(citySearch.value)
    cities.value = Array.isArray(data) ? data : (data || [])
    
    // Используем nextTick чтобы убедиться, что DOM обновлен перед показом списка
    await nextTick()
    
    // Небольшая задержка перед снятием флага, чтобы обработчик клика не закрыл список
    setTimeout(() => {
      isUpdatingCities.value = false
      if (cities.value.length > 0) {
        showCityDropdown.value = true
      }
    }, 100)
  } catch (err) {
    console.error('Ошибка поиска городов:', err)
    cities.value = []
    isUpdatingCities.value = false
  }
}

const selectCity = (city) => {
  console.log("selectCity")
  form.value.city_id = city.id
  citySearch.value = city.name
  showCityDropdown.value = false
}

const clearCitySelection = () => {
  console.log("clearCitySelection")
  form.value.city_id = null
  citySearch.value = ''
  showCityDropdown.value = false
}



const createNewItemId = async () => {
  console.log("createNewItemId")
  try {
    const data = await itemAPI.getNewItemId()
    console.log(data)
// {"new_item_id": 67}
    form.value.id = data.new_item_id
    console.log("form.value.id", form.value.id)
    if (!form.value.id) {
      error.value = 'Не удалось получить ID для нового объявления'
    }
  } catch (err) {
    error.value = 'Ошибка при создании объявления'
    console.error(err)
  }
}

const loadItem = async () => {
  console.log("loadItem")
  loading.value = true
  try {
    const datas = await itemAPI.getMyItem(route.params.id)
    const data = datas.item[0].Items
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
    // data.item[0].Items.id
    // Загружаем существующие изображения
    try {
      //console.log("data", data)
      const files = await itemAPI.getItemFiles(data.id)
      if (files && Array.isArray(files)) {
        existingImages.value = files.map(file => ({
          url: itemAPI.getImageUrl(data.user_id, data.id, 's', file.img),
          url_: file,
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

const loadCategory = async () => {
  try {
    const data = await referenceAPI.getCategories()
    //console.log("loadCategory", data)
    categories_2.value = []
    for ( let n in data.category){
      //console.log(data.category[n])
      categories_2.value.push({"id": data.category[n].Category.id, "name": data.category[n].Category.name})
    }
  } catch (err) {
    console.error('Ошибка загрузки loadCategory:', err)
  }  
}

const loadItemTypes = async () => {
  try {
    const data = await referenceAPI.getItemTypes()
    //console.log("loadItemTypes", data)
    let ret = []
    for ( let n in data.Itemtype){
      //console.log(data.Itemtype[n].Itemtype.id, data.Itemtype[n].Itemtype.name)
      ret.push({"id": data.Itemtype[n].Itemtype.id, "name": data.Itemtype[n].Itemtype.name})
    }

//    itemTypes.value = Array.isArray(data.Itemtype) ? data.Itemtype : []
    itemTypes.value = ret
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


const searchCategories = async () => {
  //if (categorySearch.value.length < 2) {
  //  categories.value = []
  //  return
  //}

  try {
    const data = await referenceAPI.getCategories(categorySearch.value)
    console.log("searchCategories",data.category)
    categories.value = []
    for (const c in data.category) {
      categories.value.push({ "id": data.category[c].Category.id, "name": data.category[c].Category.name})
      console.log("c",data.category[c].Category.id, data.category[c].Category.name)
    }
    console.log("categories.value ", categories.value)
    showCategoryDropdown.value = true
    // categories.value = Array.isArray(data) ? data : []
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

