<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Document, Grid } from '@element-plus/icons-vue'
import type { ExportOptions } from '@/types/medicine'

interface Props {
  visible: boolean
  allCount: number
  filteredCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'export', options: ExportOptions): void
}>()

const format = ref<'json' | 'csv'>('json')
const scope = ref<'all' | 'filtered'>('all')
const includeTags = ref(true)
const includeUsageRecords = ref(false)

const disabled = computed(() => {
  const count = scope.value === 'all' ? props.allCount : props.filteredCount
  return count === 0
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleExport = () => {
  emit('export', {
    format: format.value,
    scope: scope.value,
    includeTags: includeTags.value,
    includeUsageRecords: includeUsageRecords.value,
  })
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="导出数据"
    width="480px"
    @update:model-value="handleClose"
    class="export-dialog"
  >
    <div class="export-form">
      <div class="export-section">
        <h4 class="export-section-title">导出格式</h4>
        <div class="export-format-options">
          <div
            class="export-format-card"
            :class="{ active: format === 'json' }"
            @click="format = 'json'"
          >
            <el-icon class="export-format-icon"><Document /></el-icon>
            <div class="export-format-info">
              <div class="export-format-name">JSON格式</div>
              <div class="export-format-desc">完整数据结构，可用于备份和迁移</div>
            </div>
          </div>
          <div
            class="export-format-card"
            :class="{ active: format === 'csv' }"
            @click="format = 'csv'"
          >
            <el-icon class="export-format-icon"><Grid /></el-icon>
            <div class="export-format-info">
              <div class="export-format-name">Excel/CSV格式</div>
              <div class="export-format-desc">表格化导出，便于打印或存档</div>
            </div>
          </div>
        </div>
      </div>

      <div class="export-section">
        <h4 class="export-section-title">导出范围</h4>
        <el-radio-group v-model="scope" class="export-scope">
          <el-radio value="all" border>
            全部药品
            <span class="export-count">({{ allCount }}种)</span>
          </el-radio>
          <el-radio value="filtered" border>
            当前筛选结果
            <span class="export-count">({{ filteredCount }}种)</span>
          </el-radio>
        </el-radio-group>
      </div>

      <div class="export-section">
        <h4 class="export-section-title">附加选项</h4>
        <div class="export-options">
          <el-checkbox v-model="includeTags">包含标签数据</el-checkbox>
          <el-checkbox v-model="includeUsageRecords">包含用药记录</el-checkbox>
        </div>
      </div>

      <div v-if="disabled" class="export-warning">
        <el-alert
          title="没有可导出的数据"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :disabled="disabled"
        @click="handleExport"
      >
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.export-dialog {
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

.export-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.export-section {
  &-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 12px 0;
  }
}

.export-format-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.export-format-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary-light);
    background: var(--color-bg);
  }

  &.active {
    border-color: var(--color-primary);
    background: rgba(74, 144, 217, 0.08);
  }
}

.export-format-icon {
  font-size: 28px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.export-format-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.export-format-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.export-format-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.export-scope {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  :deep(.el-radio-button__inner),
  :deep(.el-radio__label) {
    font-size: 14px;
  }
}

.export-count {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-warning {
  margin-top: 8px;
}

@media (max-width: 600px) {
  .export-format-options {
    grid-template-columns: 1fr;
  }
}
</style>
