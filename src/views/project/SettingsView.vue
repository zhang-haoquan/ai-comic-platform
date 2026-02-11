<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-comic-text">项目设置</h1>
        <p class="text-sm text-comic-muted mt-1">管理项目基本信息和成员权限</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Basic Settings -->
      <div class="lg:col-span-2 space-y-6">
        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">基本信息</span>
          </template>
          <el-form label-width="100px">
            <el-form-item label="项目名称">
              <el-input v-model="projectForm.name" />
            </el-form-item>
            <el-form-item label="项目描述">
              <el-input v-model="projectForm.description" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="封面">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
              >
                <img v-if="projectForm.coverImage" :src="projectForm.coverImage" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProject">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">AI 模型配置</span>
          </template>
          <el-form label-width="150px">
            <el-form-item label="默认图片模型">
              <el-select v-model="aiConfig.imageModel" class="w-full">
                <el-option label="Midjourney v6" value="midjourney-v6" />
                <el-option label="Stable Diffusion XL" value="sdxl" />
                <el-option label="DALL-E 3" value="dalle3" />
              </el-select>
            </el-form-item>
            <el-form-item label="默认视频模型">
              <el-select v-model="aiConfig.videoModel" class="w-full">
                <el-option label="Runway Gen-2" value="runway-gen2" />
                <el-option label="Pika Labs" value="pika" />
                <el-option label="Stable Video" value="svd" />
              </el-select>
            </el-form-item>
            <el-form-item label="图片尺寸">
              <el-radio-group v-model="aiConfig.imageSize">
                <el-radio-button label="1024x1024">1:1</el-radio-button>
                <el-radio-button label="1024x1536">2:3</el-radio-button>
                <el-radio-button label="1920x1080">16:9</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAIConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- Right: Members -->
      <div class="space-y-6">
        <el-card shadow="never" class="comic-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="section-title">团队成员</span>
              <el-button type="primary" text :icon="Plus" @click="showAddMember = true">添加</el-button>
            </div>
          </template>
          <div class="space-y-3">
            <div v-for="member in currentProject?.members" :key="member.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <el-avatar :size="40" :src="member.avatar" />
              <div class="flex-1">
                <p class="font-medium text-comic-text">{{ member.name }}</p>
                <p class="text-xs text-comic-muted">{{ getRoleLabel(member.role) }}</p>
              </div>
              <el-dropdown>
                <el-icon class="cursor-pointer"><More /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>修改权限</el-dropdown-item>
                    <el-dropdown-item type="danger">移除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="comic-card">
          <template #header>
            <span class="section-title">危险操作</span>
          </template>
          <div class="space-y-3">
            <el-button class="w-full" type="danger" text :icon="Delete" @click="archiveProject">归档项目</el-button>
            <el-button class="w-full" type="danger" text :icon="DeleteFilled" @click="deleteProject">删除项目</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Add Member Dialog -->
    <el-dialog v-model="showAddMember" title="添加成员" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <el-select v-model="newMember.userId" placeholder="选择用户" class="w-full">
            <el-option label="用户A" value="user1" />
            <el-option label="用户B" value="user2" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newMember.role" class="w-full">
            <el-option label="导演" value="director" />
            <el-option label="编剧" value="writer" />
            <el-option label="美术" value="artist" />
            <el-option label="编辑" value="editor" />
            <el-option label="成员" value="member" />
            <el-option label="观察者" value="observer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddMember = false">取消</el-button>
        <el-button type="primary" @click="addMember">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, DeleteFilled, More } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.currentProject)

const projectForm = ref({
  name: currentProject.value?.name || '',
  description: currentProject.value?.description || '',
  coverImage: currentProject.value?.coverImage || '',
})

const aiConfig = ref({
  imageModel: 'midjourney-v6',
  videoModel: 'runway-gen2',
  imageSize: '1920x1080',
})

const showAddMember = ref(false)
const newMember = ref({
  userId: '',
  role: 'member',
})

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    admin: '管理员',
    director: '导演',
    writer: '编剧',
    artist: '美术',
    editor: '编辑',
    member: '成员',
    observer: '观察者',
  }
  return map[role] || role
}

const saveProject = () => {
  if (currentProject.value) {
    projectStore.updateProject(currentProject.value.id, projectForm.value)
    ElMessage.success('项目信息已更新')
  }
}

const saveAIConfig = () => {
  ElMessage.success('AI配置已保存')
}

const addMember = () => {
  showAddMember.value = false
  ElMessage.success('成员已添加')
}

const archiveProject = async () => {
  try {
    await ElMessageBox.confirm('确定要归档此项目吗？归档后项目将变为只读状态。', '提示', {
      type: 'warning',
    })
    ElMessage.success('项目已归档')
  } catch {
    // Cancelled
  }
}

const deleteProject = async () => {
  try {
    await ElMessageBox.confirm('确定要删除此项目吗？此操作不可恢复！', '警告', {
      type: 'error',
    })
    ElMessage.success('项目已删除')
  } catch {
    // Cancelled
  }
}
</script>

<style scoped>
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }
  :deep(.el-upload:hover) {
    border-color: var(--el-color-primary);
  }
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
