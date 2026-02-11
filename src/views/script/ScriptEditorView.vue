<template>
  <div class="h-full flex flex-col">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <el-button :icon="ArrowLeft" text @click="router.push('/script')">返回列表</el-button>
        <h1 class="text-2xl font-bold text-comic-text">剧本编辑器</h1>
        <el-tag :type="getStatusType(currentScript?.status)" size="small">
          {{ getStatusLabel(currentScript?.status) }}
        </el-tag>
      </div>
      <div class="flex gap-3 items-center">
        <!-- Model Selector -->
        <el-select
          v-model="selectedAiModel"
          placeholder="选择 AI 模型"
          class="w-40"
          :loading="modelSwitching"
          @change="handleModelChange"
          aria-label="选择 AI 模型"
        >
          <el-option
            v-for="model in aiModels"
            :key="model.value"
            :label="model.label"
            :value="model.value"
            :disabled="!model.available"
          >
            <div class="flex items-center justify-between w-full">
              <span>{{ model.label }}</span>
              <el-tag v-if="!model.available" size="small" type="info">维护中</el-tag>
            </div>
          </el-option>
        </el-select>
        <el-button :icon="DocumentCopy" @click="showVersions = true">版本历史</el-button>
        <el-button :icon="Upload" @click="showUpload = true">上传剧本</el-button>
        <el-button type="primary" :loading="parsing" @click="handleParse">
          一键解析
        </el-button>
        <el-button type="success" :icon="Lock" @click="handleLock">锁定剧本</el-button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Left: Editor -->
      <div class="flex-1 flex flex-col">
        <el-card shadow="never" class="comic-card flex-1 flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <el-input
                v-model="scriptTitle"
                class="w-64"
                placeholder="剧本标题"
                @blur="handleTitleUpdate"
                @keyup.enter="handleTitleUpdate"
              />
              <div class="flex items-center gap-2">
                <span class="text-sm text-comic-muted">最后保存: {{ formatTime(currentScript?.updatedAt) }}</span>
                <el-button :icon="Check" type="success" text>已保存</el-button>
              </div>
            </div>
          </template>
          
          <el-input
            v-model="scriptContent"
            type="textarea"
            :rows="25"
            placeholder="在此输入剧本内容...&#10;&#10;格式示例：&#10;第一幕：相遇&#10;&#10;场景：青云山巅 - 黄昏&#10;&#10;林小羽站在山巅，手持长剑...&#10;&#10;林小羽（独白）：这天下，终究要有人守护。"
            class="flex-1 font-mono text-base leading-relaxed"
            resize="none"
          />
        </el-card>
      </div>

      <!-- Right: Outline & Tools -->
      <div class="w-80 flex flex-col gap-4">
        <!-- Script Outline -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">剧本大纲</span>
          </template>
          <div class="space-y-2">
            <div
              v-for="item in outlineItems"
              :key="item.id"
              class="p-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100"
              @click="handleOutlineClick(item)"
            >
              <p class="text-sm font-medium text-comic-text">{{ item.title }}</p>
              <p class="text-xs text-comic-muted mt-1">{{ item.subtitle }}</p>
            </div>
          </div>
        </el-card>

        <!-- Quick Stats -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">剧本统计</span>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 rounded-lg bg-gray-50">
              <p class="text-2xl font-bold text-comic-text">{{ wordCount }}</p>
              <p class="text-xs text-comic-muted">字数</p>
            </div>
            <div class="text-center p-3 rounded-lg bg-gray-50">
              <p class="text-2xl font-bold text-comic-text">{{ lineCount }}</p>
              <p class="text-xs text-comic-muted">行数</p>
            </div>
            <div class="text-center p-3 rounded-lg bg-gray-50">
              <p class="text-2xl font-bold text-comic-text">{{ parsedCharacters.length }}</p>
              <p class="text-xs text-comic-muted">角色数</p>
            </div>
            <div class="text-center p-3 rounded-lg bg-gray-50">
              <p class="text-2xl font-bold text-comic-text">{{ parsedScenes.length }}</p>
              <p class="text-xs text-comic-muted">场景数</p>
            </div>
          </div>
        </el-card>

        <!-- AI Tools -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">AI 工具</span>
          </template>
          <div class="space-y-4">
            <div class="space-y-2">
              <el-button class="w-full justify-start" text @click="triggerAiAction('continuation')">
                智能续写
              </el-button>
              <el-button class="w-full justify-start" text :icon="Edit" @click="triggerAiAction('polishing')">
                润色优化
              </el-button>
              <el-button class="w-full justify-start" text :icon="Search" @click="triggerAiAction('analysis')">
                情节分析
              </el-button>
              <el-button class="w-full justify-start" text :icon="View" @click="triggerAiAction('preview')">
                预览效果
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Version History Dialog -->
    <el-dialog v-model="showVersions" title="版本历史" width="700px">
      <el-timeline>
        <el-timeline-item
          v-for="version in versions"
          :key="version.id"
          :timestamp="version.time"
          placement="top"
        >
          <el-card shadow="never">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ version.title }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ version.author }} · {{ version.changes }}</p>
              </div>
              <el-button type="primary" text>恢复此版本</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- Upload Dialog -->
    <el-dialog v-model="showUpload" title="上传剧本" width="500px">
      <el-upload
        drag
        action="/api/upload"
        class="w-full"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .txt, .docx, .pdf, .md 格式文件
          </div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- Outline Preview Dialog -->
    <el-dialog
      v-model="showOutlinePreview"
      :title="selectedOutlineItem?.title || '大纲预览'"
      width="600px"
      align-center
    >
      <div class="space-y-4">
        <el-alert
          title="预览模式 - 使用模拟数据展示"
          type="info"
          :closable="false"
          show-icon
        />
        <div v-for="scene in mockOutlinePreviewData.scenes" :key="scene.id" class="p-4 rounded-lg border border-comic-border">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-comic-text">{{ scene.name }}</h4>
            <el-tag size="small" type="info">{{ scene.time }}</el-tag>
          </div>
          <p class="text-sm text-comic-muted mb-2">{{ scene.location }} · {{ scene.atmosphere }}</p>
          <p class="text-sm text-comic-text mb-3">{{ scene.description }}</p>
          <div class="flex flex-wrap gap-2">
            <el-tag
              v-for="char in scene.characters"
              :key="char"
              size="small"
              type="primary"
            >
              {{ char }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showOutlinePreview = false">关闭</el-button>
        <el-button type="primary">编辑场景</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DocumentCopy, Upload, Lock, Check, Edit, Search, View, ArrowLeft
} from '@element-plus/icons-vue'
import { useScriptStore } from '@/stores'
import { ElMessage } from 'element-plus'
import type { Script } from '@/types'

