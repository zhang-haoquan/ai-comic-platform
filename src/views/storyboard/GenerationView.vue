<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">生成中心</h1>
        <p class="text-sm text-comic-muted mt-1">管理AI图片/视频生成任务队列</p>
      </div>
      <div class="flex gap-3">
        <el-button :icon="Delete" @click="clearCompleted">清空已完成</el-button>
        <el-button type="primary" :icon="Refresh" @click="refreshJobs">刷新</el-button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <el-card shadow="never" class="comic-card">
        <div class="text-center">
          <p class="text-3xl font-bold text-comic-text">{{ queuedJobs.length }}</p>
          <p class="text-sm text-comic-muted mt-1">排队中</p>
        </div>
      </el-card>
      <el-card shadow="never" class="comic-card">
        <div class="text-center">
          <p class="text-3xl font-bold text-primary-600">{{ runningJobs.length }}</p>
          <p class="text-sm text-comic-muted mt-1">运行中</p>
        </div>
      </el-card>
      <el-card shadow="never" class="comic-card">
        <div class="text-center">
          <p class="text-3xl font-bold text-green-600">{{ successRate }}%</p>
          <p class="text-sm text-comic-muted mt-1">成功率</p>
        </div>
      </el-card>
      <el-card shadow="never" class="comic-card">
        <div class="text-center">
          <p class="text-3xl font-bold text-comic-text">¥{{ totalCost.toFixed(2) }}</p>
          <p class="text-sm text-comic-muted mt-1">总成本</p>
        </div>
      </el-card>
    </div>

    <!-- Job List -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="section-title">生成任务队列</span>
          <el-radio-group v-model="statusFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="queued">排队</el-radio-button>
            <el-radio-button label="running">运行中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="filteredJobs" style="width: 100%">
        <el-table-column prop="id" label="任务ID" width="100">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ row.id.slice(-6) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.targetType === 'character' ? 'primary' : row.targetType === 'scene' ? 'success' : 'warning'">
              {{ getTypeLabel(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="输出" width="80">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.type === 'image' ? '图片' : '视频' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预览" width="100">
          <template #default="{ row }">
            <div class="w-16 h-10 rounded bg-gray-100 overflow-hidden">
              <img v-if="row.result" :src="row.result" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">-</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon v-if="row.status === 'running'" class="is-loading"><Loading /></el-icon>
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.progress" 
              :status="row.status === 'failed' ? 'exception' : row.progress === 100 ? 'success' : ''"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="prompt" label="提示词" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本" width="80">
          <template #default="{ row }">
            ¥{{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'failed'" 
              type="primary" 
              text 
              :icon="Refresh" 
              @click="retryJob(row.id)"
            >
              重试
            </el-button>
            <el-button 
              v-if="row.status === 'queued' || row.status === 'running'" 
              type="danger" 
              text 
              :icon="Close" 
              @click="cancelJob(row.id)"
            >
              取消
            </el-button>
            <el-button 
              v-if="row.result" 
              type="primary" 
              text 
              :icon="Download" 
              @click="downloadResult(row)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Model Performance -->
    <el-card shadow="never" class="comic-card">
      <template #header>
        <span class="section-title">模型性能</span>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="model in modelStats" :key="model.name" class="p-4 rounded-lg bg-gray-50">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ model.name }}</span>
            <el-tag :type="model.status === 'active' ? 'success' : 'info'" size="small">
              {{ model.status === 'active' ? '运行中' : '空闲' }}
            </el-tag>
          </div>
          <div class="grid grid-cols-3 gap-4 mt-4">
            <div class="text-center">
              <p class="text-lg font-bold">{{ model.successRate }}%</p>
              <p class="text-xs text-comic-muted">成功率</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold">{{ model.avgTime }}s</p>
              <p class="text-xs text-comic-muted">平均耗时</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold">¥{{ model.avgCost }}</p>
              <p class="text-xs text-comic-muted">平均成本</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Refresh, Loading, Close, Download } from '@element-plus/icons-vue'
import { useGenerationStore } from '@/stores'
import type { GenerationJob } from '@/types'

const generationStore = useGenerationStore()

const statusFilter = ref('all')

const queuedJobs = computed(() => generationStore.queuedJobs)
const runningJobs = computed(() => generationStore.runningJobs)
const successRate = computed(() => generationStore.successRate)
const totalCost = computed(() => generationStore.totalCost)

const filteredJobs = computed(() => {
  let jobs = generationStore.projectJobs
  if (statusFilter.value !== 'all') {
    jobs = jobs.filter(j => {
      if (statusFilter.value === 'completed') {
        return j.status === 'success' || j.status === 'failed'
      }
      return j.status === statusFilter.value
    })
  }
  return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const modelStats = [
  { name: 'Midjourney v6', status: 'active', successRate: 98, avgTime: 45, avgCost: 0.5 },
  { name: 'SDXL', status: 'active', successRate: 95, avgTime: 30, avgCost: 0.3 },
  { name: 'DALL-E 3', status: 'idle', successRate: 99, avgTime: 20, avgCost: 0.8 },
]

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    character: '角色',
    scene: '场景',
    item: '物品',
    shot: '镜头',
  }
  return map[type] || type
}

const getStatusType = (status: GenerationJob['status']) => {
  const map: Record<string, string> = {
    queued: 'info',
    running: 'primary',
    success: 'success',
    failed: 'danger',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: GenerationJob['status']) => {
  const map: Record<string, string> = {
    queued: '排队中',
    running: '运行中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消',
  }
  return map[status] || status
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const retryJob = (id: string) => {
  generationStore.retryJob(id)
  ElMessage.success('任务已重新提交')
}

const cancelJob = (id: string) => {
  generationStore.cancelJob(id)
  ElMessage.success('任务已取消')
}

const downloadResult = (job: GenerationJob) => {
  if (job.result) {
    window.open(job.result, '_blank')
  }
}

const clearCompleted = () => {
  generationStore.clearCompleted()
  ElMessage.success('已清空已完成任务')
}

const refreshJobs = () => {
  ElMessage.success('已刷新')
}
</script>
