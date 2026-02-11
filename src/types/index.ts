// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  milestones: Milestone[];
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'director' | 'artist' | 'writer' | 'editor' | 'member' | 'observer';
  joinedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// 剧本相关类型
export interface Script {
  id: string;
  projectId: string;
  title: string;
  content: string;
  format: 'text' | 'markdown' | 'json';
  status: 'draft' | 'parsing' | 'parsed' | 'parse_failed' | 'locked' | 'archived';
  version: number;
  parsedResult?: ScriptParseResult;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptParseResult {
  worldView: string;
  characters: Character[];
  scenes: Scene[];
  items: Item[];
  plotPoints: PlotPoint[];
}

export interface PlotPoint {
  id: string;
  type: 'setup' | 'conflict' | 'climax' | 'resolution';
  description: string;
  position: number;
}

// 实体类型（角色/场景/物品）
export interface Entity {
  id: string;
  projectId: string;
  type: 'character' | 'scene' | 'item';
  name: string;
  description: string;
  tags: string[];
  images: EntityImage[];
  prompt?: Prompt;
  references: Reference[];
  createdAt: string;
  updatedAt: string;
}

export interface Character extends Entity {
  type: 'character';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  personality?: string;
  appearance?: string;
  background?: string;
}

export interface Scene extends Entity {
  type: 'scene';
  location?: string;
  time?: string;
  atmosphere?: string;
  style?: string;
}

export interface Item extends Entity {
  type: 'item';
  ownerId?: string;
  importance?: 'low' | 'medium' | 'high';
}

export interface EntityImage {
  id: string;
  url: string;
  version: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Reference {
  id: string;
  type: 'shot' | 'script' | 'task';
  targetId: string;
  targetName: string;
}

// 提示词类型
export interface Prompt {
  id: string;
  entityId: string;
  content: string;
  modelType: 'image' | 'video';
  modelConfig?: Record<string, any>;
  optimized?: string;
  createdAt: string;
}

// 分镜相关类型
export interface Storyboard {
  id: string;
  projectId: string;
  scriptId: string;
  name: string;
  shots: Shot[];
  totalDuration: number;
  status: 'draft' | 'confirmed' | 'locked';
  createdAt: string;
  updatedAt: string;
}

export interface Shot {
  id: string;
  storyboardId: string;
  sequence: number;
  code: string;
  description: string;
  dialogue?: string;
  shotSize: 'extreme_long' | 'long' | 'full' | 'medium' | 'close_up' | 'extreme_close_up';
  angle: 'eye_level' | 'high' | 'low' | 'dutch' | 'overhead' | 'bird_eye';
  movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'crane' | 'handheld' | 'zoom';
  duration: number;
  emotions: string[];
  characters: string[];
  scenes: string[];
  items: string[];
  images: ShotImage[];
  status: 'pending' | 'generating' | 'pending_review' | 'approved' | 'rejected' | 'deprecated';
  taskId?: string;
  // 新增字段
  subject?: string;           // 主体人物
  sceneDetail?: string;       // 场景详情
  atmosphere?: string;        // 氛围参照
  lighting?: string;          // 灯光设计
  effects?: string;           // 特效
  prompt?: string;            // AI生成提示词
  videoPrompt?: string;       // AI视频生成提示词
}

export interface ShotImage {
  id: string;
  url: string;
  type: 'image' | 'video';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
}

// 生成任务类型
export interface GenerationJob {
  id: string;
  projectId: string;
  targetType: 'character' | 'scene' | 'item' | 'shot';
  targetId: string;
  type: 'image' | 'video';
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
  progress: number;
  prompt: string;
  modelConfig: Record<string, any>;
  result?: string;
  error?: string;
  cost: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// 任务管理类型
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type: 'script' | 'asset' | 'storyboard' | 'shot' | 'review' | 'other';
  status: 'not_started' | 'in_progress' | 'blocked' | 'pending_review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: ProjectMember;
  reporter: ProjectMember;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  parentId?: string;
  subtasks: Task[];
  relatedShots: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 评论类型
export interface Comment {
  id: string;
  projectId: string;
  targetType: 'script' | 'entity' | 'shot' | 'task';
  targetId: string;
  content: string;
  contentType: 'text' | 'image' | 'voice';
  author: ProjectMember;
  mentions: string[];
  replies: Comment[];
  status: 'active' | 'resolved' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// 知识库类型
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: 'tutorial' | 'tip' | 'faq' | 'best_practice';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: ProjectMember;
  rating: number;
  views: number;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: string;
  notificationPreferences: Record<string, boolean>;
  timezone: string;
  createdAt: string;
  lastLoginAt?: string;
}

// 视图类型
export type ViewType = 'dashboard' | 'list' | 'gantt';

// 景别选项
export const SHOT_SIZE_OPTIONS = [
  { value: 'extreme_long', label: '极远景', description: '展示宏大场景' },
  { value: 'long', label: '远景', description: '展示环境和人物关系' },
  { value: 'full', label: '全景', description: '展示完整人物' },
  { value: 'medium', label: '中景', description: '展示人物上半身' },
  { value: 'close_up', label: '近景', description: '展示人物胸部以上' },
  { value: 'extreme_close_up', label: '特写', description: '展示面部或细节' },
];

// 拍摄角度选项
export const ANGLE_OPTIONS = [
  { value: 'eye_level', label: '平视', description: '正常视角' },
  { value: 'high', label: '俯视', description: '从上往下拍摄' },
  { value: 'low', label: '仰视', description: '从下往上拍摄' },
  { value: 'dutch', label: '倾斜', description: '画面倾斜，营造紧张感' },
  { value: 'overhead', label: '顶视', description: '正上方拍摄' },
  { value: 'bird_eye', label: '鸟瞰', description: '高空俯瞰' },
];

// 运镜方式选项
export const MOVEMENT_OPTIONS = [
  { value: 'static', label: '固定', description: '摄像机不动' },
  { value: 'pan', label: '摇', description: '水平转动' },
  { value: 'tilt', label: '移', description: '垂直转动' },
  { value: 'dolly', label: '推/拉', description: '前后移动' },
  { value: 'truck', label: '横移', description: '左右移动' },
  { value: 'crane', label: '升降', description: '上下移动' },
  { value: 'handheld', label: '手持', description: '手持拍摄效果' },
  { value: 'zoom', label: '变焦', description: '焦距变化' },
];
