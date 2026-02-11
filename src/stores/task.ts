import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, ProjectMember } from '@/types'

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: 'task1',
    projectId: '1',
    title: '完成角色设计 - 林小羽',
    description: '设计主角林小羽的完整形象，包括服装、武器、表情等',
    type: 'asset',
    status: 'completed',
    priority: 'high',
    assignee: { id: '3', name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'artist', joinedAt: '2024-01-17T10:00:00Z' },
    reporter: { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
    dueDate: '2024-02-10',
    estimatedHours: 16,
    actualHours: 18,
    subtasks: [],
    relatedShots: ['shot1', 'shot3'],
    tags: ['角色设计', '主角'],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'task2',
    projectId: '1',
    title: '完成角色设计 - 白芷',
    description: '设计白狐少女白芷的完整形象',
    type: 'asset',
    status: 'in_progress',
    priority: 'high',
    assignee: { id: '3', name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'artist', joinedAt: '2024-01-17T10:00:00Z' },
    reporter: { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
    dueDate: '2024-02-15',
    estimatedHours: 14,
    actualHours: 8,
    subtasks: [],
    relatedShots: ['shot2', 'shot4'],
    tags: ['角色设计'],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
  },
  {
    id: 'task3',
    projectId: '1',
    title: '场景设计 - 青云山巅',
    description: '设计青云山巅的场景，包括植被、岩石、天空等',
    type: 'asset',
    status: 'pending_review',
    priority: 'medium',
    assignee: { id: '3', name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'artist', joinedAt: '2024-01-17T10:00:00Z' },
    reporter: { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
    dueDate: '2024-02-18',
    estimatedHours: 12,
    subtasks: [],
    relatedShots: ['shot1', 'shot2', 'shot4'],
    tags: ['场景设计'],
    createdAt: '2024-02-05T08:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
  },
  {
    id: 'task4',
    projectId: '1',
    title: '审核分镜表',
    description: '审核第一幕分镜表，确认镜头语言和节奏',
    type: 'review',
    status: 'in_progress',
    priority: 'high',
    assignee: { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
    reporter: { id: '2', name: '李编剧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: 'writer', joinedAt: '2024-01-16T09:00:00Z' },
    dueDate: '2024-02-20',
    estimatedHours: 4,
    subtasks: [],
    relatedShots: ['shot1', 'shot2', 'shot3', 'shot4'],
    tags: ['审核', '分镜'],
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
  },
  {
    id: 'task5',
    projectId: '1',
    title: '生成镜头画面',
    description: '批量生成分镜表中的镜头画面',
    type: 'shot',
    status: 'not_started',
    priority: 'medium',
    assignee: { id: '3', name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'artist', joinedAt: '2024-01-17T10:00:00Z' },
    reporter: { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
    dueDate: '2024-02-25',
    estimatedHours: 8,
    subtasks: [],
    relatedShots: ['shot1', 'shot2', 'shot3', 'shot4'],
    tags: ['AI生成', '画面'],
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z',
  },
  {
    id: 'task6',
    projectId: '1',
    title: '剧本第二幕创作',
    description: '完成第二幕的剧本初稿',
    type: 'script',
    status: 'blocked',
    priority: 'high',
    assignee: { id: '2', name: '李编剧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: 'writer', joinedAt: '2024-01-16T09:00:00Z' },
    reporter: { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
    dueDate: '2024-02-28',
    estimatedHours: 20,
    subtasks: [],
    relatedShots: [],
    tags: ['剧本', '创作'],
    createdAt: '2024-02-08T08:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
  },
]

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>(mockTasks)
  const currentTaskId = ref<string | null>(null)
  const viewType = ref<'board' | 'list' | 'gantt'>('board')
  const loading = ref(false)

  // Getters
  const projectTasks = computed(() => 
    tasks.value.filter(t => t.projectId === '1')
  )

  const currentTask = computed(() => 
    tasks.value.find(t => t.id === currentTaskId.value)
  )

  const tasksByStatus = computed(() => {
    return {
      not_started: projectTasks.value.filter(t => t.status === 'not_started'),
      in_progress: projectTasks.value.filter(t => t.status === 'in_progress'),
      blocked: projectTasks.value.filter(t => t.status === 'blocked'),
      pending_review: projectTasks.value.filter(t => t.status === 'pending_review'),
      completed: projectTasks.value.filter(t => t.status === 'completed'),
    }
  })

  const myTasks = computed(() => 
    projectTasks.value.filter(t => t.assignee?.id === '3')
  )

  const taskStats = computed(() => {
    const pts = projectTasks.value
    return {
      total: pts.length,
      completed: pts.filter(t => t.status === 'completed').length,
      inProgress: pts.filter(t => t.status === 'in_progress').length,
      blocked: pts.filter(t => t.status === 'blocked').length,
      overdue: pts.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    }
  })

  // Actions
  const setCurrentTask = (id: string | null) => {
    currentTaskId.value = id
  }

  const setViewType = (type: 'board' | 'list' | 'gantt') => {
    viewType.value = type
  }

  const createTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      projectId: task.projectId || '1',
      title: task.title || '未命名任务',
      description: task.description || '',
      type: task.type || 'other',
      status: 'not_started',
      priority: task.priority || 'medium',
      reporter: task.reporter || { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
      subtasks: [],
      relatedShots: [],
      tags: task.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...task,
    }
    tasks.value.push(newTask)
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { 
        ...tasks.value[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
    }
  }

  const deleteTask = (id: string) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus })
  }

  const assignTask = (taskId: string, assignee: ProjectMember) => {
    updateTask(taskId, { assignee })
  }

  return {
    tasks,
    currentTaskId,
    viewType,
    projectTasks,
    currentTask,
    tasksByStatus,
    myTasks,
    taskStats,
    loading,
    setCurrentTask,
    setViewType,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    assignTask,
  }
})
