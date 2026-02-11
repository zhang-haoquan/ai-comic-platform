<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">知识库</h1>
        <p class="text-sm text-comic-muted mt-1">教程、技巧、最佳实践</p>
      </div>
      <div class="flex gap-3">
        <el-input
          v-model="searchQuery"
          placeholder="搜索知识..."
          class="w-64"
          prefix-icon="Search"
        />
        <el-button type="primary" :icon="Plus">新建文章</el-button>
      </div>
    </div>

    <!-- Category Tabs -->
    <el-tabs v-model="activeCategory">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="教程" name="tutorial" />
      <el-tab-pane label="技巧" name="tip" />
      <el-tab-pane label="FAQ" name="faq" />
      <el-tab-pane label="最佳实践" name="best_practice" />
    </el-tabs>

    <!-- Knowledge List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <el-card
        v-for="item in filteredKnowledge"
        :key="item.id"
        shadow="never"
        class="comic-card-hover cursor-pointer"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <el-tag :type="getCategoryType(item.category)" size="small">
              {{ getCategoryLabel(item.category) }}
            </el-tag>
            <el-tag :type="getDifficultyType(item.difficulty)" size="small">
              {{ getDifficultyLabel(item.difficulty) }}
            </el-tag>
          </div>
        </template>
        <h3 class="font-medium text-comic-text line-clamp-2">{{ item.title }}</h3>
        <p class="text-sm text-comic-muted mt-2 line-clamp-3">{{ item.content }}</p>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-comic-border">
          <div class="flex items-center gap-2">
            <el-avatar :size="24" :src="item.author.avatar" />
            <span class="text-xs text-comic-muted">{{ item.author.name }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-comic-muted">
            <span><el-icon><View /></el-icon> {{ item.views }}</span>
            <span><el-icon><Star /></el-icon> {{ item.rating }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Empty State -->
    <el-empty v-if="filteredKnowledge.length === 0" description="暂无知识文章" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, View, Star } from '@element-plus/icons-vue'

const searchQuery = ref('')
const activeCategory = ref('all')

const knowledgeItems = ref([
  {
    id: '1',
    title: '如何编写有效的AI提示词',
    content: '本文介绍了如何编写高质量的AI提示词，包括关键词选择、描述技巧等...',
    category: 'tutorial',
    difficulty: 'beginner',
    author: { name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    rating: 4.8,
    views: 256,
  },
  {
    id: '2',
    title: '分镜设计的基本原则',
    content: '了解分镜设计的基本原则，包括镜头语言、节奏控制等核心概念...',
    category: 'best_practice',
    difficulty: 'intermediate',
    author: { name: '李编剧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    rating: 4.9,
    views: 189,
  },
  {
    id: '3',
    title: '角色一致性保持技巧',
    content: '在使用AI生成角色时如何保持角色形象的一致性...',
    category: 'tip',
    difficulty: 'advanced',
    author: { name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    rating: 4.7,
    views: 342,
  },
])

const filteredKnowledge = computed(() => {
  let items = knowledgeItems.value
  if (activeCategory.value !== 'all') {
    items = items.filter(i => i.category === activeCategory.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(i => 
      i.title.toLowerCase().includes(query) || 
      i.content.toLowerCase().includes(query)
    )
  }
  return items
})

const getCategoryType = (category: string) => {
  const map: Record<string, string> = {
    tutorial: 'primary',
    tip: 'success',
    faq: 'warning',
    best_practice: 'info',
  }
  return map[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    tutorial: '教程',
    tip: '技巧',
    faq: 'FAQ',
    best_practice: '最佳实践',
  }
  return map[category] || category
}

const getDifficultyType = (difficulty: string) => {
  const map: Record<string, string> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  }
  return map[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty: string) => {
  const map: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }
  return map[difficulty] || difficulty
}
</script>
