<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">剧本解析结果</h1>
        <p class="text-sm text-comic-muted mt-1">AI自动提取的剧本要素，请审核并修正</p>
      </div>
      <div class="flex gap-3">
        <el-button :icon="Refresh" @click="handleReparse">重新解析</el-button>
        <el-button type="primary" :icon="Check" :loading="generating" @click="handleConfirm">确认并生成分镜</el-button>
      </div>
    </div>

    <!-- World View -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon :size="20" class="text-primary-600"><Globe /></el-icon>
          <span class="section-title">世界观</span>
        </div>
      </template>
      <el-input
        v-model="worldView"
        type="textarea"
        :rows="3"
        placeholder="AI识别的世界观描述..."
      />
    </el-card>

    <!-- Characters -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon :size="20" class="text-primary-600"><User /></el-icon>
            <span class="section-title">角色 ({{ parsedCharacters.length }})</span>
          </div>
          <el-button type="primary" text :icon="Plus" @click="showAddCharacter = true">添加角色</el-button>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="character in parsedCharacters" :key="character.id" class="p-4 rounded-lg border border-comic-border hover:border-primary-300 transition-colors">
          <div class="flex items-start gap-3">
            <el-avatar :size="48" :src="character.images[0]?.url || ''" class="bg-primary-100">
              {{ character.name.charAt(0) }}
            </el-avatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-comic-text">{{ character.name }}</h3>
                <el-tag v-if="character.gender" size="small">{{ character.gender === 'male' ? '男' : '女' }}</el-tag>
              </div>
              <p class="text-sm text-comic-muted mt-1 line-clamp-2">{{ character.description }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <el-tag v-for="tag in character.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
              </div>
            </div>
            <el-dropdown>
              <el-icon class="cursor-pointer text-comic-muted hover:text-comic-text"><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="Edit" @click="editCharacter(character)">编辑</el-dropdown-item>
                  <el-dropdown-item :icon="Delete" type="danger" @click="deleteCharacter(character.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Scenes -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon :size="20" class="text-primary-600"><MapLocation /></el-icon>
            <span class="section-title">场景 ({{ parsedScenes.length }})</span>
          </div>
          <el-button type="primary" text :icon="Plus" @click="showAddScene = true">添加场景</el-button>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="scene in parsedScenes" :key="scene.id" class="p-4 rounded-lg border border-comic-border hover:border-primary-300 transition-colors">
          <div class="flex items-start gap-3">
            <div class="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              <img v-if="scene.images[0]?.url" :src="scene.images[0].url" class="w-full h-full object-cover" />
              <el-icon v-else :size="24" class="w-full h-full flex items-center justify-center text-gray-400"><Picture /></el-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-comic-text">{{ scene.name }}</h3>
              <p class="text-sm text-comic-muted mt-1">{{ scene.location }} · {{ scene.time }}</p>
              <p class="text-sm text-comic-text mt-2 line-clamp-2">{{ scene.description }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <el-tag size="small" type="info">{{ scene.style }}</el-tag>
                <el-tag size="small" type="info">{{ scene.atmosphere }}</el-tag>
              </div>
            </div>
            <el-dropdown>
              <el-icon class="cursor-pointer text-comic-muted hover:text-comic-text"><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="Edit" @click="editScene(scene)">编辑</el-dropdown-item>
                  <el-dropdown-item :icon="Delete" type="danger" @click="deleteScene(scene.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Items -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon :size="20" class="text-primary-600"><Box /></el-icon>
            <span class="section-title">物品 ({{ parsedItems.length }})</span>
          </div>
          <el-button type="primary" text :icon="Plus" @click="showAddItem = true">添加物品</el-button>
        </div>
      </template>
      <el-table :data="parsedItems" style="width: 100%">
        <el-table-column prop="name" label="名称" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar :size="32" :src="row.images[0]?.url || ''" class="bg-primary-100">
                <el-icon><Box /></el-icon>
              </el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="importance" label="重要性" width="100">
          <template #default="{ row }">
            <el-tag :type="row.importance === 'high' ? 'danger' : row.importance === 'medium' ? 'warning' : 'info'" size="small">
              {{ row.importance === 'high' ? '高' : row.importance === 'medium' ? '中' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text :icon="Edit" @click="editItem(row)">编辑</el-button>
            <el-button type="danger" text :icon="Delete" @click="deleteItem(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Plot Points -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon :size="20" class="text-primary-600"><TrendCharts /></el-icon>
          <span class="section-title">剧情节奏</span>
        </div>
      </template>
      <div class="space-y-4">
        <div v-for="point in plotPoints" :key="point.id" class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" :class="getPlotPointClass(point.type)">
            {{ point.position }}
          </div>
          <div class="flex-1 p-3 rounded-lg bg-gray-50">
            <div class="flex items-center gap-2">
              <el-tag size="small" :type="getPlotPointType(point.type)">{{ getPlotPointLabel(point.type) }}</el-tag>
              <span class="text-sm text-comic-text">{{ point.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Add Character Dialog -->
    <el-dialog v-model="showAddCharacter" title="添加角色" width="600px">
      <el-form :model="newCharacter" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newCharacter.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="newCharacter.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newCharacter.description" type="textarea" :rows="3" placeholder="角色描述" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="newCharacter.tags" multiple placeholder="选择标签">
            <el-option label="主角" value="主角" />
            <el-option label="配角" value="配角" />
            <el-option label="反派" value="反派" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCharacter = false">取消</el-button>
        <el-button type="primary" @click="addCharacter">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Refresh, Check, Plus, Edit, Delete, User, 
  MapLocation, Box, TrendCharts, Picture, More 
} from '@element-plus/icons-vue'
import { useScriptStore, useAssetStore } from '@/stores'
import type { Character, Scene, Item } from '@/types'

const scriptStore = useScriptStore()
const assetStore = useAssetStore()
const router = useRouter()

const parsedCharacters = computed(() => scriptStore.parsedCharacters)
const parsedScenes = computed(() => scriptStore.parsedScenes)
const parsedItems = computed(() => scriptStore.parsedItems)

const worldView = ref(scriptStore.currentScript?.parsedResult?.worldView || '')
const plotPoints = ref(scriptStore.currentScript?.parsedResult?.plotPoints || [])

const showAddCharacter = ref(false)
const showAddScene = ref(false)
const showAddItem = ref(false)
const generating = ref(false)

const newCharacter = ref<Partial<Character>>({
  name: '',
  gender: 'male',
  description: '',
  tags: [],
})

const getPlotPointClass = (type: string) => {
  const map: Record<string, string> = {
    setup: 'bg-blue-100 text-blue-700',
    conflict: 'bg-yellow-100 text-yellow-700',
    climax: 'bg-red-100 text-red-700',
    resolution: 'bg-green-100 text-green-700',
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}

const getPlotPointType = (type: string) => {
  const map: Record<string, string> = {
    setup: 'primary',
    conflict: 'warning',
    climax: 'danger',
    resolution: 'success',
  }
  return map[type] || 'info'
}

const getPlotPointLabel = (type: string) => {
  const map: Record<string, string> = {
    setup: '起',
    conflict: '承',
    climax: '转',
    resolution: '合',
  }
  return map[type] || type
}

const handleReparse = async () => {
  if (scriptStore.currentScript) {
    await scriptStore.parseScript(scriptStore.currentScript.id)
    ElMessage.success('重新解析完成')
  }
}

const handleConfirm = async () => {
  generating.value = true
  
  // 模拟生成分镜的异步操作
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Save parsed results to assets
  parsedCharacters.value.forEach(char => {
    assetStore.createAsset(char)
  })
  parsedScenes.value.forEach(scene => {
    assetStore.createAsset(scene)
  })
  parsedItems.value.forEach(item => {
    assetStore.createAsset(item)
  })
  
  generating.value = false
  ElMessage.success('分镜生成成功')
  
  // 跳转到分镜表界面
  router.push({ name: 'Storyboard' })
}

const addCharacter = () => {
  // Add to parsed results
  showAddCharacter.value = false
  ElMessage.success('角色已添加')
}

const editCharacter = (_character: Character) => {
  // Edit character
}

const deleteCharacter = (_id: string) => {
  // Delete character
}

const editScene = (_scene: Scene) => {
  // Edit scene
}

const deleteScene = (_id: string) => {
  // Delete scene
}

const editItem = (_item: Item) => {
  // Edit item
}

const deleteItem = (_id: string) => {
  // Delete item
}
</script>
