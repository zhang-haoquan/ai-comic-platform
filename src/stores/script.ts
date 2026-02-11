import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Script, Character, Scene, Item } from '@/types'

// 模拟剧本数据
const mockScripts: Script[] = [
  {
    id: '1',
    projectId: '1',
    title: '山海经奇缘',
    content: `第一幕：相遇

场景：青云山巅 - 黄昏

林小羽站在山巅，手持长剑，目光坚定地望向远方。夕阳的余晖洒在他身上，映出一片金黄。

林小羽（独白）：这天下，终究要有人守护。

突然，一道白光闪过，一只白狐从林中窜出，化作一位白衣少女。

白狐少女：你是谁？为何身上有上古神器的气息？

林小羽（警觉）：你又是谁？妖狐？

白狐少女（微笑）：我叫白芷，是这青云山的守护灵。你手中的玄天玉佩，是我族圣物。

林小羽（惊讶）：玄天玉佩？这是我师父临终前交给我的...

白芷：看来，命运终于让我们相遇了。`,
    format: 'text',
    status: 'parsed',
    version: 1,
    parsedResult: {
      worldView: '一个融合神话与现代元素的修仙世界，人类与妖灵共存，上古神器散落人间',
      characters: [
        {
          id: 'c1',
          projectId: '1',
          type: 'character',
          name: '林小羽',
          description: '年轻剑客，身负守护天下的使命',
          age: 20,
          gender: 'male',
          personality: '坚定、正义、有些固执',
          appearance: '手持长剑，身着青衫',
          tags: ['主角', '剑客', '守护者'],
          images: [],
          references: [],
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
        },
        {
          id: 'c2',
          projectId: '1',
          type: 'character',
          name: '白芷',
          description: '青云山守护灵，白狐化身',
          age: 500,
          gender: 'female',
          personality: '聪慧、神秘、温柔',
          appearance: '白衣少女，狐耳狐尾',
          tags: ['守护灵', '白狐', '神秘'],
          images: [],
          references: [],
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
        },
      ] as Character[],
      scenes: [
        {
          id: 's1',
          projectId: '1',
          type: 'scene',
          name: '青云山巅',
          description: '高山之巅，视野开阔，夕阳西下的美景',
          location: '青云山',
          time: '黄昏',
          atmosphere: '宁静而神秘',
          style: '东方仙侠风',
          tags: ['山巅', '黄昏', '重要场景'],
          images: [],
          references: [],
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
        },
      ] as Scene[],
      items: [
        {
          id: 'i1',
          projectId: '1',
          type: 'item',
          name: '玄天玉佩',
          description: '上古神器，白狐族圣物，蕴含强大力量',
          importance: 'high',
          ownerId: 'c1',
          tags: ['神器', '关键道具'],
          images: [],
          references: [],
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
        },
        {
          id: 'i2',
          projectId: '1',
          type: 'item',
          name: '长剑',
          description: '林小羽的佩剑',
          importance: 'medium',
          ownerId: 'c1',
          tags: ['武器'],
          images: [],
          references: [],
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
        },
      ] as Item[],
      plotPoints: [
        { id: 'p1', type: 'setup', description: '林小羽在山巅独白，展现守护天下的决心', position: 1 },
        { id: 'p2', type: 'conflict', description: '白芷出现，质疑林小羽身上神器的气息', position: 2 },
        { id: 'p3', type: 'climax', description: '揭示玄天玉佩的秘密，两人命运交织', position: 3 },
      ],
    },
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
  },
]

export const useScriptStore = defineStore('script', () => {
  // State
  const scripts = ref<Script[]>(mockScripts)
  const currentScriptId = ref<string>('1')
  const parsing = ref(false)

  // Getters
  const currentScript = computed(() => 
    scripts.value.find(s => s.id === currentScriptId.value)
  )

  const parsedCharacters = computed(() => 
    currentScript.value?.parsedResult?.characters || []
  )

  const parsedScenes = computed(() => 
    currentScript.value?.parsedResult?.scenes || []
  )

  const parsedItems = computed(() => 
    currentScript.value?.parsedResult?.items || []
  )

  // Actions
  const setCurrentScript = (id: string) => {
    currentScriptId.value = id
  }

  const createScript = (script: Partial<Script>) => {
    const newScript: Script = {
      id: Date.now().toString(),
      projectId: script.projectId || '',
      title: script.title || '未命名剧本',
      content: script.content || '',
      format: 'text',
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...script,
    }
    scripts.value.push(newScript)
    return newScript
  }

  const updateScript = (id: string, updates: Partial<Script>) => {
    const index = scripts.value.findIndex(s => s.id === id)
    if (index !== -1) {
      scripts.value[index] = { 
        ...scripts.value[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
    }
  }

  const parseScript = async (id: string) => {
    parsing.value = true
    // 模拟AI解析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const script = scripts.value.find(s => s.id === id)
    if (script) {
      script.status = 'parsed'
      script.parsedResult = {
        worldView: '解析出的世界观描述...',
        characters: [],
        scenes: [],
        items: [],
        plotPoints: [],
      }
    }
    parsing.value = false
  }

  const lockScript = (id: string) => {
    const script = scripts.value.find(s => s.id === id)
    if (script) {
      script.status = 'locked'
    }
  }

  return {
    scripts,
    currentScriptId,
    currentScript,
    parsedCharacters,
    parsedScenes,
    parsedItems,
    parsing,
    setCurrentScript,
    createScript,
    updateScript,
    parseScript,
    lockScript,
  }
})
