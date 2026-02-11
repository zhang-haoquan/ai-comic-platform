<template>
  <el-container class="h-screen">
    <!-- Sidebar -->
    <el-aside width="240px" class="bg-white border-r border-comic-border">
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div class="h-16 flex items-center px-4 border-b border-comic-border">
          <div class="flex items-center gap-2">
            <el-icon :size="28" class="text-primary-600"><VideoCamera /></el-icon>
            <span class="text-lg font-bold text-comic-text">AI漫剧平台</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <el-menu
          :default-active="activeMenu"
          class="flex-1 border-none"
          router
        >
          <template v-for="item in menuConfig" :key="item.index || item.path">
            <!-- Submenu -->
            <el-sub-menu v-if="item.children" :index="item.index">
              <template #title>
                <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item 
                v-for="child in item.children" 
                :key="child.path" 
                :index="child.path"
              >
                {{ child.title }}
              </el-menu-item>
            </el-sub-menu>

            <!-- Regular Menu Item -->
            <el-menu-item v-else :index="item.path">
              <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>

        <!-- User Profile -->
        <div class="p-4 border-t border-comic-border">
          <div class="flex items-center gap-3">
            <el-avatar :size="36" src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-comic-text truncate">当前用户</p>
              <p class="text-xs text-comic-muted">导演</p>
            </div>
            <el-dropdown>
              <el-icon class="cursor-pointer text-comic-muted hover:text-comic-text"><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <!-- Header -->
      <el-header class="bg-white border-b border-comic-border flex items-center justify-between px-6" height="64px">
        <!-- Breadcrumb -->
        <div class="h-full flex items-center">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-4">
          <!-- Global Search -->
          <el-input
            v-model="searchQuery"
            placeholder="全局搜索 (Ctrl+K)"
            class="w-64"
            prefix-icon="Search"
          />

          <!-- Notifications -->
          <el-badge :value="3" class="cursor-pointer">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>

          <!-- Help -->
          <el-icon :size="20" class="cursor-pointer"><QuestionFilled /></el-icon>
        </div>
      </el-header>

      <!-- Page Content -->
      <el-main class="bg-comic-bg p-6 overflow-auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores'

const route = useRoute()
const projectStore = useProjectStore()

const searchQuery = ref('')

const currentProject = computed(() => projectStore.currentProject)

// Menu Configuration
const menuConfig = [
  { path: '/', title: '概览', icon: 'HomeFilled' },
  { path: '/projects', title: '项目管理', icon: 'Folder' },
  { path: '/script', title: '剧本管理', icon: 'Document' },
  { path: '/assets', title: '资产库', icon: 'PictureFilled' },
  {
    index: 'storyboard',
    title: '分镜管理',
    icon: 'Film',
    children: [
      { path: '/storyboard', title: '分镜表' },
      { path: '/generation', title: '生成中心' }
    ]
  },
  { path: '/tasks', title: '任务管理', icon: 'List' },
  {
    index: 'collaboration',
    title: '协作',
    icon: 'ChatDotRound',
    children: [
      { path: '/comments', title: '评论中心' },
      { path: '/knowledge', title: '知识库' }
    ]
  },
  { path: '/settings', title: '项目设置', icon: 'Setting' }
]

// Active Menu (Synced with Sidebar)
const activeMenu = computed(() => (route.meta.activeMenu as string) || route.path)

// Breadcrumb Logic
const breadcrumbs = computed(() => {
  const items = []
  
  // Level 1: Project Name
  if (currentProject.value?.name) {
    items.push({ title: currentProject.value.name })
  }

  // Find active menu item
  const currentPath = activeMenu.value
  
  for (const item of menuConfig) {
    if (item.children) {
      const child = item.children.find(c => c.path === currentPath)
      if (child) {
        // Level 2: Parent Menu
        items.push({ title: item.title })
        // Level 3: Child Menu
        items.push({ title: child.title })
        return items
      }
    } else if (item.path === currentPath) {
      // Level 2: Menu Item
      items.push({ title: item.title })
      return items
    }
  }

  // Fallback if not found in menu (e.g. 404 or unmapped route)
  if (route.meta.title) {
    items.push({ title: route.meta.title as string })
  }

  return items
})
</script>
