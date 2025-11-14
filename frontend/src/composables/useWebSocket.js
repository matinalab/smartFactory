import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

/**
 * WebSocket 连接管理 Composable
 */
export function useWebSocket() {
  const socket = ref(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  /**
   * 连接到 WebSocket 服务器
   * @param {string} url - WebSocket服务器地址
   * @param {string} namespace - 命名空间（可选）
   * @param {object} options - Socket.io配置选项
   */
  const connect = (url, namespace = '', options = {}) => {
    try {
      const fullUrl = namespace ? `${url}${namespace}` : url
      
      console.log(`尝试连接 WebSocket: ${fullUrl}`)
      
      socket.value = io(fullUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        ...options
      })

      // 连接成功
      socket.value.on('connect', () => {
        console.log('✅ WebSocket 已连接')
        isConnected.value = true
        reconnectAttempts.value = 0
      })

      // 连接断开
      socket.value.on('disconnect', (reason) => {
        console.warn('⚠️ WebSocket 已断开:', reason)
        isConnected.value = false
      })

      // 重连尝试
      socket.value.on('reconnect_attempt', (attempt) => {
        reconnectAttempts.value = attempt
        console.log(`🔄 尝试重连 WebSocket (${attempt}/${maxReconnectAttempts})...`)
      })

      // 重连失败
      socket.value.on('reconnect_failed', () => {
        console.error('❌ WebSocket 重连失败，已达到最大重试次数')
      })

      // 连接错误
      socket.value.on('connect_error', (error) => {
        console.error('❌ WebSocket 连接错误:', error.message)
      })

      return socket.value
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error)
      return null
    }
  }

  /**
   * 断开连接
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      console.log('🔌 WebSocket 已断开')
    }
  }

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数
   */
  const on = (event, callback) => {
    if (socket.value) {
      socket.value.on(event, callback)
    }
  }

  /**
   * 取消监听事件
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数（可选）
   */
  const off = (event, callback) => {
    if (socket.value) {
      socket.value.off(event, callback)
    }
  }

  /**
   * 发送事件
   * @param {string} event - 事件名称
   * @param {any} data - 数据
   */
  const emit = (event, data) => {
    if (socket.value && isConnected.value) {
      socket.value.emit(event, data)
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }

  // 组件卸载时自动断开连接
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    on,
    off,
    emit
  }
}

