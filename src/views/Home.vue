<template>
  <div class="container">
    <h1>Поиск объявлений</h1>
    
    <div class="card">
      <form @submit.prevent="search" class="search-form">
        <div class="form-group">
          <label>Поиск по описанию</label>
          <input 
            v-model="searchForm.srch" 
            type="text" 
            placeholder="Введите ключевое слово..."
          />
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
          <label>Тип объявления</label>
          <select v-model="searchForm.itemtype_id">
            <option :value="null">Все типы</option>
            <option v-for="type in itemTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Цена от</label>
          <input 
            v-model.number="searchForm.price_min" 
            type="number" 
            placeholder="0"
            min="0"
          />
        </div>
        
        <div class="form-group">
          <label>Цена до</label>
          <input 
            v-model.number="searchForm.price_max" 
            type="number" 
            placeholder="Без ограничений"
            min="0"
          />
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Найти
          </button>
        </div>
      </form>
    </div>
    
    <div v-if="loading" class="card">
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>
    
    <div v-else-if="items.length === 0 && searched" class="empty-state">
      <p>Объявления не найдены!</p>
    </div>
    
    <div v-else-if="items.length > 0" class="grid">
      
      <div 
        v-for="item in items" 
        :key="item.id" 
        :src = "getFormattedImageSrc(item)" 
        class="item-card"
        @click="viewItem(item.id)"
      >
        <img 
          v-if="item.images_list" 
          :src = "getFormattedImageSrc(item)" 
          
          :alt="item.title"
          @error="handleImageError"
        />
        <div v-else class="no-image">Нет изображения2</div>
        <h3>{{ item.title }}</h3>
        <p class="price">{{ formatPrice(item.price, item.price_for) }}</p>
        <p class="location">{{ item.city_name }}</p>
        <p class="type">{{ item.itemtype_name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { searchAPI, referenceAPI, itemAPI } from '../api/api'

const router = useRouter()

const searchForm = ref({
  srch: '',
  city_id: null,
  itemtype_id: null,
  category_id: null,
  price_min: null,
  price_max: null,
  page: 1,
  items_per_page: 20
})




const citySearch = ref('')
const cities = ref([])
const showCityDropdown = ref(false)
const cityInputRef = ref(null)
const isUpdatingCities = ref(false)
const itemTypes = ref([])
const items = ref([])

const loading = ref(false)
const error = ref('')
const searched = ref(false)

onMounted(async () => {
  console.log("onMounted")
  await loadItemTypes()
  // Используем setTimeout чтобы обработчик не срабатывал сразу при монтировании
  setTimeout(() => {
    document.addEventListener('click', closeCityDropdown)
  }, 100)

  search()
})

onUnmounted(() => {
  document.removeEventListener('click', closeCityDropdown)
})

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

const loadItemTypes = async () => {
  try {
    const data = await referenceAPI.getItemTypes()
    itemTypes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Ошибка загрузки типов объявлений:', err)
  }
}

const searchCities = async () => {
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
  searchForm.value.city_id = city.id
  citySearch.value = city.name
  showCityDropdown.value = false
}

const clearCitySelection = () => {
  console.log("clearCitySelection")
  searchForm.value.city_id = null
  citySearch.value = ''
  showCityDropdown.value = false
}

const search = async () => {
  console.log("search")
  loading.value = true
  error.value = ''
  searched.value = true
  
  try {
    const params = { ...searchForm.value }
    // Удаляем пустые значения
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '' || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const data = await searchAPI.searchItems(params)
    items.value = Array.isArray(data) ? data : []
    
    // Загружаем изображения для каждого объявления
    for (let item of items.value) {
      if (item.id) {
        try {
          const files = await itemAPI.getItemFiles(item.id)
          let resp = []
          
          for (const f in files) {
            // let url = 'http://api.1ctm.ru:9090/api/get_img/'+files[f].Item_files.user_id+'/'+files[f].Item_files.item_id+'/s/'+files[f].Item_files.name;
            // resp.push(url)
          }
          

          if (files && files.length > 0 && files[0].img) {
            const userId = item.user_id || files[0].user_id
            //item.main_image = itemAPI.getImageUrl(userId, item.id, 's', files[0].name)
            item.main_image = resp[0]
          }
        } catch (err) {
          console.error('Ошибка загрузки изображения:', err)
        }
      }
    }
  } catch (err) {
    error.value = 'Ошибка при поиске объявлений'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const viewItem = (itemId) => {
  // Переход на страницу деталей объявления
  console.log("Переход на страницу деталей объявления ItemDetail")
  router.push({ name: 'ItemDetail', params: { id: itemId } })
}

const formatPrice = (price, priceFor) => {
  if (!price) return 'Цена не указана'
  return `${price.toLocaleString()} ${priceFor || 'руб.'}`
}





const format_image_src_iii = (user_id, item_id, img_name ) =>{
  if (!img_name) return 'IMG не указан'
  let ret =  'http://api.1ctm.ru:9090/api/get_img/'+user_id+'/'+item_id+'/s/'+img_name;
  return ret 
}


const handleImageError = (event) => {
  event.target.style.display = 'none'
}
const getFormattedImageSrc = (item) => {
  try {
    const images = JSON.parse(item.images_list)
    return format_image_src(item.user_id, item.id, images[0])
  } catch (error) {
    console.error('Error parsing images_list:', error)
    return '/default-image.jpg'
  }
}

const format_image_src = (user_id, item_id, image_name) => {
  if (!image_name) return '/default-image.jpg'
  return `http://api.1ctm.ru:9090/api/get_img/${user_id}/${item_id}/s/${image_name}`
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

.city-item-clear {
  background-color: #e7f3ff;
  border-bottom: 2px solid #007bff;
}

.city-item-clear:hover {
  background-color: #cfe2ff;
}

.city-item-empty {
  color: #999;
  font-style: italic;
  cursor: default;
}

.city-item-empty:hover {
  background-color: transparent;
}

.form-group {
  position: relative;
}

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

