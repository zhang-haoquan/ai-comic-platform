import { mount, config } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import MainLayout from '../MainLayout.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useProjectStore } from '@/stores'

// Stub Element Plus components
config.global.stubs = {
  ElContainer: { template: '<div><slot /></div>' },
  ElAside: { template: '<div><slot /></div>' },
  ElHeader: { template: '<div><slot /></div>' },
  ElMain: { template: '<div><slot /></div>' },
  ElMenu: { template: '<div><slot /></div>' },
  ElSubMenu: { template: '<div><slot /></div>' },
  ElMenuItem: { template: '<div><slot /></div>' },
  ElBreadcrumb: { template: '<div><slot /></div>' },
  ElBreadcrumbItem: { template: '<span><slot /></span>' }, // Render content for text checking
  ElIcon: true,
  ElInput: true,
  ElBadge: true,
  ElAvatar: true,
  ElDropdown: true,
  ElDropdownMenu: true,
  ElDropdownItem: true,
  VideoCamera: true,
  HomeFilled: true,
  Folder: true,
  Document: true,
  PictureFilled: true,
  Film: true,
  List: true,
  ChatDotRound: true,
  Setting: true,
  Search: true,
  Bell: true,
  QuestionFilled: true,
  More: true
}

const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/projects', component: { template: '<div>Projects</div>' } },
  { path: '/script', component: { template: '<div>Script</div>' } },
  { path: '/storyboard', component: { template: '<div>Storyboard</div>' } },
  { path: '/generation', component: { template: '<div>Generation</div>' } },
  { path: '/script/edit/:id', meta: { activeMenu: '/script' }, component: { template: '<div>Edit</div>' } }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

describe('MainLayout Breadcrumb Logic', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    router.push('/')
    await router.isReady()
  })

  it('Level 1: Shows Project Name and Level 2 Menu Item', async () => {
    await router.push('/projects')
    
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [router]
      }
    })
    
    // Find breadcrumb container (stubbed as div with separator prop)
    const breadcrumb = wrapper.find('[separator="/"]')
    const text = breadcrumb.text()
    
    expect(text).toContain('山海经奇缘')
    expect(text).toContain('项目管理')
    expect(text).not.toContain('概览')
  })

  it('Level 2 Submenu: Shows Project Name > Parent Menu > Child Menu', async () => {
    await router.push('/storyboard')
    
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [router]
      }
    })
    
    const breadcrumb = wrapper.find('[separator="/"]')
    const text = breadcrumb.text()

    expect(text).toContain('山海经奇缘')
    expect(text).toContain('分镜管理')
    expect(text).toContain('分镜表')
  })

  it('Detail Page: Maps to Parent Menu Item via activeMenu meta', async () => {
    await router.push('/script/edit/1')
    
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [router]
      }
    })
    
    const breadcrumb = wrapper.find('[separator="/"]')
    const text = breadcrumb.text()

    expect(text).toContain('山海经奇缘')
    expect(text).toContain('剧本管理')
    expect(text).not.toContain('剧本编辑器') 
  })

  it('Updates when Project Name changes', async () => {
    await router.push('/projects')
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [router]
      }
    })
    
    const store = useProjectStore()
    store.projects[0].name = 'New Project Name'
    store.updateProject('1', { name: 'New Project Name' }) 
    
    await wrapper.vm.$nextTick()
    
    const breadcrumb = wrapper.find('[separator="/"]')
    const text = breadcrumb.text()

    expect(text).toContain('New Project Name')
  })
})
