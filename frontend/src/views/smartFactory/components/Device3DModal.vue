<template>
  <div v-if="visible" class="device-3d-modal" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <div class="modal-title">{{ deviceName }} - 3D模型展示</div>
        <div class="modal-close" @click="closeModal">×</div>
      </header>
      
      <div class="modal-body">
        <!-- 3D渲染容器 -->
        <div ref="threeContainer" class="three-container">
          <!-- Loading状态 -->
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <div class="loading-text">
              <div class="loading-title">正在加载3D模型</div>
              <div class="loading-tip">{{ loadingTip }}</div>
            </div>
          </div>

          <!-- 浮动部件信息对话框 -->
          <div 
            v-if="floatingDialog.visible" 
            class="floating-part-dialog"
            :style="{
              left: floatingDialog.position.x + 'px',
              top: floatingDialog.position.y + 'px',
            }"
          >
            <!-- 对话框内容 -->
            <div class="floating-dialog-content">
              <div class="floating-dialog-header">
                <span class="part-name">{{ floatingDialog.partInfo?.name }}</span>
                <span class="close-floating" @click="closeFloatingDialog">×</span>
              </div>
              <div class="floating-dialog-body">
                <div 
                  class="info-row" 
                  v-for="spec in floatingDialog.partInfo?.specs" 
                  :key="spec.key"
                >
                  <span class="info-label">{{ spec.label }}</span>
                  <span class="info-value">{{ spec.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 设备信息面板 -->
        <div class="device-info-panel">
          <h4>设备参数</h4>
          <div class="info-list">
            <div class="info-item">
              <span>状态:</span>
              <span :class="deviceData?.status">{{ deviceData?.status }}</span>
            </div>
            <div class="info-item">
              <span>效率:</span>
              <span>{{ deviceData?.efficiency }}%</span>
            </div>
            <div class="info-item">
              <span>温度:</span>
              <span>{{ deviceData?.temperature }}°C</span>
            </div>
          </div>

          <!-- 独立的部件详情区域 -->
          <div class="part-details-section">
            <h4>部件详情</h4>
            <div v-if="selectedPart" class="part-info">
              <div class="part-header">
                <div class="part-name">{{ selectedPart.name }}</div>
                <div class="part-status" :class="selectedPart.status">{{ selectedPart.status }}</div>
              </div>
              <div class="part-specs">
                <div class="spec-item" v-for="spec in selectedPart.specs" :key="spec.key">
                  <span class="spec-label">{{ spec.label }}</span>
                  <span class="spec-value">{{ spec.value }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-selection">
              <div class="hint-icon">🔍</div>
              <div class="hint-text">点击3D模型查看部件详情</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { useDevice } from '../composables/useDevice'

const props = defineProps({
  visible: Boolean,
  deviceData: Object,
  deviceName: String
})

const emit = defineEmits(['close'])

// Three.js 相关变量
const threeContainer = ref(null)
let scene = null
let camera = null
let renderer = null
let controls = null
let model = null
let animationId = null
let mixer = null
let clock = new THREE.Clock()

// 添加loading相关状态
const isLoading = ref(true)
const loadingTip = ref('初始化3D场景...')

// 添加部件相关状态
const selectedPart = ref(null)

// 浮动对话框相关状态
const floatingDialog = ref({
  visible: false,
  position: { x: 0, y: 0 },
  partInfo: null,
  connectionAngle: 0,
  connectionLength: 0,
  intersectionPoint: { x: 0, y: 0, z: 0 } // 射线相交点
})

// 创建射线投射器
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// 记录上一个被点击的对象
let lastSelectedObject = null

// 处理物体选中时的颜色变化
const handleObjectSelection = (selectedObject) => {
  // 如果之前有选中的物体，将其颜色恢复为初始状态
  if (lastSelectedObject) {
    lastSelectedObject.material.color.set(lastSelectedObject.initialColor)
  }
  // 记录当前选中物体的状态并设置高亮颜色
  selectedObject.initialColor = selectedObject.material.color.clone()
  lastSelectedObject = selectedObject
  selectedObject.material.color.set(0xff62e258)
}

// 处理取消选择时的颜色恢复
const clearObjectSelection = () => {
  if (lastSelectedObject) {
    lastSelectedObject.material.color.set(lastSelectedObject.initialColor)
    lastSelectedObject = null
  }
}

// 关闭浮动对话框
const closeFloatingDialog = () => {
  floatingDialog.value.visible = false
  floatingDialog.value.partInfo = null
}

// 根据射线相交点计算浮动对话框位置
const calculateDialogPositionFromIntersection = (intersectionPoint) => {
  const containerRect = threeContainer.value.getBoundingClientRect()
  if (!containerRect || !camera) return null

  // 将射线相交的世界坐标投影到屏幕坐标
  const screenPosition = intersectionPoint.clone()
  screenPosition.project(camera)
  
  // 检查是否在相机前面
  if (screenPosition.z > 1) return null

  // 转换为屏幕像素坐标
  const screenX = (screenPosition.x * 0.5 + 0.5) * containerRect.width
  const screenY = -(screenPosition.y * 0.5 - 0.5) * containerRect.height
  
  // 对话框尺寸
  const dialogWidth = 280
  const dialogHeight = 180
  const padding = 10 // 减小padding，给更多空间
  const offsetDistance = 60

  // 改进的定位逻辑
  let finalX = screenX + offsetDistance
  if (finalX + dialogWidth > containerRect.width - padding) {
    finalX = screenX - offsetDistance - dialogWidth
  }
  if (finalX < padding) {
    finalX = padding
  }

  // 改进垂直定位 - 优先显示在上方
  let finalY = screenY - dialogHeight - 20 // 优先放在点击点上方
  if (finalY < padding) {
    // 上方空间不够，尝试放在下方
    finalY = screenY + 20
    if (finalY + dialogHeight > containerRect.height - padding) {
      // 下方也不够，放在垂直居中
      finalY = Math.max(padding, Math.min(
        screenY - dialogHeight / 2, 
        containerRect.height - dialogHeight - padding
      ))
    }
  }

  return {
    x: finalX,
    y: finalY
  }
}

// 更新浮动对话框位置（相机移动时）
const updateFloatingDialogPosition = () => {
  if (!floatingDialog.value.visible || !camera || !threeContainer.value) return

  const intersectionPoint = new THREE.Vector3(
    floatingDialog.value.intersectionPoint.x,
    floatingDialog.value.intersectionPoint.y,
    floatingDialog.value.intersectionPoint.z
  )

  const newPosition = calculateDialogPositionFromIntersection(intersectionPoint)
  if (newPosition) {
    floatingDialog.value.position = { x: newPosition.x, y: newPosition.y }
  } else {
    floatingDialog.value.visible = false
  }
}

// 改进部件信息获取函数，包含相交点信息
const getPartInfoWithIntersection = (selectedObject, intersectionPoint) => {
  // 获取对象世界坐标
  const worldPosition = new THREE.Vector3()
  selectedObject.getWorldPosition(worldPosition)
  
  // 计算包围盒获取尺寸信息
  const boundingBox = new THREE.Box3().setFromObject(selectedObject)
  const size = boundingBox.getSize(new THREE.Vector3())
  
  return {
    name: selectedObject.name || 'randomName',
    status: 'normal',
    specs: [
      { key: 'object_name', label: '对象名称', value: selectedObject.name || '未命名' },
      { key: 'material', label: '材质类型', value: selectedObject.material?.name || '标准材质' },
      { key: 'click_point', label: '点击坐标', value: `(${intersectionPoint.x.toFixed(2)}, ${intersectionPoint.y.toFixed(2)}, ${intersectionPoint.z.toFixed(2)})` },
      { key: 'object_center', label: '对象中心', value: `(${worldPosition.x.toFixed(2)}, ${worldPosition.y.toFixed(2)}, ${worldPosition.z.toFixed(2)})` },
      { key: 'bounding_size', label: '包围盒尺寸', value: `${size.x.toFixed(2)}×${size.y.toFixed(2)}×${size.z.toFixed(2)}` },
      { key: 'status', label: '检测状态', value: '正常运行' }
    ]
  }
}

// 鼠标点击事件监听
const mouseClick = (event) => {
  console.log("点击事件")
  const rect = threeContainer.value.getBoundingClientRect()
  
  // 将鼠标坐标归一化
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // 强制更新场景中所有对象的世界变换矩阵，确保旋转后的模型位置计算正确
  scene.updateMatrixWorld(true)
  
  // 设置射线起点为鼠标位置，射线的方向为相机视角方向
  raycaster.setFromCamera(mouse, camera)
  
  // 计算射线相交
  console.log("scene.children", scene.children)
  const intersects = raycaster.intersectObjects(scene.children, true)
  
  if (intersects.length > 0) {
    const selectedObject = intersects[0].object
    const intersectionPoint = intersects[0].point // 使用射线相交点！
    
    console.log(`点击了${selectedObject.name}`)
    console.log('射线相交点:', intersectionPoint)
    
    // 处理物体选中的颜色变化
    handleObjectSelection(selectedObject)
    
    // 获取并显示部件信息（包含相交点信息）
    const partInfo = getPartInfoWithIntersection(selectedObject, intersectionPoint)
    selectedPart.value = partInfo
    
    // 显示浮动对话框
    const dialogPosition = calculateDialogPositionFromIntersection(intersectionPoint)
    if (dialogPosition) {
      floatingDialog.value = {
        visible: true,
        position: { x: dialogPosition.x, y: dialogPosition.y },
        partInfo: partInfo,
        intersectionPoint: { 
          x: intersectionPoint.x, 
          y: intersectionPoint.y, 
          z: intersectionPoint.z 
        }
      }
    }
    
  } else {
    clearObjectSelection()
    selectedPart.value = null
    closeFloatingDialog()
  }
}

// 初始化3D场景
const init3DScene = async () => {
  if (!threeContainer.value) return

  // 创建场景
  scene = new THREE.Scene()
  console.log("scene", scene)

  // 创建相机
  const containerRect = threeContainer.value.getBoundingClientRect()
  camera = new THREE.PerspectiveCamera(
    50,
    containerRect.width / containerRect.height,
    0.01,
    1000
  )
  camera.position.set(0, 100, 0)
  camera.lookAt(0, 0, 0)
  scene.add(camera)

  // 添加灯光
  let ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  const parallelLight = new THREE.DirectionalLight(0xffffff, 1.5)
  parallelLight.position.set(200, 300, 200)
  parallelLight.castShadow = true
  parallelLight.shadow.mapSize.width = 2048
  parallelLight.shadow.mapSize.height = 2048
  parallelLight.shadow.camera.near = 0.1
  parallelLight.shadow.camera.far = 1000
  parallelLight.shadow.camera.left = -100
  parallelLight.shadow.camera.right = 100
  parallelLight.shadow.camera.top = 100
  parallelLight.shadow.camera.bottom = -100
  parallelLight.shadow.bias = -0.0001
  scene.add(parallelLight)

  // 辅助平行光：提供背光和轮廓光
  const parallelLight2 = new THREE.DirectionalLight(0xffffff, 0.3)
  parallelLight2.position.set(-100, 100, -100)
  scene.add(parallelLight2)

  // 补充点光源：增强立体感和细节
  const pointLight = new THREE.PointLight(0xffffff, 0.8, 200)
  pointLight.position.set(50, 50, 100)
  scene.add(pointLight)
  
  // 底部补光
  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2)
  bottomLight.position.set(0, -100, 100)
  scene.add(bottomLight)

  updateLoadingTip('初始化渲染器...', 40)

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    precision: "highp"
  })
  renderer.shadowMap.enabled = true
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor("#fff", 0.1)
  renderer.setSize(containerRect.width, containerRect.height)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  
  threeContainer.value.appendChild(renderer.domElement)

  // 使用渲染器 通过相机将场景渲染出来
  renderer.render(scene, camera)
  
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.maxPolarAngle = 2
  controls.minPolarAngle = 0.0
  controls.autoRotate = false
  controls.enableRotate = true
  controls.enableZoom = true
  controls.enableDamping = false
  // controls.dampingFactor = 0.25 // 关闭阻尼
  controls.update()

  updateLoadingTip('加载3D模型...', 60)

  // 加载3D模型
  await load3DModel()

  // 添加点击监听
  threeContainer.value.addEventListener("click", mouseClick, false)

  // 开始渲染循环
  animate()
}

