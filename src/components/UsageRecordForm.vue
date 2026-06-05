<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Medicine } from '@/types/medicine'
import { EFFECT_OPTIONS } from '@/types/medicine'

interface Props {
  visible: boolean
  medicine: Medicine | null
  defaultSymptoms?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultSymptoms: '',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: {
    symptoms: string
    dosage: string
    effect: 'excellent' | 'good' | 'average' | 'poor'
    sideEffects: string
    notes: string
  }): void
}>()

const formRef = ref()
const formData = ref({
  symptoms: '',
  dosage: '',
  effect: 'good' as 'excellent' | 'good' | 'average' | 'poor',
  sideEffects: '',
  notes: '',
})

const rules = {
  symptoms: [
    { required: true, message: '请输入症状', trigger: 'blur' },
  ],
  dosage: [
    { required: true, message: '请输入用法用量', trigger: 'blur' },
  ],
  effect: [
    { required: true, message: '请选择用药效果', trigger: 'change' },
  ],
}

watch(() => props.visible, (val) => {
  if (val && props.medicine) {
    formData.value = {
      symptoms: props.defaultSymptoms || '',
      dosage: props.medicine.usage || '',
      effect: 'good',
      sideEffects: '',
      notes: '',
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    emit('save', { ...formData.value })
    handleClose()
  } catch (error) {
    ElMessage.warning('请完善必填信息')
  }
}

const effectOptions = computed(() => EFFECT_OPTIONS)
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="记录用药效果"
    width="520px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div v-if="medicine" class="usage-record-form">
      <div class="usage-record-form__medicine-info">
        <div class="usage-record-form__medicine-name">
          {{ medicine.name }}
        </div>
        <div class="usage-record-form__medicine-spec">
          {{ medicine.specification }}
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="90px"
        class="usage-record-form__form"
      >
        <el-form-item label="症状" prop="symptoms">
          <el-input
            v-model="formData.symptoms"
            type="textarea"
            :rows="2"
            placeholder="请输入您的症状，如：头痛、发热"
          />
        </el-form-item>

        <el-form-item label="用法用量" prop="dosage">
          <el-input
            v-model="formData.dosage"
            type="textarea"
            :rows="2"
            placeholder="请输入实际使用的剂量，如：一次1粒，一日2次"
          />
        </el-form-item>

        <el-form-item label="用药效果" prop="effect">
          <el-radio-group v-model="formData.effect" class="usage-record-form__effect-group">
            <el-radio-button
              v-for="option in effectOptions"
              :key="option.value"
              :value="option.value"
              class="usage-record-form__effect-btn"
            >
              <span
                class="usage-record-form__effect-label"
                :style="{ color: option.color }"
              >
                {{ option.label }}
              </span>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="副作用">
          <el-input
            v-model="formData.sideEffects"
            type="textarea"
            :rows="2"
            placeholder="如有副作用请描述，没有则留空"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="其他需要记录的信息，如饮食注意、与其他药物联用等"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        保存记录
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.usage-record-form {
  &__medicine-info {
    padding: 16px 20px;
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    border-radius: var(--radius-md);
    margin-bottom: 20px;
  }

  &__medicine-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-primary-dark);
    margin-bottom: 4px;
  }

  &__medicine-spec {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__form {
    padding: 0 4px;
  }

  &__effect-group {
    width: 100%;
    display: flex;
    gap: 8px;
  }

  &__effect-btn {
    flex: 1;
    text-align: center;

    :deep(.el-radio-button__inner) {
      width: 100%;
      padding: 10px 8px;
      font-size: 13px;
    }
  }

  &__effect-label {
    font-weight: 500;
  }
}
</style>
