import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Storyboard, Shot } from '@/types'
import { SHOT_SIZE_OPTIONS, ANGLE_OPTIONS, MOVEMENT_OPTIONS } from '@/types'

// 模拟分镜数据
const mockStoryboards: Storyboard[] = [
  {
    id: '1',
    projectId: '1',
    scriptId: '1',
    name: '山海经奇缘 - 第一幕分镜',
    shots: [
      {
        id: 'shot1',
        storyboardId: '1',
        sequence: 1,
        code: '1A',
        description: '林小羽站在山巅，手持长剑，目光坚定地望向远方。夕阳的余晖洒在他身上，映出一片金黄。',
        dialogue: '林小羽（独白）："这天下，终究要有人守护。"',
        shotSize: 'long',
        angle: 'eye_level',
        movement: 'static',
        duration: 5,
        emotions: ['坚定', '决心'],
        characters: ['c1'],
        scenes: ['s1'],
        items: ['i2'],
        images: [
          { id: 'shotimg1', url: 'https://picsum.photos/seed/shot1/800/450', type: 'image', status: 'completed', createdAt: '2024-02-05T10:00:00Z' },
        ],
        status: 'approved',
      },
      {
        id: 'shot2',
        storyboardId: '1',
        sequence: 2,
        code: '1B',
        description: '一道白光闪过，一只白狐从林中窜出，化作一位白衣少女。',
        dialogue: '白狐少女："你是谁？为何身上有上古神器的气息？"',
        shotSize: 'full',
        angle: 'low',
        movement: 'dolly',
        duration: 4,
        emotions: ['惊讶', '好奇'],
        characters: ['c1', 'c2'],
        scenes: ['s1'],
        items: [],
        images: [],
        status: 'pending_review',
      },
      {
        id: 'shot3',
        storyboardId: '1',
        sequence: 3,
        code: '1C',
        description: '两人对峙，夕阳余晖下的剪影。',
        dialogue: '林小羽（警觉）："你又是谁？妖狐？"',
        shotSize: 'medium',
        angle: 'eye_level',
        movement: 'static',
        duration: 3,
        emotions: ['警觉', '紧张'],
        characters: ['c1', 'c2'],
        scenes: ['s1'],
        items: ['i1'],
        images: [
          { id: 'shotimg3', url: 'https://picsum.photos/seed/shot3/800/450', type: 'image', status: 'completed', createdAt: '2024-02-08T10:00:00Z' },
        ],
        status: 'approved',
      },
      {
        id: 'shot4',
        storyboardId: '1',
        sequence: 4,
        code: '1D',
        description: '白芷微笑，展现出神秘的气质。',
        dialogue: '白芷（微笑）："我叫白芷，是这青云山的守护灵..."',
        shotSize: 'close_up',
        angle: 'eye_level',
        movement: 'static',
        duration: 4,
        emotions: ['温柔', '神秘'],
        characters: ['c2'],
        scenes: ['s1'],
        items: [],
        images: [],
        status: 'generating',
      },
    ],
    totalDuration: 16,
    status: 'draft',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
  },
]

