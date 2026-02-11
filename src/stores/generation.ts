import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GenerationJob } from '@/types'

// 模拟生成任务数据
const mockGenerationJobs: GenerationJob[] = [
  {
    id: 'gen1',
    projectId: '1',
    targetType: 'character',
    targetId: 'c1',
    type: 'image',
    status: 'success',
    progress: 100,
    prompt: 'young male swordsman, Chinese martial arts style, green robes, long hair, holding sword, heroic expression, detailed anime style',
    modelConfig: { model: 'midjourney-v6', size: '1024x1536', style: 'anime' },
    result: 'https://picsum.photos/seed/char1/400/600',
    cost: 0.5,
    createdAt: '2024-02-10T08:00:00Z',
    startedAt: '2024-02-10T08:00:05Z',
    completedAt: '2024-02-10T08:01:30Z',
  },
  {
    id: 'gen2',
    projectId: '1',
    targetType: 'character',
    targetId: 'c2',
    type: 'image',
    status: 'running',
    progress: 65,
    prompt: 'beautiful female fox spirit, white hair, fox ears, flowing white robes, mystical aura, anime style, ethereal beauty',
    modelConfig: { model: 'midjourney-v6', size: '1024x1536', style: 'anime' },
    cost: 0,
    createdAt: '2024-02-10T10:00:00Z',
    startedAt: '2024-02-10T10:00:05Z',
  },
  {
    id: 'gen3',
    projectId: '1',
    targetType: 'scene',
    targetId: 's1',
    type: 'image',
    status: 'queued',
    progress: 0,
    prompt: 'mountain peak at sunset, golden sunlight, dramatic clouds, Chinese landscape style, mystical atmosphere',
    modelConfig: { model: 'sd-xl', size: '1920x1080', style: 'landscape' },
    cost: 0,
    createdAt: '2024-02-10T10:30:00Z',
  },
  {
    id: 'gen4',
    projectId: '1',
    targetType: 'shot',
    targetId: 'shot2',
    type: 'image',
    status: 'failed',
    progress: 30,
    prompt: 'white fox transforming into beautiful girl, magical glow, anime style, dramatic composition',
    modelConfig: { model: 'midjourney-v6', size: '1920x1080', style: 'anime' },
    error: 'Failed to generate: Request timed out after 120s',
    cost: 0.2,
    createdAt: '2024-02-10T09:00:00Z',
    startedAt: '2024-02-10T09:00:05Z',
    completedAt: '2024-02-10T09:02:30Z',
  },
  {
    id: 'gen5',
    projectId: '1',
    targetType: 'shot',
    targetId: 'shot1',
    type: 'image',
    status: 'success',
    progress: 100,
    prompt: 'young swordsman on mountain peak at sunset, heroic pose, detailed anime style, dramatic lighting',
    modelConfig: { model: 'midjourney-v6', size: '1920x1080', style: 'anime' },
    result: 'https://picsum.photos/seed/shot1/800/450',
    cost: 0.5,
    createdAt: '2024-02-10T08:30:00Z',
    startedAt: '2024-02-10T08:30:05Z',
    completedAt: '2024-02-10T08:31:45Z',
  },
]

export const useGenerationStore = defineStore('generation', () => {
  // State
  const jobs = ref<GenerationJob[]>(mockGenerationJobs)
  const loading = ref(false)

  // Getters
  const projectJobs = computed(() => 
    jobs.value.filter(j => j.projectId === '1')
  )

  const queuedJobs = computed(() => 
    projectJobs.value.filter(j => j.status === 'queued')
  )

  const runningJobs = computed(() => 
    projectJobs.value.filter(j => j.status === 'running')
  )

  const completedJobs = computed(() => 
    projectJobs.value.filter(j => j.status === 'success' || j.status === 'failed')
  )

  const successRate = computed(() => {
    const completed = completedJobs.value
    if (completed.length === 0) return 0
    const success = completed.filter(j => j.status === 'success').length
    return Math.round((success / completed.length) * 100)
  })

  const totalCost = computed(() => 
    projectJobs.value.reduce((sum, j) => sum + j.cost, 0)
  )

  // Actions
  const createJob = (job: Partial<GenerationJob>) => {
    const newJob: GenerationJob = {
      id: Date.now().toString(),
      projectId: job.projectId || '1',
      targetType: job.targetType || 'shot',
      targetId: job.targetId || '',
      type: job.type || 'image',
      status: 'queued',
      progress: 0,
      prompt: job.prompt || '',
      modelConfig: job.modelConfig || {},
      cost: 0,
      createdAt: new Date().toISOString(),
      ...job,
    }
    jobs.value.push(newJob)
    return newJob
  }

  const updateJobStatus = (id: string, updates: Partial<GenerationJob>) => {
    const index = jobs.value.findIndex(j => j.id === id)
    if (index !== -1) {
      jobs.value[index] = { ...jobs.value[index], ...updates }
    }
  }

  const startJob = async (id: string) => {
    updateJobStatus(id, { status: 'running', startedAt: new Date().toISOString() })
    
    // 模拟生成过程
    const job = jobs.value.find(j => j.id === id)
    if (job) {
      const interval = setInterval(() => {
        if (job.progress >= 100) {
          clearInterval(interval)
          updateJobStatus(id, { 
            status: 'success', 
            progress: 100,
            completedAt: new Date().toISOString(),
            result: `https://picsum.photos/seed/${Date.now()}/800/600`,
          })
        } else {
          job.progress = Math.min(job.progress + 10, 99)
        }
      }, 500)
    }
  }

  const cancelJob = (id: string) => {
    updateJobStatus(id, { status: 'cancelled', completedAt: new Date().toISOString() })
  }

  const retryJob = (id: string) => {
    const oldJob = jobs.value.find(j => j.id === id)
    if (oldJob) {
      createJob({
        targetType: oldJob.targetType,
        targetId: oldJob.targetId,
        type: oldJob.type,
        prompt: oldJob.prompt,
        modelConfig: oldJob.modelConfig,
      })
    }
  }

  const clearCompleted = () => {
    jobs.value = jobs.value.filter(j => 
      j.status === 'queued' || j.status === 'running'
    )
  }

  return {
    jobs,
    loading,
    projectJobs,
    queuedJobs,
    runningJobs,
    completedJobs,
    successRate,
    totalCost,
    createJob,
    updateJobStatus,
    startJob,
    cancelJob,
    retryJob,
    clearCompleted,
  }
})
