<template>
  <div v-if="currentShot" class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <el-button :icon="ArrowLeft" text @click="$router.back()">返回</el-button>
        <h1 class="text-2xl font-bold text-comic-text">镜头 {{ currentShot.code }}</h1>
        <el-tag :type="getStatusType(currentShot.status)">
          {{ getStatusLabel(currentShot.status) }}
        </el-tag>
      </div>
      <div class="flex gap-3">
        <el-button type="primary" @click="saveShot">保存</el-button>
        <el-button :icon="Refresh" @click="regenerate">重新生成</el-button>
        <el-button type="success" :icon="Check" @click="approve">通过</el-button>
        <el-button type="danger" :icon="Close" @click="reject">驳回</el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Image Generation & Video Generation -->
      <div class="space-y-6">
        <!-- Image Generation Module -->
        <el-card shadow="never" class="comic-card" :body-style="{ padding: '0px' }">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-comic-text">分镜图片生成</span>
              <div class="flex gap-2 hidden md:flex">
                <el-button text @click="copyPrompt">复制</el-button>
                <el-button text @click="optimizePrompt">AI优化</el-button>
              </div>
            </div>
          </template>
          
          <div class="flex flex-col h-full" style="max-height: 480px;">
             <!-- Upper: Prompt -->
             <div class="p-4 flex-shrink-0">
               <h3 class="text-sm font-medium text-comic-text mb-2 text-left hidden md:block" style="font-weight: 500;">图片提示词</h3>
               <el-input
                 v-model="promptContent"
                 type="textarea"
                 :rows="3"
                 placeholder="输入提示词以生成图片..."
               />
             </div>
             
             <!-- Divider -->
             <div class="h-px bg-gray-200 flex-shrink-0" style="background-color: #E5E7EB;"></div>
             
             <!-- Lower: Preview (Scrollable) -->
             <div class="p-4 overflow-y-auto flex-1">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div v-for="(img, idx) in currentShot.images.filter(i => i.type === 'image')" :key="img.id" class="relative aspect-square group bg-gray-100 rounded overflow-hidden">
                    <img :src="img.url" class="w-full h-full object-cover" />
                    <!-- Download Button -->
                    <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <el-button 
                        type="primary" 
                        circle 
                        size="small" 
                        :icon="Download" 
                        :loading="imageDownloadLoading[idx]"
                        @click="downloadImage(idx)"
                      />
                    </div>
                  </div>
                  <!-- Placeholders if empty or less than 9? Requirements say "forced 3x3 layout" but usually implies grid structure, not necessarily filling empty slots with placeholders unless specified. User said "Picture preview area forced 3x3 grid". I will use grid css. -->
                   <div v-if="!currentShot.images.some(i => i.type === 'image')" class="col-span-full flex flex-col items-center justify-center py-8 text-gray-400">
                      <el-icon :size="48"><Picture /></el-icon>
                      <p class="mt-2 text-sm">暂无图片</p>
                      <el-button type="primary" class="mt-4" size="small" @click="generateImage">生成图片</el-button>
                   </div>
                </div>
             </div>
          </div>
        </el-card>

        <!-- Video Generation Module -->
        <el-card shadow="never" class="comic-card">
           <template #header>
            <span class="text-base font-bold text-comic-text">分镜视频生成</span>
           </template>
           
           <div class="space-y-4">
             <!-- Upper: Video Prompt -->
             <div class="flex flex-col">
               <h3 class="text-sm font-medium text-comic-text mb-2 text-left" style="font-weight: 500;">视频提示词</h3>
               <el-input
                 v-model="videoPromptContent"
                 type="textarea"
                 :rows="4"
                 maxlength="512"
                 show-word-limit
                 placeholder="输入提示词以生成视频..."
                 style="height: 120px;"
                 input-style="height: 100%;"
               />
             </div>
             
             <!-- Lower: Video Preview -->
             <div class="aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center min-w-[320px]">
                <div v-if="!videoUrl" class="text-center text-gray-500 w-full h-full flex items-center justify-center">
                   <div v-if="videoGenerating" class="flex flex-col items-center text-white">
                     <el-icon class="is-loading" :size="32"><Refresh /></el-icon>
                     <p class="mt-2 text-sm">视频生成中...</p>
                   </div>
                   <div v-else class="flex flex-col items-center text-gray-400">
                     <el-icon :size="48"><VideoPlay /></el-icon>
                     <p class="mt-2 text-sm mb-4">暂无视频</p>
                     <el-button type="primary" @click="generateVideo">生成视频</el-button>
                   </div>
                </div>
                
                <div v-else class="w-full h-full relative group video-container">
                   <video 
                     ref="videoPlayer"
                     :src="videoUrl" 
                     class="w-full h-full object-contain"
                     @timeupdate="onTimeUpdate"
                     @ended="onEnded"
                     @click="togglePlay"
                   ></video>
                   
                   <!-- Custom Controls -->
                   <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3 text-white">
                      <button @click="togglePlay" class="hover:text-primary-400">
                        <el-icon :size="24"><component :is="isPlaying ? VideoPause : VideoPlay" /></el-icon>
                      </button>
                      
                      <div class="flex-1 flex items-center gap-2 text-xs">
                        <span>{{ formatTime(currentTime) }}</span>
                        <input 
                          type="range" 
                          min="0" 
                          :max="duration" 
                          v-model="currentTime" 
                          @input="onSeek"
                          class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                        <span>{{ formatTime(duration) }}</span>
                      </div>
                      
                      <div class="flex items-center gap-3">
                         <button @click="toggleMute" class="hover:text-primary-400">
                           <el-icon :size="20"><component :is="isMuted ? Mute : Microphone" /></el-icon>
                         </button>
                         <button @click="toggleFullScreen" class="hover:text-primary-400">
                           <el-icon :size="20"><FullScreen /></el-icon>
                         </button>
                         <!-- Download Button at far right -->
                         <el-button 
                           type="primary" 
                           circle 
                           size="small" 
                           :icon="Download" 
                           :loading="videoDownloadLoading"
                           @click="downloadVideo"
                         />
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </el-card>
      </div>

      <!-- Right: Shot Info -->
      <div class="space-y-4">
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">镜头信息</span>
          </template>
          <el-form label-width="100px">
            <el-form-item label="编号">
              <el-input v-model="shotForm.code" />
            </el-form-item>
            <el-form-item label="画面描述">
              <el-input v-model="shotForm.description" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="台词">
              <el-input v-model="shotForm.dialogue" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="景别">
              <el-select v-model="shotForm.shotSize" class="w-full">
                <el-option
                  v-for="opt in SHOT_SIZE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="角度">
              <el-select v-model="shotForm.angle" class="w-full">
                <el-option
                  v-for="opt in ANGLE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="运镜">
              <el-select v-model="shotForm.movement" class="w-full">
                <el-option
                  v-for="opt in MOVEMENT_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时长">
              <el-slider v-model="shotForm.duration" :min="1" :max="60" show-input />
            </el-form-item>
            <el-form-item label="主体人物">
              <el-input v-model="shotForm.subject" placeholder="描述该分镜的主要人物" />
            </el-form-item>
            <el-form-item label="场景详情">
              <el-input v-model="shotForm.sceneDetail" type="textarea" :rows="3" placeholder="详细说明分镜发生的环境、地点及空间关系" />
            </el-form-item>
            <el-form-item label="氛围参照">
              <el-input v-model="shotForm.atmosphere" type="textarea" :rows="3" placeholder="描述情绪基调及可参考的视觉风格范例" />
            </el-form-item>
            <el-form-item label="灯光设计">
              <el-input v-model="shotForm.lighting" type="textarea" :rows="3" placeholder="描述光源类型、光照强度、光影效果等技术参数" />
            </el-form-item>
            <el-form-item label="特效">
              <el-input v-model="shotForm.effects" type="textarea" :rows="3" placeholder="标注需要实现的视觉特效类型及技术要求" />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Bound Assets -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">绑定资产</span>
          </template>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-comic-muted mb-2">角色</p>
              <div class="flex flex-wrap gap-2">
                <el-tag
                  v-for="charId in shotForm.characters"
                  :key="charId"
                  closable
                  @close="removeCharacter(charId)"
                >
                  {{ getCharacterName(charId) }}
                </el-tag>
                <el-button size="small" :icon="Plus" @click="showAddCharacter = true">添加</el-button>
              </div>
            </div>
            <div>
              <p class="text-sm text-comic-muted mb-2">场景</p>
              <div class="flex flex-wrap gap-2">
                <el-tag
                  v-for="sceneId in shotForm.scenes"
                  :key="sceneId"
                  closable
                  @close="removeScene(sceneId)"
                >
                  {{ getSceneName(sceneId) }}
                </el-tag>
                <el-button size="small" :icon="Plus" @click="showAddScene = true">添加</el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Operation module removed as per requirement -->
      </div>
    </div>
  </div>

  <el-empty v-else description="镜头不存在" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Refresh, Check, Close, Picture,
  Plus, VideoPlay, VideoPause, FullScreen, Download, Mute, Microphone
} from '@element-plus/icons-vue'
import { useStoryboardStore, useAssetStore } from '@/stores'
import { SHOT_SIZE_OPTIONS, ANGLE_OPTIONS, MOVEMENT_OPTIONS } from '@/types'

