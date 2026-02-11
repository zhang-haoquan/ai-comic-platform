<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-comic-text">资产库</h1>
        <el-radio-group v-model="assetTypeFilter" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="character">角色</el-radio-button>
          <el-radio-button label="scene">场景</el-radio-button>
          <el-radio-button label="item">物品</el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex gap-3">
        <el-input
          v-model="searchQuery"
          placeholder="搜索资产名称..."
          class="w-64"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        <el-button type="primary" :icon="Plus" @click="showAddAsset = true">新建资产</el-button>
      </div>
    </div>

    <!-- Asset List Table -->
    <div class="comic-card bg-white rounded-lg shadow overflow-hidden">
      <el-table
        :data="paginatedAssets"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        v-loading="loading"
        @sort-change="handleSortChange"
      >
        <!-- 名称列 -->
        <el-table-column label="名称" min-width="150" sortable="custom" prop="name">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="font-medium text-comic-text truncate" :title="row.name">{{ row.name }}</span>
              <el-tag :type="getAssetTypeColor(row.type)" size="small" class="shrink-0">
                {{ getAssetTypeLabel(row.type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 预览图列 -->
        <el-table-column label="预览" width="70" align="center">
          <template #default="{ row }">
            <div class="w-[30px] h-[30px] rounded overflow-hidden bg-gray-100 flex items-center justify-center mx-auto">
              <el-image
                v-if="row.images[0]?.url"
                :src="row.images[0].url"
                :preview-src-list="[row.images[0].url]"
                fit="cover"
                class="w-full h-full"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="w-full h-full flex items-center justify-center bg-gray-100">
                    <el-icon :size="16" class="text-gray-400">
                      <component :is="getAssetIcon(row.type)" />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <el-icon v-else :size="16" class="text-gray-400">
                <component :is="getAssetIcon(row.type)" />
              </el-icon>
            </div>
          </template>
        </el-table-column>

        <!-- 描述列 -->
        <el-table-column label="描述" min-width="200">
          <template #default="{ row }">
            <span class="text-comic-muted text-sm truncate" :title="row.description">
              {{ truncateText(row.description, 20) }}
            </span>
          </template>
        </el-table-column>

        <!-- 标签列 -->
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag
                v-for="tag in row.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                class="shrink-0"
              >
                {{ tag }}
              </el-tag>
              <el-tag
                v-if="row.tags.length > 3"
                size="small"
                type="info"
                class="shrink-0"
              >
                +{{ row.tags.length - 3 }}
              </el-tag>
              <span v-if="row.tags.length === 0" class="text-gray-400 text-xs">-</span>
            </div>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column
          label="创建时间"
          width="150"
          sortable="custom"
          prop="createdAt"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="{ row }">
            <span class="text-comic-muted text-sm">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click.stop="editAsset(row)"
                title="编辑"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click.stop="deleteAsset(row.id)"
                title="删除"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4 border-t border-gray-100">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredAssets.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Empty State -->
    <el-empty v-if="filteredAssets.length === 0 && !loading" description="暂无资产" />

    <!-- Add Asset Dialog -->
    <el-dialog v-model="showAddAsset" title="新建资产" width="600px">
      <el-form :model="newAsset" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="newAsset.type">
            <el-radio-button label="character">角色</el-radio-button>
            <el-radio-button label="scene">场景</el-radio-button>
            <el-radio-button label="item">物品</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="newAsset.name" placeholder="资产名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newAsset.description" type="textarea" :rows="3" placeholder="资产描述" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="newAsset.tags" multiple placeholder="选择或输入标签" allow-create filterable>
            <el-option label="主角" value="主角" />
            <el-option label="配角" value="配角" />
            <el-option label="重要场景" value="重要场景" />
            <el-option label="关键道具" value="关键道具" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddAsset = false">取消</el-button>
        <el-button type="primary" @click="createAsset">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, User, MapLocation, Box } from '@element-plus/icons-vue'
import { useAssetStore } from '@/stores'
import type { Entity } from '@/types'

const router = useRouter()
const assetStore = useAssetStore()

// 搜索和筛选
const searchQuery = ref('')
const assetTypeFilter = computed({
  get: () => assetStore.assetTypeFilter,
  set: (val) => assetStore.setAssetTypeFilter(val as any),
})

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)

// 排序
const sortProp = ref('createdAt')
const sortOrder = ref<'ascending' | 'descending'>('descending')

// 防抖搜索
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

// 过滤后的资产列表
const filteredAssets = computed(() => {
  let assets = assetStore.filteredAssets
  
  // 搜索过滤（仅按名称搜索）
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    assets = assets.filter(a => a.name.toLowerCase().includes(query))
  }
  
  // 排序
  assets = [...assets].sort((a, b) => {
    let aVal: any = a[sortProp.value as keyof Entity]
    let bVal: any = b[sortProp.value as keyof Entity]
    
    if (sortProp.value === 'createdAt') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (sortOrder.value === 'ascending') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
  
  return assets
})

// 分页后的资产列表
const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAssets.value.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 排序事件处理
const handleSortChange = ({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) => {
  if (prop && order) {
    sortProp.value = prop
    sortOrder.value = order
  }
}

// 表格样式
const headerCellStyle = {
  backgroundColor: '#f8fafc',
  color: '#475569',
  fontWeight: 600,
  fontSize: '14px',
}

const cellStyle = {
  padding: '12px 8px',
}

// 工具函数
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const getAssetIcon = (type: string) => {
  const map: Record<string, any> = {
    character: User,
    scene: MapLocation,
    item: Box,
  }
  return map[type] || Box
}

const getAssetTypeColor = (type: string) => {
  const map: Record<string, string> = {
    character: 'primary',
    scene: 'success',
    item: 'warning',
  }
  return map[type] || 'info'
}

const getAssetTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    character: '角色',
    scene: '场景',
    item: '物品',
  }
  return map[type] || type
}

// 新建资产
const showAddAsset = ref(false)
const newAsset = ref<Partial<Entity>>({
  type: 'character',
  name: '',
  description: '',
  tags: [],
})

const createAsset = () => {
  if (!newAsset.value.name) {
    ElMessage.warning('请输入资产名称')
    return
  }
  assetStore.createAsset({
    ...newAsset.value,
    projectId: '1',
  })
  showAddAsset.value = false
  newAsset.value = {
    type: 'character',
    name: '',
    description: '',
    tags: [],
  }
  ElMessage.success('资产创建成功')
}

// 编辑资产
const editAsset = (asset: Entity) => {
  router.push(`/assets/${asset.id}`)
}

// 删除资产
const deleteAsset = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个资产吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    )
    loading.value = true
    assetStore.deleteAsset(id)
    ElMessage.success('资产已删除')
    // 如果当前页没有数据了，回到上一页
    if (paginatedAssets.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化，重置分页
watch([assetTypeFilter, searchQuery], () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* 响应式处理 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-header > div:last-child {
    width: 100%;
  }
  
  .page-header .el-input {
    width: 100% !important;
  }
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f1f5f9 !important;
}

/* 图片预览样式 */
:deep(.el-image-viewer__wrapper) {
  z-index: 3000;
}
</style>
