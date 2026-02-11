import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, ProjectMember, Milestone } from '@/types'

// 模拟项目数据
const mockProjects: Project[] = [
  {
    id: '1',
    name: '山海经奇缘',
    description: '一部融合神话与现代元素的动画短片',
    status: 'active',
    progress: 65,
    coverImage: '',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
    members: [
      { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-01-15T08:00:00Z' },
      { id: '2', name: '李编剧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', role: 'writer', joinedAt: '2024-01-16T09:00:00Z' },
      { id: '3', name: '王美术', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', role: 'artist', joinedAt: '2024-01-17T10:00:00Z' },
    ],
    milestones: [
      { id: '1', name: '剧本定稿', deadline: '2024-02-01', status: 'completed' },
      { id: '2', name: '角色设计完成', deadline: '2024-02-15', status: 'in_progress' },
      { id: '3', name: '分镜确认', deadline: '2024-03-01', status: 'pending' },
      { id: '4', name: '成片交付', deadline: '2024-04-01', status: 'pending' },
    ],
  },
  {
    id: '2',
    name: '星际漫游',
    description: '科幻题材的太空冒险故事',
    status: 'draft',
    progress: 20,
    coverImage: '',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-05T10:30:00Z',
    members: [
      { id: '1', name: '张导演', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', role: 'director', joinedAt: '2024-02-01T08:00:00Z' },
    ],
    milestones: [
      { id: '1', name: '剧本初稿', deadline: '2024-02-20', status: 'in_progress' },
    ],
  },
]

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Project[]>(mockProjects)
  const currentProjectId = ref<string>('1')
  const loading = ref(false)

  // Getters
  const currentProject = computed(() => 
    projects.value.find(p => p.id === currentProjectId.value)
  )

  const activeProjects = computed(() => 
    projects.value.filter(p => p.status === 'active')
  )

  const projectStats = computed(() => {
    const project = currentProject.value
    if (!project) return null
    
    return {
      totalMembers: project.members.length,
      completedMilestones: project.milestones.filter(m => m.status === 'completed').length,
      totalMilestones: project.milestones.length,
      progress: project.progress,
    }
  })

  // Actions
  const setCurrentProject = (id: string) => {
    currentProjectId.value = id
  }

  const createProject = (project: Partial<Project>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: project.name || '未命名项目',
      description: project.description || '',
      status: 'draft',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [],
      milestones: [],
      ...project,
    }
    projects.value.push(newProject)
    return newProject
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { 
        ...projects.value[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
    }
  }

  const addMember = (projectId: string, member: ProjectMember) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.members.push(member)
    }
  }

  const addMilestone = (projectId: string, milestone: Milestone) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.milestones.push(milestone)
    }
  }

  return {
    projects,
    currentProjectId,
    currentProject,
    activeProjects,
    projectStats,
    loading,
    setCurrentProject,
    createProject,
    updateProject,
    addMember,
    addMilestone,
  }
})