const router = useRouter()
const route = useRoute()
const scriptStore = useScriptStore()

// AI Models Configuration
const aiModels = [
  { label: 'DeepSeek R1', value: 'deepseek-r1', available: true },
  { label: 'DeepSeek V3', value: 'deepseek-v3', available: true },
  { label: 'Gemini 3 Pro', value: 'gemini-3-pro', available: true },
]

const selectedAiModel = ref('deepseek-r1')
const modelSwitching = ref(false)

const handleModelChange = async (val: string) => {
  modelSwitching.value = true
  try {
    // Simulate model switching latency and potential error
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('Model unavailable'))
        } else {
          resolve(true)
        }
      }, 500)
    })
    
    localStorage.setItem('preferred_script_model', val)
    ElMessage.success(`已切换至 ${aiModels.find(m => m.value === val)?.label}`)
    // Re-initialize AI tools here if needed
  } catch (error) {
    ElMessage.error('模型切换失败，请重试')
    // Revert selection if needed, or keep as is but mark as error state
    console.error('Model switch error:', error)
  } finally {
    modelSwitching.value = false
  }
}

const triggerAiAction = (action: string) => {
  if (!selectedAiModel.value) {
    ElMessage.warning('请先选择 AI 模型')
    return
  }
  ElMessage.info(`正在使用 ${aiModels.find(m => m.value === selectedAiModel.value)?.label} 执行${action}...`)
}

onMounted(() => {
  const savedModel = localStorage.getItem('preferred_script_model')
  if (savedModel && aiModels.some(m => m.value === savedModel)) {
    selectedAiModel.value = savedModel
  }
})

