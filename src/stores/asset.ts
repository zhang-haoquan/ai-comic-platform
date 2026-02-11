import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Entity, Character, Scene, Item } from '@/types'

// 模拟资产数据
const mockAssets: (Character | Scene | Item)[] = [
  {
    id: 'c1',
    projectId: '1',
    type: 'character',
    name: '林小羽',
    description: '年轻剑客，身负守护天下的使命',
    tags: ['主角', '剑客', '守护者'],
    images: [
      { id: 'img1', url: 'https://picsum.photos/seed/char1/400/600', version: 'v1', isDefault: true, createdAt: '2024-01-25T10:00:00Z' },
      { id: 'img2', url: 'https://picsum.photos/seed/char1v2/400/600', version: 'v2', isDefault: false, createdAt: '2024-02-01T10:00:00Z' },
    ],
    prompt: {
      id: 'prompt1',
      entityId: 'c1',
      content: 'young male swordsman, Chinese martial arts style, green robes, long hair, holding sword, heroic expression, detailed anime style',
      modelType: 'image',
      createdAt: '2024-01-25T10:00:00Z',
    },
    references: [
      { id: 'r1', type: 'shot', targetId: 'shot1', targetName: '镜头1A' },
      { id: 'r2', type: 'shot', targetId: 'shot3', targetName: '镜头3B' },
    ],
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'c2',
    projectId: '1',
    type: 'character',
    name: '白芷',
    description: '青云山守护灵，白狐化身',
    tags: ['守护灵', '白狐', '神秘'],
    images: [
      { id: 'img3', url: 'https://picsum.photos/seed/char2/400/600', version: 'v1', isDefault: true, createdAt: '2024-01-25T10:00:00Z' },
    ],
    prompt: {
      id: 'prompt2',
      entityId: 'c2',
      content: 'beautiful female fox spirit, white hair, fox ears, flowing white robes, mystical aura, anime style, ethereal beauty',
      modelType: 'image',
      createdAt: '2024-01-25T10:00:00Z',
    },
    references: [],
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 's1',
    projectId: '1',
    type: 'scene',
    name: '青云山巅',
    description: '高山之巅，视野开阔，夕阳西下的美景',
    tags: ['山巅', '黄昏', '重要场景'],
    images: [
      { id: 'img4', url: 'https://picsum.photos/seed/scene1/800/450', version: 'v1', isDefault: true, createdAt: '2024-01-26T10:00:00Z' },
    ],
    references: [
      { id: 'r3', type: 'shot', targetId: 'shot1', targetName: '镜头1A' },
      { id: 'r4', type: 'shot', targetId: 'shot2', targetName: '镜头2C' },
    ],
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
  },
  {
    id: 'i1',
    projectId: '1',
    type: 'item',
    name: '玄天玉佩',
    description: '上古神器，白狐族圣物，蕴含强大力量',
    tags: ['神器', '关键道具'],
    importance: 'high',
    images: [
      { id: 'img5', url: 'https://picsum.photos/seed/item1/300/300', version: 'v1', isDefault: true, createdAt: '2024-01-27T10:00:00Z' },
    ],
    references: [],
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-27T10:00:00Z',
  },
]

export const useAssetStore = defineStore('asset', () => {
  // State
  const assets = ref<Entity[]>(mockAssets)
  const currentAssetId = ref<string | null>(null)
  const assetTypeFilter = ref<'all' | 'character' | 'scene' | 'item'>('all')
  const loading = ref(false)

  // Getters
  const filteredAssets = computed(() => {
    if (assetTypeFilter.value === 'all') {
      return assets.value
    }
    return assets.value.filter(a => a.type === assetTypeFilter.value)
  })

  const characters = computed(() => 
    assets.value.filter(a => a.type === 'character')
  )

  const scenes = computed(() => 
    assets.value.filter(a => a.type === 'scene')
  )

  const items = computed(() => 
    assets.value.filter(a => a.type === 'item')
  )

  const currentAsset = computed(() => 
    assets.value.find(a => a.id === currentAssetId.value)
  )

  // Actions
  const setCurrentAsset = (id: string | null) => {
    currentAssetId.value = id
  }

  const setAssetTypeFilter = (type: 'all' | 'character' | 'scene' | 'item') => {
    assetTypeFilter.value = type
  }

  const createAsset = (asset: Partial<Entity>) => {
    const newAsset: Entity = {
      id: Date.now().toString(),
      projectId: asset.projectId || '',
      type: asset.type || 'character',
      name: asset.name || '未命名资产',
      description: asset.description || '',
      tags: asset.tags || [],
      images: [],
      references: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...asset,
    }
    assets.value.push(newAsset)
    return newAsset
  }

  const updateAsset = (id: string, updates: Partial<Entity>) => {
    const index = assets.value.findIndex(a => a.id === id)
    if (index !== -1) {
      assets.value[index] = { 
        ...assets.value[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
    }
  }

  const deleteAsset = (id: string) => {
    const index = assets.value.findIndex(a => a.id === id)
    if (index !== -1) {
      assets.value.splice(index, 1)
    }
  }

  const addAssetImage = (assetId: string, image: { url: string; version: string }) => {
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.images.push({
        id: Date.now().toString(),
        url: image.url,
        version: image.version,
        isDefault: asset.images.length === 0,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const setDefaultImage = (assetId: string, imageId: string) => {
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.images.forEach(img => {
        img.isDefault = img.id === imageId
      })
    }
  }

  return {
    assets,
    currentAssetId,
    assetTypeFilter,
    filteredAssets,
    characters,
    scenes,
    items,
    currentAsset,
    loading,
    setCurrentAsset,
    setAssetTypeFilter,
    createAsset,
    updateAsset,
    deleteAsset,
    addAssetImage,
    setDefaultImage,
  }
})
