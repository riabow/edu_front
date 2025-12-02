<template>
  <div class="container">
    <div v-if="loading" class="card">
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>
    
    <div v-else-if="item" class="item-detail">
      <button @click="$router.back()" class="btn btn-secondary" style="margin-bottom: 20px;">
        ← Назад
      </button>
      <button @click=editItem(item.item[0].Items.id) class="btn btn-secondary" style="margin-bottom: 20px;">
        ← edit
      </button>
      <div class="card">
          
        <div class="item-header">
          <h1>{{ item.item[0].Items.title }}</h1> 
          <p class="item-price">{{ item.item[0].Items.price }} руб.</p> {{ item.item[0].Items.id }}
        </div>
        {{ item.item[0].Items.images_list }}<br>
        {{ images.value }}
        <div class="item-images" v-if="images.length > 0">
          <div class="main-image">
            <img 
              :src="currentImage" 
              :alt="item.title"
              @error="handleImageError"
            />
          </div>
          <div class="image-thumbnails" v-if="images.length > 1">
            <img
              v-for="(img, index) in images"
              :key="index"
              :src="img"
              :alt="`Изображение ${index + 1}`"
              :class="{ active: img === currentImage }"
              @click="currentImage = img"
              @error="handleImageError"
            />
          </div>
        </div>
        
        <div v-else class="no-image-large">
          Нет изображений
        </div>
        
        <div class="item-info">
          <div class="info-row">
            
            <span class="info-label">Город:</span>
            <span class="info-value">{{ item.item[0].city || 'Не указан' }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Тип объявления:</span>
            <span class="info-value">{{ item.item[0].type || 'Не указан' }}</span>
          </div>
          
          <div class="info-row" v-if="item.category_name">
            <span class="info-label">Категория:</span>
            <span class="info-value">{{ item.item[0].category }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Цена:</span>
            <span class="info-value"> {{ item.item[0].Items.price }}</span>
          </div>
        </div>
        
        <div class="item-description">
          <h2>Описание</h2>
          <p>{{ item.item[0].Items.descr  || 'Описание отсутствует' }}</p>
        </div>
        
        <div class="item-contacts" v-if="item.contacts">
          <h2>Контакты</h2>
          <p class="contacts-text">{{ item.contacts }}</p>
        </div>
        
        <div class="item-meta" v-if="item.created_at || item.user_name">
          <div class="info-row" v-if="item.created_at">
            <span class="info-label">Дата публикации:</span>
            <span class="info-value">{{ formatDate(item.created_at) }}</span>
          </div>
          <div class="info-row" v-if="item.user_name">
            <span class="info-label">Автор:</span>
            <span class="info-value">{{ item.user_name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { searchAPI, itemAPI } from '../api/api'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const images = ref([])
const currentImage = ref('')
const loading = ref(false)
const error = ref('')


const editItem = (itemId) => {
  console.log(" Переход на страницу деталей объявления ")
  // Переход на страницу деталей объявления
  //console.log(itemId)
  // console.log(router)
  router.push({ name: 'EditItem', params: { id: itemId } })
}

const formatPrice = (price, priceFor) => {
  if (!price) return 'Цена не указана..'
  return `${price.toLocaleString()} ${priceFor || 'руб.'}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatImageSrc = (user_id, item_id, image_name) => {
  if (!image_name) return null
  return `http://api.1ctm.ru:9090/api/get_img/${user_id}/${item_id}/b/${image_name}`
}

const formatImageThumbnail = (user_id, item_id, image_name) => {
  if (!image_name) return null
  return `http://api.1ctm.ru:9090/api/get_img/${user_id}/${item_id}/s/${image_name}`
}

const loadItem = async () => {
  console.log(" loadItem ")
  loading.value = true
  error.value = ''
  
  try {
    const data = await searchAPI.getItem(route.params.id)
    // console.log(" getItemdata ", data)
    // console.log(" images_list ", data.item[0].Items.images_list)
    //images_list
    let imgs_str = data.item[0].Items.images_list
    let  img_arr;
    try {
      img_arr = JSON.parse(imgs_str);   // <--   массив объектов (в данном случае строк)
      console.log("item", data.item[0].Items)
      images.value = img_arr.map(imgName => 
              formatImageSrc(data.item[0].Items.user_id, data.item[0].Items.id, imgName)
            )

      console.log(" images.value ", images.value)
    } catch (e) {
      images.value = []
      console.error('Не удалось разобрать строку как JSON', e);
    }



    item.value = data
    
    // Загружаем изображения
    try {
      const files = await itemAPI.getItemFiles(route.params.id)
      
      if (files && Array.isArray(files) && files.length > 0) {
        const imageList = []
        
        for (const file of files) {
          let userId, itemId, imgName
        
         
            userId =   data.item[0].Items.user_id
            itemId = data.item[0].Items.id
            imgName = file.img || file.name
        
          
          if (userId && itemId && imgName) {
            imageList.push({
              full: formatImageSrc(userId, itemId, imgName),
              thumb: formatImageThumbnail(userId, itemId, imgName)
            })
          }
        }
        
        // Если есть images_list в самом объявлении
        if (item.value.images_list) {
          try {
            const parsedImages = JSON.parse(item.value.images_list)
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              parsedImages.forEach(imgName => {
                const userId = item.value.user_id
                const itemId = item.value.id
                if (userId && itemId && imgName) {
                  imageList.push({
                    full: formatImageSrc(userId, itemId, imgName),
                    thumb: formatImageThumbnail(userId, itemId, imgName)
                  })
                }
              })
            }
          } catch (e) {
            console.error('Ошибка парсинга images_list:', e)
          }
        }
        
        // Убираем дубликаты
        const uniqueImages = []
        const seen = new Set()
        imageList.forEach(img => {
          if (!seen.has(img.full)) {
            seen.add(img.full)
            uniqueImages.push(img)
          }
        })
        
        images.value = uniqueImages.map(img => img.full)
        if (images.value.length > 0) {
          currentImage.value = images.value[0]
        }
      } else if (item.value.images_list) {
        // Если нет файлов через API, но есть images_list
        try {
          const parsedImages = JSON.parse(item.value.images_list)
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            images.value = parsedImages.map(imgName => 
              formatImageSrc(item.value.user_id, item.value.id, imgName)
            )
            if (images.value.length > 0) {
              currentImage.value = images.value[0]
            }
          }
        } catch (e) {
          console.error('Ошибка парсинга images_list:', e)
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки изображений:', err)
      // Пробуем использовать images_list из самого объявления
      if (item.value.images_list) {
        try {
          const parsedImages = JSON.parse(item.value.images_list)
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            images.value = parsedImages.map(imgName => 
              formatImageSrc(item.value.user_id, item.value.id, imgName)
            )

            console.log("images.value 2", images.value )
            if (images.value.length > 0) {
              currentImage.value = images.value[0]
            }
          }
        } catch (e) {
          console.error('Ошибка парсинга images_list:', e)
        }
      }
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке объявления'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  loadItem()
})



</script>

<style scoped>
.item-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.item-header h1 {
  margin: 0;
  flex: 1;
  font-size: 32px;
  color: #333;
}

.item-price {
  font-size: 28px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

.item-images {
  margin-bottom: 30px;
}

.main-image {
  width: 100%;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.main-image img {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.image-thumbnails img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
}

.image-thumbnails img:hover {
  border-color: #007bff;
  transform: scale(1.05);
}

.image-thumbnails img.active {
  border-color: #007bff;
}

.no-image-large {
  width: 100%;
  height: 400px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #999;
  font-size: 18px;
  margin-bottom: 30px;
}

.item-info {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 150px;
}

.info-value {
  color: #333;
  flex: 1;
}

.item-description {
  margin-bottom: 30px;
}

.item-description h2 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.item-description p {
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
}

.item-contacts {
  background: #fff3cd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #ffc107;
}

.item-contacts h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.contacts-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.item-meta {
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .item-header {
    flex-direction: column;
  }
  
  .item-header h1 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .item-price {
    font-size: 24px;
  }
  
  .info-row {
    flex-direction: column;
  }
  
  .info-label {
    margin-bottom: 5px;
  }
}
</style>


