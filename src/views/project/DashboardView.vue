<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">概览</h1>
        <p class="text-sm text-comic-muted mt-1">{{ currentProject?.description }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <el-card class="comic-card-hover" shadow="never">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <el-icon :size="24" class="text-primary-600"><User /></el-icon>
          </div>
          <div>
            <p class="text-sm text-comic-muted">团队成员</p>
            <p class="text-2xl font-bold text-comic-text">{{ projectStats?.totalMembers || 0 }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="comic-card-hover" shadow="never">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <el-icon :size="24" class="text-green-600"><Check /></el-icon>
          </div>
          <div>
            <p class="text-sm text-comic-muted">已完成任务</p>
            <p class="text-2xl font-bold text-comic-text">{{ taskStats.completed }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="comic-card-hover" shadow="never">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
            <el-icon :size="24" class="text-yellow-600"><Timer /></el-icon>
          </div>
          <div>
            <p class="text-sm text-comic-muted">进行中</p>
            <p class="text-2xl font-bold text-comic-text">{{ taskStats.inProgress }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="comic-card-hover" shadow="never">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <el-icon :size="24" class="text-purple-600"><TrendCharts /></el-icon>
          </div>
          <div>
            <p class="text-sm text-comic-muted">项目进度</p>
            <p class="text-2xl font-bold text-comic-text">{{ currentProject?.progress || 0 }}%</p>
          </div>
        </div>
      </el-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Milestones -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="section-title">项目里程碑</span>
              <el-button text type="primary">查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="milestone in currentProject?.milestones"
              :key="milestone.id"
              :type="milestone.status === 'completed' ? 'success' : milestone.status === 'in_progress' ? 'primary' : 'info'"
              :icon="milestone.status === 'completed' ? Check : milestone.status === 'in_progress' ? Loading : ''"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-comic-text">{{ milestone.name }}</p>
                  <p class="text-sm text-comic-muted">截止: {{ milestone.deadline }}</p>
                </div>
                <el-tag :type="milestone.status === 'completed' ? 'success' : milestone.status === 'in_progress' ? 'primary' : 'info'" size="small">
                  {{ milestone.status === 'completed' ? '已完成' : milestone.status === 'in_progress' ? '进行中' : '待开始' }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- Recent Activity -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="section-title">最近动态</span>
              <el-button text type="primary">查看全部</el-button>
            </div>
          </template>
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-start gap-3 pb-4 border-b border-comic-border last:border-0 last:pb-0">
              <el-avatar :size="32" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`" />
              <div class="flex-1">
                <p class="text-sm text-comic-text">
                  <span class="font-medium">{{ ['张导演', '李编剧', '王美术'][i % 3] }}</span>
                  {{ ['更新了剧本', '上传了角色设计', '完成了任务', '发表了评论'][i % 4] }}
                </p>
                <p class="text-xs text-comic-muted mt-1">{{ i * 10 }}分钟前</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">快捷入口</span>
          </template>
          <div class="grid grid-cols-2 gap-3">
            <el-button class="h-auto py-4" text @click="$router.push('/script')">
              <div class="flex flex-col items-center gap-2">
                <el-icon :size="24"><Document /></el-icon>
                <span>剧本编辑</span>
              </div>
            </el-button>
            <el-button class="h-auto py-4" text @click="$router.push('/assets')">
              <div class="flex flex-col items-center gap-2">
                <el-icon :size="24"><Picture /></el-icon>
                <span>资产管理</span>
              </div>
            </el-button>
            <el-button class="h-auto py-4" text @click="$router.push('/storyboard')">
              <div class="flex flex-col items-center gap-2">
                <el-icon :size="24"><Film /></el-icon>
                <span>分镜设计</span>
              </div>
            </el-button>
            <el-button class="h-auto py-4" text @click="$router.push('/tasks')">
              <div class="flex flex-col items-center gap-2">
                <el-icon :size="24"><List /></el-icon>
                <span>任务管理</span>
              </div>
            </el-button>
          </div>
        </el-card>

        <!-- My Tasks -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="section-title">我的任务</span>
              <el-button text type="primary" @click="$router.push('/tasks')">查看全部</el-button>
            </div>
          </template>
          <div class="space-y-3">
            <div v-for="task in myTasks.slice(0, 5)" :key="task.id" class="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer" @click="$router.push('/tasks')">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-comic-text truncate">{{ task.title }}</p>
                  <p class="text-xs text-comic-muted mt-1">截止: {{ task.dueDate || '无截止日期' }}</p>
                </div>
                <el-tag :type="getPriorityType(task.priority)" size="small">{{ getPriorityLabel(task.priority) }}</el-tag>
              </div>
            </div>
            <el-empty v-if="myTasks.length === 0" description="暂无任务" />
          </div>
        </el-card>

        <!-- Team Members -->
        <el-card shadow="never" class="comic-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="section-title">团队成员</span>
              <el-button text type="primary">管理</el-button>
            </div>
          </template>
          <div class="flex flex-wrap gap-2">
            <el-tooltip v-for="member in currentProject?.members" :key="member.id" :content="member.name">
              <el-avatar :size="40" :src="member.avatar" />
            </el-tooltip>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  User, Check, Timer, TrendCharts, 
  Document, Picture, Film, List, Loading 
} from '@element-plus/icons-vue'
import { useProjectStore, useTaskStore } from '@/stores'
import type { Task } from '@/types'

const projectStore = useProjectStore()
const taskStore = useTaskStore()

const currentProject = computed(() => projectStore.currentProject)
const projectStats = computed(() => projectStore.projectStats)
const taskStats = computed(() => taskStore.taskStats)
const myTasks = computed(() => taskStore.myTasks)

const getPriorityType = (priority: Task['priority']) => {
  const map: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    urgent: 'danger',
  }
  return map[priority] || 'info'
}

const getPriorityLabel = (priority: Task['priority']) => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  }
  return map[priority] || priority
}
</script>