const route = useRoute()
const storyboardStore = useStoryboardStore()
const assetStore = useAssetStore()

const currentShot = computed(() => {
  const shotId = route.params.id as string
  return storyboardStore.currentShots.find(s => s.id === shotId)
})

const shotForm = ref({
  code: currentShot.value?.code || '',
  description: currentShot.value?.description || '',
  dialogue: currentShot.value?.dialogue || '',
  shotSize: currentShot.value?.shotSize || 'medium',
  angle: currentShot.value?.angle || 'eye_level',
  movement: currentShot.value?.movement || 'static',
  duration: currentShot.value?.duration || 5,
  characters: currentShot.value?.characters || [],
  scenes: currentShot.value?.scenes || [],
  subject: currentShot.value?.subject || '',
  sceneDetail: currentShot.value?.sceneDetail || '',
  atmosphere: currentShot.value?.atmosphere || '',
  lighting: currentShot.value?.lighting || '',
  effects: currentShot.value?.effects || '',
})

// Image Generation State
const promptContent = ref('')
const showAddCharacter = ref(false)
const showAddScene = ref(false)
const imageDownloadLoading = reactive<Record<number, boolean>>({})

// Video Generation State
const videoPromptContent = ref('')
const videoGenerating = ref(false)
const videoDownloadLoading = ref(false)
const videoUrl = ref('') // Mock video URL
const videoPlayer = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isMuted = ref(false)