// 加载3D模型
const load3DModel = async () => {
  const gltfLoader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  
  dracoLoader.setDecoderPath("./node_modules/three/examples/jsm/libs/draco/")
  dracoLoader.setDecoderConfig({ type: "js" })
  gltfLoader.setDRACOLoader(dracoLoader)
  
  try {
    const modelPath = getModelPathByDeviceType(props.deviceData)
    
    const glb = await new Promise((resolve, reject) => {
      gltfLoader.load(
        modelPath, 
        resolve, 
        // 进度回调
        (progress) => {
          if (progress.lengthComputable) {
            const percent = Math.round((progress.loaded / progress.total) * 100)
            const adjustedPercent = 70 + (percent * 0.2) // 70-90%
            updateLoadingTip(`加载模型: ${percent}%`, adjustedPercent)
          }
        }, 
        reject
      )
    })

    updateLoadingTip('处理模型数据...', 90)

    console.log("glb", glb)
    model = glb.scene
    
    // 设置模型初始位置和缩放
    model.position.set(0, 0, 0)  // 调整到原点
    model.scale.set(0.01, 0.01, 0.01)  // 初始很小，几乎看不见
    
    model.traverse((child) => {
      if (child.isMesh) {
        // 双面渲染
        child.material.side = THREE.DoubleSide
        //模型阴影
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    const animation = glb.animations?.[0]
    scene.add(model)
    model.rotation.y = -Math.PI / 18

    // 等待渲染完成后隐藏loading
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateLoadingTip('加载完成!', 100)
        isLoading.value = false
        startComplexAnimation()
      })
    })

    // 模型自带动画
    if (animation) {
      mixer = new THREE.AnimationMixer(model)
      const clipAction = mixer.clipAction(animation)
      clipAction.play()
      clipAction.timeScale = 0.5
    }

  } catch (error) {
    console.error('模型加载失败:', error)
  }
}

