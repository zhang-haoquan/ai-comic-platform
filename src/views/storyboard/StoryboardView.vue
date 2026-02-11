<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">分镜表</h1>
        <p class="text-sm text-comic-muted mt-1">{{ currentStoryboard?.name }} · 共 {{ currentShots.length }} 个镜头 · 总时长 {{ totalDuration }} 秒</p>
      </div>
      <div class="flex gap-3">
        <el-button :icon="Download" @click="exportExcel">导出Excel</el-button>
        <el-button :icon="Upload" @click="importExcel">导入回流</el-button>
        <el-button type="primary" :icon="Plus" @click="addShot">添加镜头</el-button>
        <el-button type="success" @click="batchGenerate">批量生成</el-button>
      </div>
    </div>

    <!-- Shot Table -->
    <el-card shadow="never" class="comic-card">
      <el-table
        :data="currentShots"
        row-key="id"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="code" label="编号" width="80">
          <template #default="{ row }">
            <span class="font-mono font-medium">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="画面描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="dialogue" label="台词" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shotSize" label="景别" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getShotSizeLabel(row.shotSize) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="angle" label="角度" width="80">
          <template #default="{ row }">
            {{ getAngleLabel(row.angle) }}
          </template>
        </el-table-column>
        <el-table-column prop="movement" label="运镜" width="80">
          <template #default="{ row }">
            {{ getMovementLabel(row.movement) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="80">
          <template #default="{ row }">
            {{ row.duration }}s
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="主体人物" min-width="120" show-overflow-tooltip />
        <el-table-column prop="sceneDetail" label="场景" min-width="150" show-overflow-tooltip />
        <el-table-column prop="atmosphere" label="氛围" min-width="120" show-overflow-tooltip />
        <el-table-column prop="lighting" label="灯光" min-width="100" show-overflow-tooltip />
        <el-table-column prop="effects" label="特效" min-width="100" show-overflow-tooltip />
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <div class="w-16 h-10 rounded bg-gray-100 overflow-hidden">
              <img v-if="row.images[0]?.url" :src="row.images[0].url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">无</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
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
                @click.stop="editShot(row)"
                class="px-1"
              >编辑</el-button>
              <el-button 
                type="danger" 
                link 
                size="small"
                :icon="Delete" 
                @click.stop="deleteShot(row.id)"
                class="px-1"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Upload, Edit, Delete } from '@element-plus/icons-vue'
import { useStoryboardStore } from '@/stores'
import { SHOT_SIZE_OPTIONS, ANGLE_OPTIONS, MOVEMENT_OPTIONS } from '@/types'
import type { Shot } from '@/types'

const router = useRouter()
const storyboardStore = useStoryboardStore()

const currentStoryboard = computed(() => storyboardStore.currentStoryboard)
const currentShots = computed(() => storyboardStore.currentShots)

const totalDuration = computed(() => {
  return currentShots.value.reduce((sum, shot) => sum + shot.duration, 0)
})

const getShotSizeLabel = (value: string) => {
  return SHOT_SIZE_OPTIONS.find(o => o.value === value)?.label || value
}

const getAngleLabel = (value: string) => {
  return ANGLE_OPTIONS.find(o => o.value === value)?.label || value
}

const getMovementLabel = (value: string) => {
  return MOVEMENT_OPTIONS.find(o => o.value === value)?.label || value
}

const getStatusType = (status: Shot['status']) => {
  const map: Record<string, string> = {
    pending: 'info',
    generating: 'warning',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    deprecated: 'info',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: Shot['status']) => {
  const map: Record<string, string> = {
    pending: '待生成',
    generating: '生成中',
    pending_review: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    deprecated: '已废弃',
  }
  return map[status] || status
}

const handleRowClick = (row: Shot) => {
  router.push(`/shots/${row.id}`)
}

const editShot = (shot: Shot) => {
  // 直接导航到镜头详情页，不再打开弹窗
  router.push(`/shots/${shot.id}`)
}

const addShot = () => {
  const newShot = storyboardStore.addShot({
    description: '新镜头',
    shotSize: 'medium',
    angle: 'eye_level',
    movement: 'static',
    duration: 5,
  })
  if (newShot) {
    // 添加后直接进入编辑页面
    router.push(`/shots/${newShot.id}`)
  }
}

const deleteShot = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个镜头吗？', '提示', {
      type: 'warning',
    })
    storyboardStore.deleteShot(id)
    ElMessage.success('镜头已删除')
  } catch {
    // Cancelled
  }
}

const exportExcel = () => {
  ElMessage.success('分镜表已导出')
}

const importExcel = () => {
  ElMessage.info('导入功能开发中')
}

const batchGenerate = () => {
  ElMessage.info('批量生成功能开发中')
}
</script>