onMounted(() => {
  if (currentShot.value) {
    shotForm.value = {
      code: currentShot.value.code,
      description: currentShot.value.description,
      dialogue: currentShot.value.dialogue || '',
      shotSize: currentShot.value.shotSize,
      angle: currentShot.value.angle,
      movement: currentShot.value.movement,
      duration: currentShot.value.duration,
      characters: currentShot.value.characters,
      scenes: currentShot.value.scenes,
      subject: currentShot.value.subject || '',
      sceneDetail: currentShot.value.sceneDetail || '',
      atmosphere: currentShot.value.atmosphere || '',
      lighting: currentShot.value.lighting || '',
      effects: currentShot.value.effects || '',
    }
    promptContent.value = currentShot.value.prompt || ''
    videoPromptContent.value = currentShot.value.videoPrompt || ''
    
    // Check if there is an existing video
    const video = currentShot.value.images.find(img => img.type === 'video')
    if (video) {
      videoUrl.value = video.url
    }
  }
})

// ... (helpers like getStatusType, getCharacterName remain same) ...

const downloadImage = async (index: number) => {
  if (!currentShot.value?.images[index]) return
  
  imageDownloadLoading[index] = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock download
    const link = document.createElement('a')
    link.href = currentShot.value.images[index].url
    link.download = `shot${currentShot.value.id}_image_${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('下载完成')
  } catch (error) {
    ElMessage.error('下载失败')
  } finally {
    imageDownloadLoading[index] = false
  }
}

const generateVideo = async () => {
  if (videoGenerating.value) return
  
  videoGenerating.value = true
  try {
    // Simulate POST /api/shots/{id}/video/generate and polling
    // 30s timeout simulation with progress steps
    const steps = 10
    for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000)) // 3s * 10 = 30s max
        // In real world, we check status here. 
        // For mock, we just finish after some time.
        if (i === 1) break; // Speed up for demo: 6s total
    }
    
    // Mock success result
    videoUrl.value = 'https://www.w3schools.com/html/mov_bbb.mp4' // Placeholder video
    ElMessage.success('视频生成成功')
    
    // Update store (mock)
    if (currentShot.value) {
        // In real app, store action would handle this
        currentShot.value.videoPrompt = videoPromptContent.value
    }
    
  } catch (error) {
    ElMessage.error('视频生成失败，请重试')
  } finally {
    videoGenerating.value = false
  }
}

const downloadVideo = async () => {
  if (!videoUrl.value) return
  
  videoDownloadLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const link = document.createElement('a')
    link.href = videoUrl.value
    link.download = `shot${currentShot.value?.id || ''}_video_${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('视频下载完成')
  } catch (error) {
    ElMessage.error('下载失败')
  } finally {
    videoDownloadLoading.value = false
  }
}

