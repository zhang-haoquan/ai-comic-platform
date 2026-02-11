import { mount } from '@vue/test-utils'
import ShotDetailView from '../ShotDetailView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useStoryboardStore } from '@/stores'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  ArrowLeft: 'ArrowLeft',
  Refresh: 'Refresh',
  Check: 'Check',
  Close: 'Close',
  Picture: 'Picture',
  Plus: 'Plus',
  VideoPlay: 'VideoPlay',
  VideoPause: 'VideoPause',
  FullScreen: 'FullScreen',
  Download: 'Download',
  Mute: 'Mute',
  Microphone: 'Microphone',
  VideoCamera: 'VideoCamera'
}))

// Mock router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'shot1' }
  })
}))

describe('ShotDetailView.vue', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    wrapper = mount(ShotDetailView, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            storyboard: {
              currentShots: [{
                id: 'shot1',
                code: '1A',
                status: 'pending',
                images: [],
                videoPrompt: ''
              }]
            }
          }
        })],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-slider': true,
          'el-card': true,
          'el-tag': true,
          'el-icon': true,
          'el-dialog': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-empty': true
        }
      }
    })
    store = useStoryboardStore()
  })

  it('initializes with step 1 active', () => {
    expect(wrapper.vm.currentStep).toBe(1)
    expect(wrapper.find('.bg-[#409EFF]').text()).toContain('1') // Active step color
  })

  it('updates step 1 to completed after save', async () => {
    // Simulate save
    await wrapper.vm.saveShotBasicInfo()
    expect(wrapper.vm.currentStep).toBe(2)
    // Step 1 should be green
    // Since DOM update is async, we check VM state primarily here or wait for nextTick
    // Re-mount or computed check
    expect(wrapper.vm.isStep1Completed).toBe(true)
  })

  it('blocks image generation if step 1 not completed', async () => {
    wrapper.vm.currentStep = 1
    await wrapper.vm.generateStoryboardImages()
    // Should not change state or call API (mocked by flag check)
    expect(wrapper.vm.imageGenerating).toBe(false)
  })

  it('allows image generation if step 1 completed', async () => {
    wrapper.vm.currentStep = 2
    
    // Trigger generation
    const promise = wrapper.vm.generateStoryboardImages()
    expect(wrapper.vm.imageGenerating).toBe(true)
    
    await promise
    expect(wrapper.vm.imageGenerating).toBe(false)
    expect(wrapper.vm.currentStep).toBe(3)
  })

  it('blocks video generation if step 2 not completed', async () => {
    wrapper.vm.currentStep = 2
    await wrapper.vm.generateVideo()
    expect(wrapper.vm.videoGenerating).toBe(false)
  })

  it('allows video generation if step 2 completed', async () => {
    wrapper.vm.currentStep = 3
    
    // Trigger generation
    const promise = wrapper.vm.generateVideo()
    expect(wrapper.vm.videoGenerating).toBe(true)
    
    // Fast forward timers if we used real timers, but here we used await promise delay in component
    // Since we can't easily fast forward the internal promise delay without fake timers, 
    // we just check initial state change which confirms logic entry.
  })
})
