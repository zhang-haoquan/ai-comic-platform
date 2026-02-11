<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">项目管理</h1>
        <p class="text-sm text-comic-muted mt-1">管理您的所有漫剧项目</p>
      </div>
      <div class="flex gap-3">
        <el-input
          v-model="searchQuery"
          placeholder="搜索项目..."
          class="w-64"
          prefix-icon="Search"
        />
        <el-button type="primary" :icon="Plus">新建项目</el-button>
      </div>
    </div>

    <!-- Project Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <el-card
        v-for="project in filteredProjects"
        :key="project.id"
        shadow="never"
        class="comic-card-hover cursor-pointer"
        @click="selectProject(project)"
      >
        <!-- Cover -->
        <div class="aspect-[16/9] rounded-t-lg overflow-hidden bg-gray-100 -mx-4 -mt-4 mb-4">
          <img
            v-if="project.coverImage"
            :src="project.coverImage"
            class="w-full h-full object-cover"
            :alt="project.name"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <el-icon :size="48" class="text-primary-400"><VideoCamera /></el-icon>
          </div>
        </div>

        <!-- Info -->
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-comic-text truncate">{{ project.name }}</h3>
            <p class="text-sm text-comic-muted mt-1 line-clamp-2">{{ project.description }}</p>
          </div>
          <el-tag :type="getStatusType(project.status)" size="small">
            {{ getStatusLabel(project.status) }}
          </el-tag>
        </div>

        <!-- Progress -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-comic-muted">进度</span>
            <span class="font-medium text-comic-text">{{ project.progress }}%</span>
          </div>
          <el-progress :percentage="project.progress" :stroke-width="6" />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-comic-border">
          <div class="flex items-center gap-2">
            <el-avatar
              v-for="(member, index) in project.members.slice(0, 3)"
              :key="member.id"
              :size="24"
              :src="member.avatar"
              :style="{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 3 - index }"
              class="border-2 border-white"
            />
            <span v-if="project.members.length > 3" class="text-xs text-comic-muted ml-1">
              +{{ project.members.length - 3 }}
            </span>
          </div>
          <span class="text-xs text-comic-muted">
            {{ formatDate(project.updatedAt) }}
          </span>
        </div>
      </el-card>

      <!-- Add New Card -->
      <el-card
        shadow="never"
        class="comic-card-hover cursor-pointer border-dashed"
        @click="createProject"
      >
        <div class="h-full flex flex-col items-center justify-center py-12">
          <div class="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <el-icon :size="32" class="text-primary-600"><Plus /></el-icon>
          </div>
          <p class="font-medium text-comic-text">创建新项目</p>
          <p class="text-sm text-comic-muted mt-1">开始您的漫剧创作之旅</p>
        </div>
      </el-card>
    </div>

    <!-- Empty State -->
    <el-empty v-if="filteredProjects.length === 0" description="暂无项目" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, VideoCamera } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores'
import type { Project } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()

const searchQuery = ref('')

const filteredProjects = computed(() => {
  let projects = projectStore.projects
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }
  return projects
})

const getStatusType = (status: Project['status']) => {
  const map: Record<string, string> = {
    draft: 'info',
    active: 'success',
    paused: 'warning',
    completed: 'success',
    archived: 'info',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: Project['status']) => {
  const map: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档',
  }
  return map[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const selectProject = (project: Project) => {
  projectStore.setCurrentProject(project.id)
  router.push('/')
  ElMessage.success(`已切换到项目：${project.name}`)
}

const createProject = () => {
  ElMessage.info('创建项目功能开发中')
}
</script>