// Video Player Controls
const togglePlay = () => {
  if (!videoPlayer.value) return
  if (isPlaying.value) {
    videoPlayer.value.pause()
  } else {
    videoPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const onTimeUpdate = () => {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime
    duration.value = videoPlayer.value.duration || 0
  }
}

const onEnded = () => {
  isPlaying.value = false
}

const onSeek = () => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = currentTime.value
  }
}

const toggleMute = () => {
  if (videoPlayer.value) {
    videoPlayer.value.muted = !videoPlayer.value.muted
    isMuted.value = videoPlayer.value.muted
  }
}

const toggleFullScreen = () => {
  if (videoPlayer.value) {
    if (!document.fullscreenElement) {
      videoPlayer.value.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Keep existing helpers

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    generating: 'warning',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    deprecated: 'info',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待生成',
    generating: '生成中',
    pending_review: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    deprecated: '已废弃',
  }
  return map[status] || status
}

const getCharacterName = (id: string) => {
  const char = assetStore.characters.find(c => c.id === id)
  return char?.name || id
}

const getSceneName = (id: string) => {
  const scene = assetStore.scenes.find(s => s.id === id)
  return scene?.name || id
}

const removeCharacter = (id: string) => {
  shotForm.value.characters = shotForm.value.characters.filter(c => c !== id)
}

const removeScene = (id: string) => {
  shotForm.value.scenes = shotForm.value.scenes.filter(s => s !== id)
}

const copyPrompt = () => {
  navigator.clipboard.writeText(promptContent.value)
  ElMessage.success('提示词已复制')
}

const optimizePrompt = () => {
  ElMessage.info('AI优化中...')
}

const generateImage = () => {
  ElMessage.info('生成图片功能开发中')
}

const regenerate = () => {
  ElMessage.info('重新生成中...')
}

const approve = () => {
  if (currentShot.value) {
    storyboardStore.approveShot(currentShot.value.id)
    ElMessage.success('镜头已通过')
  }
}

const reject = () => {
  if (currentShot.value) {
    storyboardStore.rejectShot(currentShot.value.id)
    ElMessage.success('镜头已驳回')
  }
}

const saveShot = () => {
  if (currentShot.value) {
    storyboardStore.updateShot(currentShot.value.id, {
      ...shotForm.value,
      prompt: promptContent.value,
    })
    ElMessage.success('保存成功')
  }
}
</script>
