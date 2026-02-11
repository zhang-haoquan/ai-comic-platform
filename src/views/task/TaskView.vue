<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-comic-text">任务管理</h1>
        <el-radio-group v-model="viewType" size="small">
          <el-radio-button label="board">看板</el-radio-button>
          <el-radio-button label="list">列表</el-radio-button>
          <el-radio-button label="gantt">甘特图</el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex gap-3">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务..."
          class="w-48"
          prefix-icon="Search"
        />
        <el-button type="primary" :icon="Plus" @click="showAddTask = true">新建任务</el-button>
      </div>
    </div>

    <!-- Board View -->
    <div v-if="viewType === 'board'" class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="status in statusColumns"
        :key="status.key"
        class="flex-shrink-0 w-80"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="font-medium text-comic-text">{{ status.label }}</span>
            <el-tag size="small" type="info">{{ tasksByStatus[status.key].length }}</el-tag>
          </div>
          <el-button text :icon="Plus" @click="addTaskWithStatus(status.key)" />
        </div>
        <div class="space-y-3 min-h-[200px]">
          <div
            v-for="task in tasksByStatus[status.key]"
            :key="task.id"
            class="p-4 bg-white rounded-lg shadow-sm border border-comic-border cursor-pointer hover:shadow-md transition-shadow"
            @click="editTask(task)"
          >
            <div class="flex items-start justify-between">
              <h4 class="font-medium text-comic-text">{{ task.title }}</h4>
              <el-tag :type="getPriorityType(task.priority)" size="small">
                {{ getPriorityLabel(task.priority) }}
              </el-tag>
            </div>
            <p class="text-sm text-comic-muted mt-2 line-clamp-2">{{ task.description }}</p>
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-2">
                <el-avatar v-if="task.assignee" :size="24" :src="task.assignee.avatar" />
                <span v-else class="text-xs text-gray-400">未分配</span>
              </div>
              <div class="flex items-center gap-2">
                <el-tag v-if="task.dueDate" size="small" :type="isOverdue(task) ? 'danger' : 'info'">
                  {{ formatDate(task.dueDate) }}
                </el-tag>
              </div>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              <el-tag v-for="tag in task.tags.slice(0, 2)" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <el-card v-else-if="viewType === 'list'" shadow="never" class="comic-card">
      <el-table :data="filteredTasks" style="width: 100%">
        <el-table-column prop="title" label="任务" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ row.title }}</span>
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ getPriorityLabel(row.priority) }}
              </el-tag>
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
        <el-table-column prop="assignee" label="负责人" width="120">
          <template #default="{ row }">
            <div v-if="row.assignee" class="flex items-center gap-2">
              <el-avatar :size="24" :src="row.assignee.avatar" />
              <span class="text-sm">{{ row.assignee.name }}</span>
            </div>
            <span v-else class="text-gray-400">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="120">
          <template #default="{ row }">
            <span :class="isOverdue(row) ? 'text-red-500' : ''">{{ row.dueDate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedHours" label="预估工时" width="100">
          <template #default="{ row }">
            {{ row.estimatedHours ? row.estimatedHours + 'h' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text :icon="Edit" @click="editTask(row)">编辑</el-button>
            <el-button type="danger" text :icon="Delete" @click="deleteTask(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Gantt View (Simplified) -->
    <el-card v-else shadow="never" class="comic-card">
      <div class="h-96 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <el-icon :size="48"><Calendar /></el-icon>
          <p class="mt-4">甘特图视图开发中</p>
        </div>
      </div>
    </el-card>

    <!-- Add/Edit Task Dialog -->
    <el-dialog v-model="showAddTask" :title="editingTask ? '编辑任务' : '新建任务'" width="600px">
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="taskForm.title" placeholder="任务标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" placeholder="任务描述" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="taskForm.type">
            <el-radio-button label="script">剧本</el-radio-button>
            <el-radio-button label="asset">资产</el-radio-button>
            <el-radio-button label="storyboard">分镜</el-radio-button>
            <el-radio-button label="shot">镜头</el-radio-button>
            <el-radio-button label="review">审核</el-radio-button>
            <el-radio-button label="other">其他</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="taskForm.priority">
            <el-radio-button label="low">低</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="high">高</el-radio-button>
            <el-radio-button label="urgent">紧急</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="taskForm.assignee" placeholder="选择负责人" clearable>
            <el-option
              v-for="member in currentProject?.members"
              :key="member.id"
              :label="member.name"
              :value="member.id"
            >
              <div class="flex items-center gap-2">
                <el-avatar :size="24" :src="member.avatar" />
                <span>{{ member.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.dueDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input-number v-model="taskForm.estimatedHours" :min="0" :step="0.5" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="taskForm.tags" multiple allow-create filterable placeholder="选择或输入标签">
            <el-option label="紧急" value="紧急" />
            <el-option label="重要" value="重要" />
            <el-option label="设计" value="设计" />
            <el-option label="开发" value="开发" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddTask = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Calendar } from '@element-plus/icons-vue'
import { useTaskStore, useProjectStore } from '@/stores'
import type { Task } from '@/types'

const taskStore = useTaskStore()
const projectStore = useProjectStore()

const viewType = computed({
  get: () => taskStore.viewType,
  set: (val) => taskStore.setViewType(val as any),
})

const searchQuery = ref('')
const currentProject = computed(() => projectStore.currentProject)
const tasksByStatus = computed(() => taskStore.tasksByStatus)

const filteredTasks = computed(() => {
  let tasks = taskStore.projectTasks
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.description?.toLowerCase().includes(query)
    )
  }
  return tasks
})

const statusColumns: { key: Task['status']; label: string }[] = [
  { key: 'not_started', label: '未开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'blocked', label: '阻塞' },
  { key: 'pending_review', label: '待验收' },
  { key: 'completed', label: '已完成' },
]

const showAddTask = ref(false)
const editingTask = ref<Task | null>(null)

const taskForm = ref<Partial<Task>>({
  title: '',
  description: '',
  type: 'other',
  priority: 'medium',
  dueDate: '',
  estimatedHours: 0,
  tags: [],
})

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

const getStatusType = (status: Task['status']) => {
  const map: Record<string, string> = {
    not_started: 'info',
    in_progress: 'primary',
    blocked: 'danger',
    pending_review: 'warning',
    completed: 'success',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: Task['status']) => {
  const map: Record<string, string> = {
    not_started: '未开始',
    in_progress: '进行中',
    blocked: '阻塞',
    pending_review: '待验收',
    completed: '已完成',
  }
  return map[status] || status
}

const isOverdue = (task: Task) => {
  if (!task.dueDate || task.status === 'completed') return false
  return new Date(task.dueDate) < new Date()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const addTaskWithStatus = (status: Task['status']) => {
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    status,
    dueDate: '',
    estimatedHours: 0,
    tags: [],
  }
  showAddTask.value = true
}

const editTask = (task: Task) => {
  editingTask.value = task
  taskForm.value = { ...task }
  showAddTask.value = true
}

const saveTask = () => {
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, taskForm.value)
    ElMessage.success('任务已更新')
  } else {
    taskStore.createTask({
      ...taskForm.value,
      projectId: '1',
    })
    ElMessage.success('任务已创建')
  }
  showAddTask.value = false
}

const deleteTask = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
      type: 'warning',
    })
    taskStore.deleteTask(id)
    ElMessage.success('任务已删除')
  } catch {
    // Cancelled
  }
}
</script>