// 动画序列函数
const startComplexAnimation = () => {
  // 第一阶段：从很小放大到正常大小（俯视角度）
  const scaleUpTween = new TWEEN.Tween(model.scale)
    .to({ x: 20, y: 20, z: 20 }, 1500)
    .easing(TWEEN.Easing.Back.Out)
    .onComplete(() => {
      console.log('缩放完成')
      // 第二阶段：相机移动到正面视角
      startCameraMovement()
    })
    .start()
}

// 相机移动动画
const startCameraMovement = () => {
  // 相机位置动画：从俯视移动到正面
  const cameraPositionTween = new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 10, z: 50 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)

  // 相机lookAt动画（创建一个临时对象来控制lookAt目标）
  const lookAtTarget = { x: 0, y: 0, z: 0 }
  const cameraLookAtTween = new TWEEN.Tween(lookAtTarget)
    .to({ x: 0, y: 0, z: 0 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z)
    })
    .onComplete(() => {
      console.log('相机移动完成')
      startContinuousRotation()
    })

  // 同时启动位置和lookAt动画
  cameraPositionTween.start()
  cameraLookAtTween.start()
}

// 持续旋转动画
const startContinuousRotation = () => {
  const continuousRotationTween = new TWEEN.Tween(model.rotation)
    .to({ y: model.rotation.y + Math.PI / 9 }, 5000)
    .repeat(Infinity)
    .yoyo(true)
    .start()
}

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  TWEEN.update() // 更新TWEEN动画

  // 更新模型自带动画
  if (mixer) {
    const delta = clock.getDelta()
    mixer.update(delta)
  }

  controls.update()

  // 更新浮动对话框位置
  updateFloatingDialogPosition()
  
  renderer.render(scene, camera)
}

