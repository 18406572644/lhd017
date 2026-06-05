<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Collection } from '@element-plus/icons-vue'
import type { MedicineTag } from '@/types/medicine'
import { useTag } from '@/composables/useTag'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const { tagList, addTag, updateTag, deleteTag } = useTag()

const showFormDialog = ref(false)
const editingTag = ref<MedicineTag | null>(null)
const formData = ref({
  name: '',
  color: '#4A90D9',
})

const presetColors = [
  '#4A90D9', '#EF5350', '#FFB74D', '#AB47BC', '#66BB6A',
  '#EC407A', '#8BC34A', '#78909C', '#FF7043', '#26C6DA',
  '#5C6BC0', '#66BB6A', '#FFA726', '#EC407A', '#26A69A',
]

const handleClose = () => {
  emit('update:visible', false)
}

const handleAdd = () => {
  editingTag.value = null
  formData.value = { name: '', color: '#4A90D9' }
  showFormDialog.value = true
}

const handleEdit = (tag: MedicineTag) => {
  editingTag.value = tag
  formData.value = { name: tag.name, color: tag.color }
  showFormDialog.value = true
}

const handleDelete = async (tag: MedicineTag) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签「${tag.name}」吗？删除后该标签将从所有关联药品中移除。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    )
    deleteTag(tag.id)
    ElMessage.success('标签删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  const duplicateName = tagList.value.some(
    (t) => t.name === formData.value.name.trim() && t.id !== editingTag.value?.id
  )
  if (duplicateName) {
    ElMessage.warning('标签名称已存在')
    return
  }

  if (editingTag.value) {
    updateTag(editingTag.value.id, {
      name: formData.value.name.trim(),
      color: formData.value.color,
    })
    ElMessage.success('标签更新成功')
  } else {
    addTag(formData.value.name.trim(), formData.value.color)
    ElMessage.success('标签创建成功')
  }
  showFormDialog.value = false
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="标签管理"
    width="600px"
    @update:model-value="handleClose"
    class="tag-manager-dialog"
  >
    <div class="tag-manager">
      <div class="tag-manager__header">
        <p class="tag-manager__desc">
          管理药品标签，支持自定义颜色，可通过标签快速筛选和归类药品。
        </p>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建标签
        </el-button>
      </div>

      <div v-if="tagList.length > 0" class="tag-manager__list">
        <div
          v-for="tag in tagList"
          :key="tag.id"
          class="tag-item"
        >
          <div class="tag-item__main">
            <span
              class="tag-item__color"
              :style="{ backgroundColor: tag.color }"
            />
            <span class="tag-item__name">{{ tag.name }}</span>
            <span class="tag-item__color-code">{{ tag.color }}</span>
          </div>
          <div class="tag-item__actions">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(tag)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(tag)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <el-empty
        v-else
        class="tag-manager__empty"
        description="暂无标签，点击上方按钮创建第一个标签"
      />
    </div>

    <el-dialog
      v-model="showFormDialog"
      :title="editingTag ? '编辑标签' : '新建标签'"
      width="420px"
      :close-on-click-modal="false"
      class="tag-form-dialog"
    >
      <div class="tag-form">
        <el-form label-width="80px">
          <el-form-item label="标签名称" required>
            <el-input
              v-model="formData.name"
              placeholder="请输入标签名称"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="标签颜色">
            <div class="tag-form__color-picker">
              <div class="tag-form__color-preview">
                <span
                  class="tag-form__color-dot"
                  :style="{ backgroundColor: formData.color }"
                />
                <span class="tag-form__color-text">{{ formData.color }}</span>
              </div>
              <div class="tag-form__preset-colors">
                <div
                  v-for="color in presetColors"
                  :key="color"
                  class="tag-form__preset-color"
                  :class="{ active: formData.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="formData.color = color"
                />
              </div>
              <el-color-picker
                v-model="formData.color"
                show-alpha
                class="tag-form__color-input"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showFormDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ editingTag ? '保存修改' : '创建标签' }}
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
.tag-manager-dialog {
  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--color-border-light);
  }
}

.tag-manager {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__desc {
    flex: 1;
    margin: 0;
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
  }

  &__empty {
    padding: 40px 0;
  }
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);
  }

  &__main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__color-code {
    font-size: 12px;
    color: var(--color-text-light);
    font-family: 'Courier New', monospace;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.tag-form-dialog {
  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--color-border-light);
  }
}

.tag-form {
  &__color-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  &__color-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
  }

  &__color-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  &__color-text {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-family: 'Courier New', monospace;
  }

  &__preset-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__preset-color {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--transition-fast);
    border: 2px solid transparent;

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      border-color: var(--color-text-primary);
    }
  }

  &__color-input {
    align-self: flex-start;
  }
}

@media (max-width: 600px) {
  .tag-manager {
    &__header {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .tag-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    &__actions {
      align-self: flex-end;
    }
  }
}
</style>