const currentScript = computed(() => scriptStore.currentScript)
const parsing = computed(() => scriptStore.parsing)
const parsedCharacters = computed(() => scriptStore.parsedCharacters)
const parsedScenes = computed(() => scriptStore.parsedScenes)

const scriptTitle = ref(currentScript.value?.title || '')
const scriptContent = ref(currentScript.value?.content || '')
const showVersions = ref(false)
const showUpload = ref(false)
const showOutlinePreview = ref(false)
const selectedOutlineItem = ref<any>(null)

// 大纲数据
const outlineItems = ref([
  { id: '1', title: '第一幕：相遇', subtitle: '场景: 青云山巅' },
  { id: '2', title: '第二幕：冲突', subtitle: '待编写' },
  { id: '3', title: '第三幕：高潮', subtitle: '待编写' },
])

// 模拟大纲预览数据
const mockOutlinePreviewData = {
  scenes: [
    {
      id: 's1',
      name: '青云山巅',
      location: '青云山',
      time: '黄昏',
      description: '高山之巅，视野开阔，夕阳西下的美景。林小羽站在山巅，手持长剑，目光坚定地望向远方。',
      characters: ['林小羽', '白芷'],
      atmosphere: '宁静而神秘',
    },
    {
      id: 's2',
      name: '白狐洞府',
      location: '青云山腰',
      time: '夜晚',
      description: '白芷的居所，洞府内布置雅致，充满灵气。',
      characters: ['白芷'],
      atmosphere: '神秘温馨',
    },
    {
      id: 's3',
      name: '魔教总坛',
      location: '黑风岭',
      time: '深夜',
      description: '阴森恐怖的魔教据点，阴谋正在酝酿。',
      characters: ['魔教教主'],
      atmosphere: '紧张压抑',
    },
  ],
}

const wordCount = computed(() => {
  return scriptContent.value?.length || 0
})

const lineCount = computed(() => {
  return scriptContent.value?.split('\n').length || 0
})

const versions = [
  { id: 1, title: 'v1.2 - 完善第一幕对白', author: '李编剧', time: '2024-02-10 10:30', changes: '修改了3处对白' },
  { id: 2, title: 'v1.1 - 添加场景描述', author: '李编剧', time: '2024-02-09 15:20', changes: '增加了2个场景' },
  { id: 3, title: 'v1.0 - 初稿', author: '李编剧', time: '2024-02-08 09:00', changes: '创建剧本' },
]

// 根据路由ID加载剧本
onMounted(() => {
  const scriptId = route.params.id as string
  if (scriptId) {
    scriptStore.setCurrentScript(scriptId)
  }
})

watch(() => currentScript.value, (script) => {
  if (script) {
    scriptTitle.value = script.title
    scriptContent.value = script.content
  }
}, { immediate: true })

const getStatusType = (status?: Script['status']) => {
  const map: Record<string, string> = {
    draft: 'info',
    parsing: 'warning',
    parsed: 'success',
    parse_failed: 'danger',
    locked: 'success',
    archived: 'info',
  }
  return map[status || 'draft'] || 'info'
}

const getStatusLabel = (status?: Script['status']) => {
  const map: Record<string, string> = {
    draft: '草稿',
    parsing: '解析中',
    parsed: '已解析',
    parse_failed: '解析失败',
    locked: '已锁定',
    archived: '已归档',
  }
  return map[status || 'draft'] || status
}

const formatTime = (time?: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const handleParse = async () => {
  if (currentScript.value) {
    await scriptStore.parseScript(currentScript.value.id)
    router.push('/script/parse')
  }
}

const handleLock = () => {
  if (currentScript.value) {
    scriptStore.lockScript(currentScript.value.id)
  }
}

const handleTitleUpdate = () => {
  if (currentScript.value && scriptTitle.value !== currentScript.value.title) {
    scriptStore.updateScript(currentScript.value.id, { title: scriptTitle.value })
  }
}

const handleOutlineClick = (item: any) => {
  selectedOutlineItem.value = item
  showOutlinePreview.value = true
}
</script>
