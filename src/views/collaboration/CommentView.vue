<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">评论中心</h1>
        <p class="text-sm text-comic-muted mt-1">查看和管理所有评论与批注</p>
      </div>
      <div class="flex gap-3">
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="unread">未读</el-radio-button>
          <el-radio-button label="mentions">@我</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
      <el-card
        v-for="comment in filteredComments"
        :key="comment.id"
        shadow="never"
        class="comic-card-hover cursor-pointer"
      >
        <div class="flex gap-4">
          <el-avatar :size="40" :src="comment.author.avatar" />
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium text-comic-text">{{ comment.author.name }}</span>
                <span class="text-sm text-comic-muted">评论了</span>
                <el-tag size="small" type="info">{{ getTargetLabel(comment.targetType) }}</el-tag>
                <span class="text-sm text-primary-600">{{ comment.targetName }}</span>
              </div>
              <span class="text-xs text-comic-muted">{{ formatTime(comment.createdAt) }}</span>
            </div>
            <p class="text-comic-text mt-2">{{ comment.content }}</p>
            <div v-if="comment.image" class="mt-3">
              <img :src="comment.image" class="max-h-48 rounded-lg" />
            </div>
            <div class="flex items-center gap-4 mt-3">
              <el-button text :icon="ChatDotRound" size="small">回复</el-button>
              <el-button text :icon="Check" size="small">标记已读</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Empty State -->
    <el-empty v-if="filteredComments.length === 0" description="暂无评论" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatDotRound, Check } from '@element-plus/icons-vue'

const filterType = ref('all')

const comments = ref([
  {
    id: '1',
    author: { name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    targetType: 'shot',
    targetName: '镜头 1A',
    content: '这个镜头的光影效果需要调整，建议增加一些暖色调。',
    createdAt: '2024-02-10T10:30:00Z',
    read: false,
  },
  {
    id: '2',
    author: { name: '李编剧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    targetType: 'script',
    targetName: '第一幕',
    content: '@张导演 这里的对白我觉得可以再精炼一些，你觉得呢？',
    createdAt: '2024-02-10T09:00:00Z',
    read: true,
  },
  {
    id: '3',
    author: { name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    targetType: 'character',
    targetName: '林小羽',
    content: '角色设计已完成，请大家审阅。',
    image: 'https://picsum.photos/seed/char1/400/600',
    createdAt: '2024-02-09T15:00:00Z',
    read: true,
  },
])

const filteredComments = computed(() => {
  if (filterType.value === 'all') return comments.value
  if (filterType.value === 'unread') return comments.value.filter(c => !c.read)
  if (filterType.value === 'mentions') return comments.value.filter(c => c.content.includes('@'))
  return comments.value
})

const getTargetLabel = (type: string) => {
  const map: Record<string, string> = {
    script: '剧本',
    entity: '资产',
    shot: '镜头',
    task: '任务',
  }
  return map[type] || type
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>
