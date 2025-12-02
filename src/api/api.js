import axios from 'axios'

//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.1ctm.ru:9090'
const API_BASE_URL = 'http://api.1ctm.ru:9090'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавляем токен к запросам, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: async (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    const response = await axios.post(`${API_BASE_URL}/token`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me/')
    return response.data
  }
}

export const searchAPI = {
  searchItems: async (searchParams) => {
    const response = await api.post('/api/search_item', searchParams)
    //console.log(response.data.array)
    let resp = []
    for (const i in response.data.array) {
      //console.log(i)
      resp.push(response.data.array[i].Items)
    }
    //console.log(resp)
    return resp
  },
  
  getItem: async (itemId) => {
    const response = await api.get(`/api/get_item/${itemId}`)
    return response.data
  }
}

export const itemAPI = {
  getAllMyItems: async () => {
    const response = await api.get('/api/get_all_my_items/')
    return response.data
  },
  
  getMyItem: async (itemId) => {
    const response = await api.get(`/api/get_my_item/${itemId}`)
    return response.data
  },
  
  getNewItemId: async () => {
    const response = await api.post('/api/get_new_item_id/')
    return response.data
  },
  
  editItem: async (itemData) => {
    const response = await api.post('/api/edit_item/', itemData)
    return response.data
  },
  
  deleteItem: async (itemId) => {
    const response = await api.delete(`/api/del_my_item/${itemId}?item_id=${itemId}`)
    return response.data
  },
  
  uploadImage: async (itemId, file) => {
    const formData = new FormData()
    formData.append('item_id', itemId)
    formData.append('file', file)
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  getItemFiles: async (itemId) => {
    const response = await api.get(`/api/get_item_files/${itemId}`)
    //console.log(response.data)
    let ret = []
    for (const imkey in response.data) {
      
      let fn = response.data[imkey].Item_files.name

      // http://api.1ctm.ru:9090/api/get_img/7/64/b/IMG_20250728_202101.jpg">
      ret.push({
        full_url:"http://api.1ctm.ru:9090/api/get_img/7/64/s/"+fn,
        img: fn,
      })
      //console.log(response.data[imkey].Item_files.name)
    }
    //console.log("ret", ret)
    return ret
  },
  
  deleteImage: async (userId, itemId, bs, img) => {
    const response = await api.delete(`/api/delete_img/${userId}/${itemId}/${bs}/${img}`)
    return response.data
  },
  
  getImageUrl: (userId, itemId, bs, img) => {
    return `${API_BASE_URL}/api/get_img/${userId}/${itemId}/${bs}/${img}`
  }
}

export const referenceAPI = {
  getItemTypes: async () => {
    const response = await api.get('/api/itemtype/')
    return response.data
  },
  
  getCategories: async (search = '') => {
    const params = search ? { srch: search } : {}
    const response = await api.get('/api/category_search/', { params })
    return response.data
  },
  
  searchCities: async (search = '') => {
    if (search) {
      const response = await api.get(`/api/sity_search/${search}`)
      console.log("ищем response.dataгород ", search)
      let resp = []
      console.log("response.data.citys",response.data.citys)
      for (let i of response.data.citys){
        console.log(i)
        resp.push(i.Citys)
      }
      console.log("resp", resp )
      return resp
    } else {
      const response = await api.get('/api/sity_search/')
      return response.data
    }
  }
}

export default api




