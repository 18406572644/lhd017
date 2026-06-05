<script setup lang="ts">
import { computed } from 'vue'
import { Search, Refresh, Plus, Download, Collection, MoreFilled } from '@element-plus/icons-vue'
import type { MedicineCategory, ExpiryStatus, FilterOptions, MedicineTag } from '@/types/medicine'
import { CATEGORY_LIST } from '@/types/medicine'

interface Props {
  filterOptions: FilterOptions
  tags: MedicineTag[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:filterOptions', value: FilterOptions): void
  (e: 'reset'): void
  (e: 'add'): void
  (e: 'export'): void
  (e: 'manageTags'): void
}>()

const categoryOptions = [
  { value: '', label: '全部分类' },
  ...CATEGORY_LIST.map((c) => ({ value: c.value, label: c.label })),
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'normal' as ExpiryStatus, label: '正常' },
  { value: 'warning' as ExpiryStatus, label: '即将过期' },
  { value: 'expired' as ExpiryStatus, label: '已过期' },
]

const handleKeywordChange = (value: string) => {
  emit('update:filterOptions', { ...props.filterOptions, keyword: value })
}

const handleCategoryChange = (value: MedicineCategory | '') => {
  emit('update:filterOptions', { ...props.filterOptions, category: value })
}

const handleStatusChange = (value: ExpiryStatus | '') => {
  emit('update:filterOptions', { ...props.filterOptions, expiryStatus: value })
}

const handleTagChange = (value: string[]) => {
  emit('update:filterOptions', { ...props.filterOptions, tagIds: value })
}

const handleReset = () => {
  emit('reset')
}

const handleAdd = () => {
  emit('add')
}

const handleExport = () => {
  emit('export')
}

const handleManageTags = () => {
  emit('manageTags')
}

const handleCommand = (command: string) => {
  if (command === 'export') {
    handleExport()
  } else if (command === 'tags') {
    handleManageTags()
  }
}

const selectedTagNames = computed(() => {
  const names = props.filterOptions.tagIds
    .map((id) => props.tags.find((t) => t.id === id)?.name)
    .filter(Boolean) as string[]
  return names.length > 0 ? names.join('、') : '选择标签'
})
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__left">
      <div class="filter-bar__search">
        <el-input
          v-model="filterOptions.keyword"
          placeholder="搜索药品名称、症状、生产厂家..."
          class="filter-bar__input"
          clearable
          @input="handleKeywordChange"
          @clear="handleKeywordChange('')"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-select
        :model-value="filterOptions.category"
        class="filter-bar__select"
        placeholder="选择分类"
        @change="handleCategoryChange"
      >
        <el-option
          v-for="option in categoryOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-select
        :model-value="filterOptions.expiryStatus"
        class="filter-bar__select"
        placeholder="效期状态"
        @change="handleStatusChange"
      >
        <el-option
          v-for="option in statusOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-select
        :model-value="filterOptions.tagIds"
        multiple
        collapse-tags
        collapse-tags-tooltip
        class="filter-bar__select filter-bar__tag-select"
        placeholder="选择标签"
        @change="handleTagChange"
      >
        <el-option
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.name"
          :value="tag.id"
        >
          <div class="tag-option">
            <span
              class="tag-option__dot"
              :style="{ backgroundColor: tag.color }"
            />
            <span class="tag-option__name">{{ tag.name }}</span>
          </div>
        </el-option>
      </el-select>
      <el-button class="filter-bar__btn" @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>
    <div class="filter-bar__right">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button class="filter-bar__more-btn">
          <el-icon><MoreFilled /></el-icon>
          更多操作
          <el-icon class="el-icon--right"><span class="el-caret-down"></span></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="export">
              <el-icon><Download /></el-icon>
              导出数据
            </el-dropdown-item>
            <el-dropdown-item command="tags">
              <el-icon><Collection /></el-icon>
              标签管理
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="primary" class="filter-bar__add-btn" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增药品
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  flex-wrap: wrap;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;
  }

  &__search {
    flex: 1;
    min-width: 280px;
    max-width: 400px;
  }

  &__input {
    :deep(.el-input__wrapper) {
      border-radius: var(--radius-md);
      box-shadow: 0 0 0 1px var(--color-border) inset;
      transition: all var(--transition-fast);

      &:hover {
        box-shadow: 0 0 0 1px var(--color-primary-light) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2), 0 0 0 1px var(--color-primary) inset;
      }
    }
  }

  &__select {
    min-width: 140px;

    :deep(.el-input__wrapper) {
      border-radius: var(--radius-md);
      box-shadow: 0 0 0 1px var(--color-border) inset;
      transition: all var(--transition-fast);

      &:hover {
        box-shadow: 0 0 0 1px var(--color-primary-light) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2), 0 0 0 1px var(--color-primary) inset;
      }
    }
  }

  &__btn {
    border-radius: var(--radius-md);
    padding: 8px 20px;
  }

  &__add-btn {
    border-radius: var(--radius-md);
    padding: 10px 24px;
    font-weight: 500;
    background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
    transition: all var(--transition-fast);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 144, 217, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__more-btn {
    border-radius: var(--radius-md);
    padding: 10px 20px;
    font-weight: 500;
    border: 1px solid var(--color-border);
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: rgba(74, 144, 217, 0.05);
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 8px;

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    font-size: 14px;
  }
}

.filter-bar__tag-select {
  :deep(.el-select__tags) {
    flex-wrap: nowrap;
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;

    &__left {
      flex-direction: column;
      align-items: stretch;
    }

    &__search {
      max-width: none;
    }

    &__select {
      min-width: auto;
    }
  }
}
</style>
