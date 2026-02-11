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
    // 模拟AI解析 - 优化响应速度至 300ms
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const script = scripts.value.find(s => s.id === id)
    if (script) {
      script.status = 'parsed'
      script.parsedResult = {
        worldView: `【背景时代】这是一个灵气复苏与赛博科技高度融合的近未来世界（2077年）。古老的修仙法门被重新编码为神经信号，数据流成为了新的灵脉。

【社会规则】社会被划分为“云端贵族”（掌握核心算法与灵力的修仙者）与“霓虹底层”（依赖义肢与非法丹药生存的凡人）。修仙不再是清心寡欲，而是对算力与灵力的无尽掠夺。

【核心冲突】主角团试图打破“云端贵族”对飞升通道（最高权限服务器）的垄断，揭开灵气复苏背后的外星文明阴谋。`,
        characters: [
          {
            id: 'c1',
            projectId: script.projectId,
            type: 'character',
            name: '林小羽',
            description: '【身份】落魄道观的最后传人，白天是赛博义肢维修师，夜晚是猎杀失控AI的赏金猎人。\n【性格特征】外表冷漠慵懒，内心坚守道义，对旧时代的修仙传统有着执着的迷恋。\n【人物关系】白芷的契约主；与反派“玄机科技”CEO是旧识宿敌。',
            age: 22,
            gender: 'male',
            personality: '外冷内热、坚守道义',
            appearance: '身穿破旧的战术道袍，左臂为机械义肢，背负一把等离子光剑',
            tags: ['赛博剑客', '主角', '赏金猎人'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            projectId: script.projectId,
            type: 'character',
            name: '白芷',
            description: '【身份】上古九尾狐妖灵，被封印在废弃的数据核心中，后寄宿于林小羽的便携终端。\n【性格特征】古灵精怪，毒舌，对现代科技充满好奇但又经常弄巧成拙。\n【人物关系】林小羽的“电子宠物”兼战斗辅助；知晓“归墟”服务器的秘密。',
            age: 1000,
            gender: 'female',
            personality: '古灵精怪、傲娇毒舌',
            appearance: '全息投影形态的白衣少女，偶尔会因为信号不稳定出现Glitch故障风',
            tags: ['AI妖灵', '黑客', '九尾狐'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'c3',
            projectId: script.projectId,
            type: 'character',
            name: '萧天策',
            description: '【身份】玄机科技执行董事，垄断了全城的灵力供应。\n【性格特征】极度理性，信奉“弱肉强食”，认为人类只有机械飞升才是出路。\n【人物关系】林小羽的杀师仇人；试图捕捉白芷以开启飞升通道。',
            age: 45,
            gender: 'male',
            personality: '冷酷无情、极致理性',
            appearance: '西装革履，戴着金丝眼镜，眼神中流淌着数据流',
            tags: ['反派', '资本家', '修仙者'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ] as Character[],
        scenes: [
          {
            id: 's1',
            projectId: script.projectId,
            type: 'scene',
            name: '第7区地下黑市',
            description: '【环境描述】终年不见天日的地下街区，全息霓虹广告牌在雨雾中闪烁，贩卖非法义肢和劣质丹药的摊位杂乱无章。\n【氛围基调】压抑、潮湿、赛博朋克废土风。',
            location: '第7区',
            time: '深夜',
            atmosphere: '混乱、危险',
            style: '赛博废土',
            tags: ['黑市', '贫民窟', '赛博朋克'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 's2',
            projectId: script.projectId,
            type: 'scene',
            name: '云端天宫',
            description: '【环境描述】悬浮在城市上空的巨大反重力空间站，亭台楼阁皆由纳米材料构建，终年云雾缭绕，宛如仙境。\n【氛围基调】神圣、冰冷、高不可攀。',
            location: '平流层',
            time: '全天',
            atmosphere: '神圣、压抑',
            style: '科幻仙侠',
            tags: ['空间站', '天宫', '高科技'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ] as Scene[],
        items: [
          {
            id: 'i1',
            projectId: script.projectId,
            type: 'item',
            name: '断念剑（光剑版）',
            description: '【功能作用】林小羽的武器，剑身由高能等离子束构成，护手处镶嵌着一枚古老的灵石。\n【象征意义】象征着传统修仙与现代科技的结合，也代表了主角在新旧世界夹缝中的挣扎。',
            importance: 'high',
            ownerId: 'c1',
            tags: ['武器', '光剑', '灵器'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'i2',
            projectId: script.projectId,
            type: 'item',
            name: '玄天芯片',
            description: '【功能作用】封印白芷本体的古老芯片，表面刻满了微缩符文。\n【象征意义】连接过去与未来的钥匙，也是各方势力争夺的核心。',
            importance: 'high',
            ownerId: 'c2',
            tags: ['芯片', '封印', '关键道具'],
            images: [],
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ] as Item[],
        plotPoints: [
          { id: 'p1', type: 'setup', description: '【起】林小羽在维修义肢时意外激活了名为“白芷”的古老芯片，引来玄机科技的无人机追杀。', position: 1 },
          { id: 'p2', type: 'conflict', description: '【承】林小羽带着白芷逃入第7区黑市，在战斗中发现白芷能侵入并控制敌方机械，两人达成合作契约。', position: 2 },
          { id: 'p3', type: 'climax', description: '【转】萧天策亲自出手，林小羽为保护白芷重伤，绝境中林小羽将灵力注入光剑，引发“剑气化形”击退强敌。', position: 3 },
          { id: 'p4', type: 'resolution', description: '【合】两人逃脱追捕，林小羽决定主动出击，前往云端天宫寻找师父失踪的真相。', position: 4 },
        ],
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