// 根据设备数据获取模型路径 - 使用图片名称匹配
const getModelPathByDeviceType = (deviceData) => {
  // 导入 useDevice 来获取图片路径
  const { getDeviceIconPath } = useDevice()
  
  // 获取设备的图片路径
  const iconPath = getDeviceIconPath(deviceData.type, deviceData.id)
  
  // 从图片路径中提取文件名（不含扩展名）
  const pathParts = iconPath.split('/')
  const fileName = pathParts[pathParts.length - 1] // 获取最后一部分
  const nameWithoutExt = fileName.replace('.svg', '') // 移除.svg扩展名
  
  // 构建对应的模型路径
  const modelPath = `/src/assets/model/${nameWithoutExt}.glb`
  
  console.log(`设备 ${deviceData.id}: 图片路径 ${iconPath} -> 模型路径 ${modelPath}`)
  
  return modelPath
}

// 关闭弹窗
const closeModal = () => {
  // 关闭浮动对话框
  closeFloatingDialog()
  // 清除选中状态
  clearObjectSelection()
  selectedPart.value = null

  emit('close')
}

// 清理3D场景
const cleanup3DScene = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // 移除点击事件监听
  if (threeContainer.value) {
    threeContainer.value.removeEventListener("click", mouseClick, false)
  }
  
  if (renderer) {
    renderer.dispose()
    if (threeContainer.value && renderer.domElement) {
      threeContainer.value.removeChild(renderer.domElement)
    }
  }
  
  if (controls) {
    controls.dispose()
  }
  
  scene = null
  camera = null
  renderer = null
  controls = null
  model = null
  mixer = null
  lastSelectedObject = null

  closeFloatingDialog()
  selectedPart.value = null
}

