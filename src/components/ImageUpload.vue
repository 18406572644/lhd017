<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, Upload, Delete, ZoomIn, Loading } from '@element-plus/icons-vue'
import { compressImage, formatFileSize } from '@/utils/image'

interface Props {
  modelValue: string
  maxSizeMB?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxSizeMB: 2,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fileInputRef = ref<HTMLInputElement>()
const cameraInputRef = ref<HTMLInputElement>()
const isUploading = ref(false)
const previewVisible = ref(false)
const dragOver = ref(false)

const hasImage = computed(() => !!props.modelValue)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  await processFile(file)
  target.value = ''
}

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  if (file.size > props.maxSizeMB * 1024 * 1024 * 5) {
    ElMessage.error(`图片原始大小不能超过 ${props.maxSizeMB * 5}MB`)
    return
  }

  isUploading.value = true

  try {
    const compressed = await compressImage(file, {
      maxSizeMB: props.maxSizeMB,
      maxWidthOrHeight: 1920,
      quality: 0.85,
    })

    emit('update:modelValue', compressed)
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片处理失败:', error)
    ElMessage.error('图片处理失败，请重试')
  } finally {
    isUploading.value = false
  }
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const triggerCamera = () => {
  cameraInputRef.value?.click()
}

const handleDelete = () => {
  emit('update:modelValue', '')
  ElMessage.success('图片已删除')
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = false

  const file = e.dataTransfer?.files[0]
  if (file) {
    await processFile(file)
  }
}

const handleImageClick = () => {
  handlePreview()
}
</script>

<template>
  <div class="image-upload">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
    <input
      ref="cameraInputRef"
      type="file"
      accept="image/*"
      capture="environment"
      style="display: none"
      @change="handleFileSelect"
    />

    <div
      v-if="!hasImage"
      class="image-upload__empty"
      :class="{ 'image-upload__empty--drag': dragOver }"
      @click="triggerFileSelect"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="image-upload__icon-wrap">
        <el-icon :size="48" class="image-upload__icon">
          <Upload />
        </el-icon>
      </div>
      <p class="image-upload__tip">点击或拖拽图片到此处上传</p>
      <p class="image-upload__sub-tip">支持 JPG、PNG 格式，单张不超过 {{ maxSizeMB }}MB</p>
      <div class="image-upload__actions">
        <el-button type="primary" @click.stop="triggerFileSelect">
          <el-icon><Upload /></el-icon>
          选择图片
        </el-button>
        <el-button @click.stop="triggerCamera" class="md:hidden">
          <el-icon><Camera /></el-icon>
          拍照
        </el-button>
      </div>
    </div>

    <div v-else class="image-upload__preview">
      <img
        :src="modelValue"
        alt="预览"
        class="image-upload__img"
        @click="handleImageClick"
      />
      <div class="image-upload__overlay">
        <el-button
          type="primary"
          circle
          size="small"
          @click="handlePreview"
          class="image-upload__overlay-btn"
        >
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-button
          type="danger"
          circle
          size="small"
          @click="handleDelete"
          class="image-upload__overlay-btn"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      <div class="image-upload__reupload">
        <el-button size="small" @click="triggerFileSelect">
          <el-icon><Upload /></el-icon>
          重新上传
        </el-button>
        <el-button size="small" @click="triggerCamera" class="md:hidden">
          <el-icon><Camera /></el-icon>
          重新拍照
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="auto"
      :close-on-click-modal="true"
      class="image-upload__preview-dialog"
    >
      <img :src="modelValue" alt="预览大图" class="image-upload__preview-img" />
    </el-dialog>

    <div v-if="isUploading" class="image-upload__loading">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>图片处理中...</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-upload {
  position: relative;

  &__empty {
    border: 2px dashed var(--color-border-light);
    border-radius: var(--radius-lg);
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-base);
    background: var(--color-bg);

    &:hover,
    &--drag {
      border-color: var(--color-primary);
      background: var(--color-primary) + '08';
    }
  }

  &__icon-wrap {
    margin-bottom: 16px;
  }

  &__icon {
    color: var(--color-text-light);
  }

  &__tip {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;
  }

  &__sub-tip {
    font-size: 12px;
    color: var(--color-text-light);
    margin: 0 0 20px 0;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  &__preview {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-bg);
  }

  &__img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    cursor: pointer;
    display: block;
  }

  &__overlay {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  &__preview:hover &__overlay {
    opacity: 1;
  }

  &__overlay-btn {
    box-shadow: var(--shadow-sm);
  }

  &__reupload {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 16px;
    border-top: 1px solid var(--color-border-light);
  }

  &__preview-dialog {
    :deep(.el-dialog__body) {
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &__preview-img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: var(--radius-md);
  }

  &__loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius-lg);
    gap: 12px;

    p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .image-upload {
    &__img {
      max-height: 240px;
    }

    &__overlay {
      opacity: 1;
    }
  }
}
</style>
