<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Medicine, MedicineCategory } from '@/types/medicine'
import { CATEGORY_LIST } from '@/types/medicine'
import { getTodayString } from '@/utils/date'
import ImageUpload from './ImageUpload.vue'

interface Props {
  visible: boolean
  medicine?: Medicine | null
}

const props = withDefaults(defineProps<Props>(), {
  medicine: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'update', id: string, data: Partial<Medicine>): void
}>()

const formRef = ref<FormInstance>()
const activeTab = ref('basic')

const isEdit = computed(() => !!props.medicine)
const dialogTitle = computed(() => (isEdit.value ? '编辑药品' : '新增药品'))

const formData = ref({
  name: '',
  category: 'other' as MedicineCategory,
  specification: '',
  manufacturer: '',
  productionDate: getTodayString(),
  expiryDate: '',
  quantity: 1,
  storageLocation: '',
  symptoms: '',
  usage: '',
  notes: '',
  image: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择药品分类', trigger: 'change' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  expiryDate: [{ required: true, message: '请选择有效期至', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量不能小于1', trigger: 'blur' },
  ],
  storageLocation: [{ required: true, message: '请输入存放位置', trigger: 'blur' }],
}

const categoryOptions = CATEGORY_LIST.map((c) => ({
  value: c.value,
  label: c.label,
}))

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.medicine) {
      formData.value = {
        name: props.medicine.name,
        category: props.medicine.category,
        specification: props.medicine.specification,
        manufacturer: props.medicine.manufacturer,
        productionDate: props.medicine.productionDate,
        expiryDate: props.medicine.expiryDate,
        quantity: props.medicine.quantity,
        storageLocation: props.medicine.storageLocation,
        symptoms: props.medicine.symptoms,
        usage: props.medicine.usage,
        notes: props.medicine.notes,
        image: props.medicine.image || '',
      }
    } else if (newVal) {
      resetForm()
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
}

const resetForm = () => {
  formData.value = {
    name: '',
    category: 'other',
    specification: '',
    manufacturer: '',
    productionDate: getTodayString(),
    expiryDate: '',
    quantity: 1,
    storageLocation: '',
    symptoms: '',
    usage: '',
    notes: '',
    image: '',
  }
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value && props.medicine) {
        emit('update', props.medicine.id, { ...formData.value })
        ElMessage.success('药品信息更新成功')
      } else {
        emit('save', { ...formData.value })
        ElMessage.success('药品添加成功')
      }
      handleClose()
    }
  })
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="680px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    class="medicine-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="medicine-form"
    >
      <el-tabs v-model="activeTab" class="medicine-form__tabs">
        <el-tab-pane label="基本信息" name="basic">
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form-item label="药品名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入药品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="药品分类" prop="category">
                <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
                  <el-option
                    v-for="option in categoryOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="规格" prop="specification">
                <el-input v-model="formData.specification" placeholder="如：12片/盒、0.3g*20粒" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产厂家" prop="manufacturer">
                <el-input v-model="formData.manufacturer" placeholder="请输入生产厂家" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="生产日期" prop="productionDate">
                <el-date-picker
                  v-model="formData.productionDate"
                  type="date"
                  placeholder="选择生产日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="有效期至" prop="expiryDate">
                <el-date-picker
                  v-model="formData.expiryDate"
                  type="date"
                  placeholder="选择有效期至"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="数量" prop="quantity">
                <el-input-number
                  v-model="formData.quantity"
                  :min="1"
                  :max="999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="存放位置" prop="storageLocation">
                <el-input v-model="formData.storageLocation" placeholder="如：客厅药箱第一层" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="用药备注" name="notes">
          <el-form-item label="适用症状">
            <el-input
              v-model="formData.symptoms"
              type="textarea"
              :rows="3"
              placeholder="请输入适用症状，如：感冒引起的发热、头痛"
            />
          </el-form-item>

          <el-form-item label="用法用量">
            <el-input
              v-model="formData.usage"
              type="textarea"
              :rows="3"
              placeholder="请输入用法用量，如：口服，一次1片，一日2次"
            />
          </el-form-item>

          <el-form-item label="注意事项">
            <el-input
              v-model="formData.notes"
              type="textarea"
              :rows="4"
              placeholder="请输入注意事项，如：孕妇慎用、服药期间禁止饮酒等"
            />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="药品图片" name="image">
          <el-form-item label="药品图片">
            <ImageUpload v-model="formData.image" :max-size-m-b="2" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '添加药品' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.medicine-form-dialog {
  :deep(.el-dialog__title) {
    font-size: 18px;
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

.medicine-form {
  &__tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }

    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--color-text-primary);
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor) {
    border-radius: var(--radius-md);
  }
}
</style>
