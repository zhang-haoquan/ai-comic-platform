<template>
  <div v-if="currentAsset" class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <el-button :icon="ArrowLeft" text @click="$router.back()">返回</el-button>
        <h1 class="text-2xl font-bold text-comic-text">{{ currentAsset.name }}</h1>
        <el-tag :type="getAssetTypeColor(currentAsset.type)">
          {{ getAssetTypeLabel(currentAsset.type) }}
        </el-tag>
      </div>
      <div class="flex gap-3">
        <el-button :icon="Edit" @click="showEdit = true">编辑信息</el-button>
        <el-button type="primary" :icon="Plus" @click="showGenerate = true">生成图片</el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Images -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Main Image -->
        <el-card shadow="never" class="comic-card">
          <div class="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              v-if="currentImage?.url"
              :src="currentImage.url"
              class="w-full h-full object-contain"
              :alt="currentAsset.name"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <el-icon :size="64" class="text-gray-300">
                <component :is="getAssetIcon(currentAsset.type)" />
              </el-icon>
            </div>
          </div>

          <!-- Image Versions -->
          <div v-if="currentAsset.images.length > 0" class="flex gap-2 mt-4 overflow-x-auto">
            <div
              v-for="image in currentAsset.images"
              :key="image.id"
              class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 flex-shrink-0"
              :class="currentImage?.id === image.id ? 'border-primary-500' : 'border-transparent'"
              @click="currentImage = image"
            >
              <img :src="image.url" class="w-full h-full object-cover" />
            </div>
            <div
              class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 flex-shrink-0"
              @click="showGenerate = true"
            >
              <el-icon :size="24" class="text-gray-400"><Plus /></el-icon>
            </div>
          </div>
        </el-card>

        <!-- Prompt Editor -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="section-title">提示词</span>
              <el-button type="primary" text @click="copyPrompt">复制</el-button>
            </div>
          </template>
          <el-input
            v-model="promptContent"
            type="textarea"
            :rows="4"
            placeholder="输入提示词以生成图片..."
          />
          <div class="flex justify-end mt-3">
            <el-button type="primary" @click="optimizePrompt">AI优化提示词</el-button>
          </div>
        </el-card>
      </div>

      <!-- Right: Info -->
      <div class="space-y-4">
        <!-- Basic Info -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">基本信息</span>
          </template>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-comic-muted">名称</p>
              <p class="text-comic-text font-medium">{{ currentAsset.name }}</p>
            </div>
            <div>
              <p class="text-sm text-comic-muted">描述</p>
              <p class="text-comic-text">{{ currentAsset.description }}</p>
            </div>
            <div>
              <p class="text-sm text-comic-muted">标签</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <el-tag v-for="tag in currentAsset.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
            </div>
            <div>
              <p class="text-sm text-comic-muted">创建时间</p>
              <p class="text-comic-text">{{ formatTime(currentAsset.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-comic-muted">最后更新</p>
              <p class="text-comic-text">{{ formatTime(currentAsset.updatedAt) }}</p>
            </div>
          </div>
        </el-card>

        <!-- References -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">引用追踪</span>
          </template>
          <div v-if="currentAsset.references.length > 0" class="space-y-2">
            <div
              v-for="ref in currentAsset.references"
              :key="ref.id"
              class="flex items-center gap-2 p-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100"
              @click="navigateToRef(ref)"
            >
              <el-icon :size="16"><component :is="getRefIcon(ref.type)" /></el-icon>
              <span class="text-sm">{{ ref.targetName }}</span>
              <el-tag size="small" type="info">{{ getRefLabel(ref.type) }}</el-tag>
            </div>
          </div>
          <el-empty v-else description="暂无引用" />
        </el-card>

        <!-- Actions -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">操作</span>
          </template>
          <div class="space-y-2">
            <el-button class="w-full justify-start" text :icon="Download">下载图片</el-button>
            <el-button class="w-full justify-start" text :icon="Share">分享资产</el-button>
            <el-button class="w-full justify-start" text>复制到其他项目</el-button>
            <el-button class="w-full justify-start" text :icon="Delete" type="danger" @click="deleteAsset">删除资产</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="showEdit" title="编辑资产" width="600px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="editForm.tags" multiple allow-create filterable>
            <el-option v-for="tag in editForm.tags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- Generate Dialog -->
    <el-dialog v-model="showGenerate" title="生成图片" width="700px">
      <div class="space-y-4">
        <el-form label-width="100px">
          <el-form-item label="提示词">
            <el-input v-model="generatePrompt" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="模型">
            <el-radio-group v-model="selectedModel">
              <el-radio-button label="midjourney">Midjourney</el-radio-button>
              <el-radio-button label="sdxl">SDXL</el-radio-button>
              <el-radio-button label="dalle">DALL-E 3</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图片尺寸">
            <el-radio-group v-model="imageSize">
              <el-radio-button label="1024x1024">1:1</el-radio-button>
              <el-radio-button label="1024x1536">2:3</el-radio-button>
              <el-radio-button label="1920x1080">16:9</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showGenerate = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="generateImage">开始生成</el-button>
      </template>
    </el-dialog>
  </div>

  <el-empty v-else description="资产不存在" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Edit, Plus, Download, Share, Delete,
  User, MapLocation, Box, Film, Document, Reading
} from '@element-plus/icons-vue'
import { useAssetStore, useGenerationStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const assetStore = useAssetStore()
const generationStore = useGenerationStore()

const currentAsset = computed(() => assetStore.currentAsset)
const currentImage = ref(currentAsset.value?.images.find(i => i.isDefault) || currentAsset.value?.images[0])

const promptContent = ref(currentAsset.value?.prompt?.content || '')
const showEdit = ref(false)
const showGenerate = ref(false)
const generating = ref(false)

const editForm = ref({
  name: currentAsset.value?.name || '',
  description: currentAsset.value?.description || '',
  tags: currentAsset.value?.tags || [],
})

const generatePrompt = ref('')
const selectedModel = ref('midjourney')
const imageSize = ref('1024x1536')

onMounted(() => {
  const assetId = route.params.id as string
  assetStore.setCurrentAsset(assetId)
})

const getAssetIcon = (type: string) => {
  const map: Record<string, any> = {
    character: User,
    scene: MapLocation,
    item: Box,
  }
  return map[type] || Box
}

const getAssetTypeColor = (type: string) => {
  const map: Record<string, string> = {
    character: 'primary',
    scene: 'success',
    item: 'warning',
  }
  return map[type] || 'info'
}

const getAssetTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    character: '角色',
    scene: '场景',
    item: '物品',
  }
  return map[type] || type
}

const getRefIcon = (type: string) => {
  const map: Record<string, any> = {
    shot: Film,
    script: Document,
    task: Reading,
  }
  return map[type] || Document
}

const getRefLabel = (type: string) => {
  const map: Record<string, string> = {
    shot: '镜头',
    script: '剧本',
    task: '任务',
  }
  return map[type] || type
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const copyPrompt = () => {
  navigator.clipboard.writeText(promptContent.value)
  ElMessage.success('提示词已复制')
}

const optimizePrompt = () => {
  // AI optimize prompt
  ElMessage.info('AI优化中...')
}

const saveEdit = () => {
  if (currentAsset.value) {
    assetStore.updateAsset(currentAsset.value.id, {
      name: editForm.value.name,
      description: editForm.value.description,
      tags: editForm.value.tags,
    })
    showEdit.value = false
    ElMessage.success('保存成功')
  }
}

const generateImage = async () => {
  if (!currentAsset.value) return
  
  generating.value = true
  const job = generationStore.createJob({
    targetType: currentAsset.value.type as any,
    targetId: currentAsset.value.id,
    type: 'image',
    prompt: generatePrompt.value,
    modelConfig: {
      model: selectedModel.value,
      size: imageSize.value,
    },
  })
  
  await generationStore.startJob(job.id)
  generating.value = false
  showGenerate.value = false
  ElMessage.success('图片生成完成')
}

const deleteAsset = async () => {
  if (!currentAsset.value) return
  
  try {
    await ElMessageBox.confirm('确定要删除这个资产吗？', '提示', {
      type: 'warning',
    })
    assetStore.deleteAsset(currentAsset.value.id)
    router.push('/assets')
    ElMessage.success('资产已删除')
  } catch {
    // Cancelled
  }
}

const navigateToRef = (ref: any) => {
  router.push(`/${ref.type}s/${ref.targetId}`)
}
</script>
