<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">剧本管理</h1>
        <p class="text-sm text-comic-muted mt-1">管理项目中的所有剧本</p>
      </div>
      <div class="flex gap-3">
        <el-input
          v-model="searchQuery"
          placeholder="搜索剧本..."
          class="w-64"
          prefix-icon="Search"
        />
        <el-button type="primary" :icon="Plus" @click="createScript">新建剧本</el-button>
      </div>
    </div>

    <!-- Script List -->
    <el-card shadow="never" class="comic-card">
      <el-table
        :data="filteredScripts"
        style="width: 100%"
        row-key="id"
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="title" label="剧本标题" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon class="text-primary-500"><Document /></el-icon>
              <span class="font-medium">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80">
          <template #default="{ row }">
            <span class="text-sm text-comic-muted">v{{ row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-sm text-comic-muted truncate">{{ getContentPreview(row.content) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="{ row }">
            <span class="text-sm text-comic-muted">{{ formatTime(row.updatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center">
              <el-button
                type="primary"
                link
                size="small"
                :icon="Edit"
                @click="handleEdit(row)"
                class="px-1"
              >编辑</el-button>
              <el-button
                type="danger"
                link
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
                class="px-1"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Empty State -->
    <el-empty v-if="filteredScripts.length === 0" description="暂无剧本" />

    <!-- Create Script Dialog -->
    <el-dialog v-model="showCreateDialog" title="新建剧本" width="500px">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newScriptTitle" placeholder="请输入剧本标题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- Delete Confirm Dialog -->
    <el-dialog v-model="showDeleteDialog" title="确认删除" width="400px">
      <div class="flex items-center gap-3">
        <el-icon :size="24" class="text-danger"><Warning /></el-icon>
        <span>确定删除剧本？</span>
      </div>
      <p class="text-sm text-comic-muted mt-2 ml-9">{{ scriptToDelete?.title }}</p>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, Document, Warning } from '@element-plus/icons-vue'
import { useScriptStore } from '@/stores'
import type { Script } from '@/types'

const router = useRouter()
const scriptStore = useScriptStore()

const searchQuery = ref('')
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const newScriptTitle = ref('')
const scriptToDelete = ref<Script | null>(null)

const filteredScripts = computed(() => {
  let scripts = scriptStore.scripts
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    scripts = scripts.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query)
    )
  }
  return scripts
})

const getStatusType = (status: Script['status']) => {
  const map: Record<string, string> = {
    draft: 'info',
    parsing: 'warning',
    parsed: 'success',
    parse_failed: 'danger',
    locked: 'success',
    archived: 'info',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: Script['status']) => {
  const map: Record<string, string> = {
    draft: '草稿',
    parsing: '解析中',
    parsed: '已解析',
    parse_failed: '解析失败',
    locked: '已锁定',
    archived: '已归档',
  }
  return map[status] || status
}

const getContentPreview = (content: string) => {
  return content.slice(0, 100).replace(/\n/g, ' ') + (content.length > 100 ? '...' : '')
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const createScript = () => {
  newScriptTitle.value = ''
  showCreateDialog.value = true
}

const confirmCreate = () => {
  if (!newScriptTitle.value.trim()) {
    ElMessage.warning('请输入剧本标题')
    return
  }
  const newScript = scriptStore.createScript({
    title: newScriptTitle.value,
    content: '',
  })
  showCreateDialog.value = false
  ElMessage.success('剧本创建成功')
  // 跳转到编辑器
  scriptStore.setCurrentScript(newScript.id)
  router.push(`/script/edit/${newScript.id}`)
}

const handleEdit = (script: Script) => {
  scriptStore.setCurrentScript(script.id)
  router.push(`/script/edit/${script.id}`)
}

const handleDelete = (script: Script) => {
  scriptToDelete.value = script
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (scriptToDelete.value) {
    const index = scriptStore.scripts.findIndex(s => s.id === scriptToDelete.value?.id)
    if (index !== -1) {
      scriptStore.scripts.splice(index, 1)
      ElMessage.success('剧本已删除')
    }
  }
  showDeleteDialog.value = false
  scriptToDelete.value = null
}
</script>
