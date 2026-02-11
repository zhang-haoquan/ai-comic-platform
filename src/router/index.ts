import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/project/DashboardView.vue'),
        meta: { title: '概览', icon: 'HomeFilled' },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/project/ProjectsView.vue'),
        meta: { title: '项目管理', icon: 'Folder' },
      },
      {
        path: 'script',
        name: 'Script',
        component: () => import('@/views/script/ScriptListView.vue'),
        meta: { title: '剧本管理', icon: 'Document' },
      },
      {
        path: 'script/edit/:id',
        name: 'ScriptEdit',
        component: () => import('@/views/script/ScriptEditorView.vue'),
        meta: { title: '剧本编辑器', hidden: true, activeMenu: '/script' },
      },
      {
        path: 'script/parse',
        name: 'ScriptParse',
        component: () => import('@/views/script/ScriptParseView.vue'),
        meta: { title: '解析结果', hidden: true, activeMenu: '/script' },
      },
      {
        path: 'assets',
        name: 'Assets',
        component: () => import('@/views/asset/AssetListView.vue'),
        meta: { title: '资产库', icon: 'PictureFilled' },
      },
      {
        path: 'assets/:id',
        name: 'AssetDetail',
        component: () => import('@/views/asset/AssetDetailView.vue'),
        meta: { title: '资产详情', hidden: true, activeMenu: '/assets' },
      },
      {
        path: 'storyboard',
        name: 'Storyboard',
        component: () => import('@/views/storyboard/StoryboardView.vue'),
        meta: { title: '分镜表', icon: 'Film' },
      },
      {
        path: 'shots/:id',
        name: 'ShotDetail',
        component: () => import('@/views/storyboard/ShotDetailView.vue'),
        meta: { title: '镜头详情', hidden: true, activeMenu: '/storyboard' },
      },
      {
        path: 'generation',
        name: 'Generation',
        component: () => import('@/views/storyboard/GenerationView.vue'),
        meta: { title: '生成中心', icon: 'VideoCamera' },
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/task/TaskView.vue'),
        meta: { title: '任务管理', icon: 'List' },
      },
      {
        path: 'comments',
        name: 'Comments',
        component: () => import('@/views/collaboration/CommentView.vue'),
        meta: { title: '评论中心', icon: 'ChatDotRound' },
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/collaboration/KnowledgeView.vue'),
        meta: { title: '知识库', icon: 'Reading' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/project/SettingsView.vue'),
        meta: { title: '项目设置', icon: 'Setting' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