export const useStoryboardStore = defineStore('storyboard', () => {
  // State
  const storyboards = ref<Storyboard[]>(mockStoryboards)
  const currentStoryboardId = ref<string>('1')
  const loading = ref(false)

  // Getters
  const currentStoryboard = computed(() => 
    storyboards.value.find(s => s.id === currentStoryboardId.value)
  )

  const currentShots = computed(() => 
    currentStoryboard.value?.shots || []
  )

  const shotsByStatus = computed(() => {
    const shots = currentShots.value
    return {
      pending: shots.filter(s => s.status === 'pending' || s.status === 'generating'),
      pending_review: shots.filter(s => s.status === 'pending_review'),
      approved: shots.filter(s => s.status === 'approved'),
      rejected: shots.filter(s => s.status === 'rejected'),
    }
  })

  // Actions
  const setCurrentStoryboard = (id: string) => {
    currentStoryboardId.value = id
  }

  const createStoryboard = (storyboard: Partial<Storyboard>) => {
    const newStoryboard: Storyboard = {
      id: Date.now().toString(),
      projectId: storyboard.projectId || '',
      scriptId: storyboard.scriptId || '',
      name: storyboard.name || '新分镜表',
      shots: [],
      totalDuration: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...storyboard,
    }
    storyboards.value.push(newStoryboard)
    return newStoryboard
  }

  const updateShot = (shotId: string, updates: Partial<Shot>) => {
    const storyboard = storyboards.value.find(s => s.id === currentStoryboardId.value)
    if (storyboard) {
      const shotIndex = storyboard.shots.findIndex(s => s.id === shotId)
      if (shotIndex !== -1) {
        storyboard.shots[shotIndex] = { 
          ...storyboard.shots[shotIndex], 
          ...updates 
        }
        storyboard.updatedAt = new Date().toISOString()
      }
    }
  }

  const addShot = (shot: Partial<Shot>) => {
    const storyboard = storyboards.value.find(s => s.id === currentStoryboardId.value)
    if (storyboard) {
      const newShot: Shot = {
        id: Date.now().toString(),
        storyboardId: currentStoryboardId.value,
        sequence: storyboard.shots.length + 1,
        code: `${Math.floor(storyboard.shots.length / 4) + 1}${String.fromCharCode(65 + (storyboard.shots.length % 4))}`,
        description: '',
        shotSize: 'medium',
        angle: 'eye_level',
        movement: 'static',
        duration: 5,
        emotions: [],
        characters: [],
        scenes: [],
        items: [],
        images: [],
        status: 'pending',
        // 新增字段默认值
        subject: '',
        sceneDetail: '',
        atmosphere: '',
        lighting: '',
        effects: '',
        prompt: '',
        ...shot,
      }
      storyboard.shots.push(newShot)
      storyboard.updatedAt = new Date().toISOString()
      return newShot
    }
    return null
  }

  const deleteShot = (shotId: string) => {
    const storyboard = storyboards.value.find(s => s.id === currentStoryboardId.value)
    if (storyboard) {
      const index = storyboard.shots.findIndex(s => s.id === shotId)
      if (index !== -1) {
        storyboard.shots.splice(index, 1)
        // 重新编号
        storyboard.shots.forEach((shot, idx) => {
          shot.sequence = idx + 1
          shot.code = `${Math.floor(idx / 4) + 1}${String.fromCharCode(65 + (idx % 4))}`
        })
        storyboard.updatedAt = new Date().toISOString()
      }
    }
  }

  const reorderShots = (fromIndex: number, toIndex: number) => {
    const storyboard = storyboards.value.find(s => s.id === currentStoryboardId.value)
    if (storyboard) {
      const [removed] = storyboard.shots.splice(fromIndex, 1)
      storyboard.shots.splice(toIndex, 0, removed)
      // 重新编号
      storyboard.shots.forEach((shot, idx) => {
        shot.sequence = idx + 1
        shot.code = `${Math.floor(idx / 4) + 1}${String.fromCharCode(65 + (idx % 4))}`
      })
      storyboard.updatedAt = new Date().toISOString()
    }
  }

  const approveShot = (shotId: string) => {
    updateShot(shotId, { status: 'approved' })
  }

  const rejectShot = (shotId: string) => {
    updateShot(shotId, { status: 'rejected' })
  }

  return {
    storyboards,
    currentStoryboardId,
    currentStoryboard,
    currentShots,
    shotsByStatus,
    loading,
    setCurrentStoryboard,
    createStoryboard,
    updateShot,
    addShot,
    deleteShot,
    reorderShots,
    approveShot,
    rejectShot,
  }
})

export { SHOT_SIZE_OPTIONS, ANGLE_OPTIONS, MOVEMENT_OPTIONS }
