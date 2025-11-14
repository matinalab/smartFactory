import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // Vite会自动代理到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加token等
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    
    // 检查业务状态码
    if (code === 200) {
      return response.data // 返回实际数据
    } else {
      console.error('业务错误:', message)
      return Promise.reject(new Error(message))
    }
  },
  error => {
    console.error('响应错误:', error)
    
    let message = '请求失败'
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }
    
    // 根据HTTP状态码处理
    if (error.response?.status === 404) {
      message = '接口不存在: ' + error.config.url
    } else if (error.response?.status === 500) {
      message = '服务器内部错误'
    }
    
    return Promise.reject(new Error(message))
  }
)

export default request