// 更新loading提示的函数
const updateLoadingTip = (tip, progress = null) => {
  loadingTip.value = tip
}

// 监听弹窗显示状态，重置loading状态
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    // 重置loading状态
    isLoading.value = true
    loadingTip.value = '初始化3D场景...'
    
    await nextTick()
    await init3DScene()
  } else {
    cleanup3DScene()
  }
})

onUnmounted(() => {
  cleanup3DScene()
})
</script>

<style scoped>
.device-3d-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: clamp(1200px, 90vw, 90vw);
  height: 80vh;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 31, 58, 0.9) 100%);
  border-radius: 12px;
  border: 2px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, transparent 100%);
}

.modal-title {
  color: #00ffff;
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.modal-close {
  cursor: pointer;
  font-size: 30px;
  color: #00ffff;
  transition: all 0.3s;
}

.modal-close:hover {
  color: #ff006e;
}

.modal-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

.three-container {
  flex: 3;
  background: radial-gradient(ellipse at center, rgba(26, 31, 58, 0.5) 0%, rgba(10, 14, 39, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
}

.device-info-panel {
  flex: 1;
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding: 20px;
}

.device-info-panel h4 {
  color: #8b5cf6;
  margin-top: 0;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 3px solid rgba(0, 255, 255, 0.3);
}

.info-item span:first-child {
  color: rgba(0, 255, 255, 0.7);
  font-size: 14px;
}

.info-item span:last-child {
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
}

.info-item .running {
  color: #00ff88;
}

.info-item .error {
  color: #ff006e;
}

/* Loading样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 31, 58, 0.9) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.loading-spinner {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 30px;
}

.spinner-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  border: 3px solid transparent;
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 100px;
  height: 100px;
  border-top-color: #8b5cf6;
  animation-duration: 2s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 60px;
  height: 60px;
  border-top-color: #ff006e;
  animation-duration: 1s;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.loading-text {
  text-align: center;
  color: #ffffff;
}

.loading-title {
  font-size: 18px;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.loading-progress {
  font-size: 24px;
  font-weight: bold;
  color: #8b5cf6;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
}

.loading-tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.part-details-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(0, 255, 136, 0.3);
}

.part-info {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
}

.part-name {
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
}

.part-status {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: bold;
}

.part-status.normal {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.part-specs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 4px;
}

.spec-label {
  color: rgba(0, 255, 136, 0.8);
  font-size: 12px;
  font-weight: 500;
}

.spec-value {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: bold;
}

.no-selection {
  text-align: center;
  padding: 30px 20px;
  color: rgba(0, 255, 136, 0.6);
}

.hint-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.hint-text {
  font-size: 13px;
  font-style: italic;
}

/* 浮动部件信息对话框 */
.floating-part-dialog {
  position: absolute;
  z-index: 1000;
  pointer-events: auto;
  animation: fadeInScale 0.3s ease-out;
}

.floating-dialog-content {
  width: 280px;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 31, 58, 0.9) 100%);
  border: 2px solid rgba(0, 255, 255, 0.4);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  overflow: hidden;
}

.floating-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.part-name {
  color: #00ffff;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-floating {
  background: none;
  border: none;
  color: rgba(0, 255, 255, 0.7);
  flex: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-floating:hover {
  color: #ff006e;
  transform: scale(1.1);
}

.floating-dialog-body {
  padding: 0 15px;
  margin: 10px 0;
  max-height: 200px;
  overflow-y: auto;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 2px solid rgba(0, 255, 255, 0.3);
}

.info-label {
  color: rgba(0, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: bold;
  text-align: right;
  word-break: break-all;
  margin-left: 10px;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 滚动条 */
.floating-dialog-body::-webkit-scrollbar {
  width: 6px;
}

.floating-dialog-body::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.1);
  border-radius: 3px;
}

.floating-dialog-body::-webkit-scrollbar-thumb {
  background:  rgba(0, 255, 255, 0.5);
  border-radius: 3px;
}
</style>