<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Scan, Plus, Delete, Link, Unlink, Loading } from '@element-plus/icons-vue'
import type {
  Prescription,
  PrescriptionCategory,
  PrescriptionMedicine,
} from '@/types/prescription'
import { PRESCRIPTION_CATEGORY_LABELS } from '@/types/prescription'
import type { Medicine } from '@/types/medicine'
import { getTodayString } from '@/utils/date'
import { recognizePrescription } from '@/utils/ocr'
import ImageUpload from './ImageUpload.vue'

interface Props {
  visible: boolean
  prescription?: Prescription | null
  medicineList: Medicine[]
}

const props = withDefaults(defineProps<Props>(), {
  prescription: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'update', id: string, data: Partial<Prescription>): void
}>()

const formRef = ref<FormInstance>()
const activeTab = ref('basic')
const isRecognizing = ref(false)

const isEdit = computed(() => !!props.prescription)
const dialogTitle = computed(() => (isEdit.value ? '编辑处方' : '新增处方'))

const emptyMedicine = (): PrescriptionMedicine => ({
  medicineId: '',
  name: '',
  specification: '',
  dosage: '',
  frequency: '',
  quantity: 1,
  days: 1,
  notes: '',
})

const formData = ref({
  category: 'outpatient' as PrescriptionCategory,
  code: '',
  image: '',
  medicines: [emptyMedicine()] as PrescriptionMedicine[],
  doctor: {
    name: '',
    department: '',
    title: '',
    phone: '',
  },
  hospital: {
    name: '',
    address: '',
    phone: '',
    level: '',
  },
  issueDate: getTodayString(),
  expiryDate: '',
  patientName: '',
  patientAge: undefined as number | undefined,
  patientGender: undefined as 'male' | 'female' | undefined,
  diagnosis: '',
  notes: '',
})

const rules: FormRules = {
  category: [{ required: true, message: '请选择处方分类', trigger: 'change' }],
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  diagnosis: [{ required: true, message: '请输入诊断结果', trigger: 'blur' }],
  issueDate: [{ required: true, message: '请选择开具日期', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择有效期至', trigger: 'change' }],
  'doctor.name': [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  'doctor.department': [{ required: true, message: '请输入科室', trigger: 'blur' }],
  'hospital.name': [{ required: true, message: '请输入医院名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传处方图片', trigger: 'change' }],
}

const categoryOptions = Object.entries(PRESCRIPTION_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as PrescriptionCategory,
  label,
}))

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

const frequencyOptions = [
  { value: '一日1次', label: '一日1次' },
  { value: '一日2次', label: '一日2次' },
  { value: '一日3次', label: '一日3次' },
  { value: '一日4次', label: '一日4次' },
  { value: '隔日1次', label: '隔日1次' },
  { value: '按需服用', label: '按需服用' },
]

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.prescription) {
      formData.value = {
        category: props.prescription.category,
        code: props.prescription.code || '',
        image: props.prescription.image,
        medicines: props.prescription.medicines.length > 0
          ? [...props.prescription.medicines]
          : [emptyMedicine()],
        doctor: { ...props.prescription.doctor },
        hospital: { ...props.prescription.hospital },
        issueDate: props.prescription.issueDate,
        expiryDate: props.prescription.expiryDate,
        patientName: props.prescription.patientName,
        patientAge: props.prescription.patientAge,
        patientGender: props.prescription.patientGender,
        diagnosis: props.prescription.diagnosis,
        notes: props.prescription.notes || '',
      }
    } else if (newVal) {
      resetForm()
    }
  }
)

watch(
  () => formData.value.image,
  async (newImage) => {
    if (newImage && !isEdit.value && !isRecognizing.value) {
      await handleOCRRecognize()
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
}

const resetForm = () => {
  formData.value = {
    category: 'outpatient',
    code: '',
    image: '',
    medicines: [emptyMedicine()],
    doctor: {
      name: '',
      department: '',
      title: '',
      phone: '',
    },
    hospital: {
      name: '',
      address: '',
      phone: '',
      level: '',
    },
    issueDate: getTodayString(),
    expiryDate: '',
    patientName: '',
    patientAge: undefined,
    patientGender: undefined,
    diagnosis: '',
    notes: '',
  }
  formRef.value?.resetFields()
}

const handleOCRRecognize = async () => {
  if (!formData.value.image) {
    ElMessage.warning('请先上传处方图片')
    return
  }

  isRecognizing.value = true
  try {
    const result = await recognizePrescription(formData.value.image)
    if (result.success && result.data) {
      const data = result.data

      if (data.patientName) formData.value.patientName = data.patientName
      if (data.patientAge) formData.value.patientAge = data.patientAge
      if (data.patientGender) formData.value.patientGender = data.patientGender
      if (data.diagnosis) formData.value.diagnosis = data.diagnosis
      if (data.code) formData.value.code = data.code
      if (data.doctorName) formData.value.doctor.name = data.doctorName
      if (data.department) formData.value.doctor.department = data.department
      if (data.hospitalName) formData.value.hospital.name = data.hospitalName
      if (data.issueDate) formData.value.issueDate = data.issueDate
      if (data.expiryDate) formData.value.expiryDate = data.expiryDate
      if (data.medicines && data.medicines.length > 0) {
        formData.value.medicines = data.medicines.map((m) => ({
          ...m,
          medicineId: '',
          notes: '',
        }))
      }

      ElMessage.success(result.message || 'OCR识别成功')
    } else {
      ElMessage.warning(result.message || 'OCR识别失败，请手动输入')
    }
  } catch (error) {
    console.error('OCR识别失败:', error)
    ElMessage.error('OCR识别过程中发生错误')
  } finally {
    isRecognizing.value = false
  }
}

const addMedicine = () => {
  formData.value.medicines.push(emptyMedicine())
}

const removeMedicine = (index: number) => {
  if (formData.value.medicines.length <= 1) {
    ElMessage.warning('至少需要一种药品')
    return
  }
  ElMessageBox.confirm('确定要删除该药品吗？', '确认删除', {
    type: 'warning',
  })
    .then(() => {
      formData.value.medicines.splice(index, 1)
    })
    .catch(() => {})
}

const linkMedicine = (index: number, medicineId: string) => {
  if (medicineId) {
    const medicine = props.medicineList.find((m) => m.id === medicineId)
    if (medicine) {
      formData.value.medicines[index].medicineId = medicineId
      formData.value.medicines[index].name = medicine.name
      formData.value.medicines[index].specification = medicine.specification
      ElMessage.success(`已关联药品：${medicine.name}`)
    }
  } else {
    formData.value.medicines[index].medicineId = ''
  }
}

const unlinkMedicine = (index: number) => {
  formData.value.medicines[index].medicineId = ''
  ElMessage.success('已取消关联')
}

const getMedicineOptions = () => {
  return props.medicineList.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.specification})`,
  }))
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const validMedicines = formData.value.medicines.filter((m) => m.name.trim())
  if (validMedicines.length === 0) {
    ElMessage.warning('请至少添加一种药品')
    return
  }

  await formRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        ...formData.value,
        medicines: validMedicines,
      }

      if (isEdit.value && props.prescription) {
        emit('update', props.prescription.id, submitData)
        ElMessage.success('处方信息更新成功')
      } else {
        emit('save', submitData)
        ElMessage.success('处方添加成功')
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
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    class="prescription-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="prescription-form"
    >
      <el-tabs v-model="activeTab" class="prescription-form__tabs">
        <el-tab-pane label="处方图片" name="image">
          <el-form-item label="处方图片" prop="image">
            <ImageUpload v-model="formData.image" :max-size-m-b="3" />
          </el-form-item>
          <el-form-item v-if="formData.image">
            <el-button type="primary" :icon="Scan" :loading="isRecognizing" @click="handleOCRRecognize">
              {{ isRecognizing ? '识别中...' : 'OCR识别处方信息' }}
            </el-button>
            <span class="prescription-form__ocr-tip">
              上传图片后将自动进行OCR识别，也可以点击按钮重新识别
            </span>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="基本信息" name="basic">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="处方分类" prop="category">
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
            <el-col :span="12">
              <el-form-item label="处方编号">
                <el-input v-model="formData.code" placeholder="请输入处方编号（选填）" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">患者信息</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="患者姓名" prop="patientName">
                <el-input v-model="formData.patientName" placeholder="请输入患者姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="年龄">
                <el-input-number
                  v-model="formData.patientAge"
                  :min="1"
                  :max="150"
                  placeholder="年龄"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="性别">
                <el-select v-model="formData.patientGender" placeholder="请选择性别" style="width: 100%">
                  <el-option
                    v-for="option in genderOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="诊断结果" prop="diagnosis">
            <el-input
              v-model="formData.diagnosis"
              placeholder="请输入诊断结果，如：急性上呼吸道感染"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开具日期" prop="issueDate">
                <el-date-picker
                  v-model="formData.issueDate"
                  type="date"
                  placeholder="选择开具日期"
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
        </el-tab-pane>

        <el-tab-pane label="医生医院" name="doctor">
          <el-divider content-position="left">医生信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="医生姓名" prop="doctor.name">
                <el-input v-model="formData.doctor.name" placeholder="请输入医生姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="科室" prop="doctor.department">
                <el-input v-model="formData.doctor.department" placeholder="如：内科、外科" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="职称">
                <el-input v-model="formData.doctor.title" placeholder="如：主任医师（选填）" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="formData.doctor.phone" placeholder="医生联系电话（选填）" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">医院信息</el-divider>
          <el-form-item label="医院名称" prop="hospital.name">
            <el-input v-model="formData.hospital.name" placeholder="请输入医院名称" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="医院等级">
                <el-input v-model="formData.hospital.level" placeholder="如：三级甲等（选填）" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="formData.hospital.phone" placeholder="医院联系电话（选填）" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="医院地址">
            <el-input v-model="formData.hospital.address" placeholder="医院地址（选填）" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="药品列表" name="medicines">
          <div class="prescription-form__medicines-header">
            <span class="prescription-form__medicines-title">处方药品</span>
            <el-button type="primary" :icon="Plus" @click="addMedicine">
              添加药品
            </el-button>
          </div>

          <div
            v-for="(medicine, index) in formData.medicines"
            :key="index"
            class="prescription-form__medicine-item"
          >
            <div class="prescription-form__medicine-header">
              <span class="prescription-form__medicine-number">药品 {{ index + 1 }}</span>
              <div class="prescription-form__medicine-actions">
                <el-popover
                  placement="bottom"
                  :width="300"
                  trigger="click"
                  v-if="!medicine.medicineId"
                >
                  <template #reference>
                    <el-button size="small" :icon="Link">
                      关联药品库
                    </el-button>
                  </template>
                  <div class="prescription-form__link-popover">
                    <p class="prescription-form__link-tip">选择要关联的药品：</p>
                    <el-select
                      v-model="formData.medicines[index].medicineId"
                      placeholder="搜索并选择药品"
                      filterable
                      style="width: 100%"
                      @change="(val: string) => linkMedicine(index, val)"
                    >
                      <el-option
                        v-for="opt in getMedicineOptions()"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </div>
                </el-popover>
                <el-button
                  v-else
                  size="small"
                  type="success"
                  :icon="Unlink"
                  @click="unlinkMedicine(index)"
                >
                  已关联
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="removeMedicine(index)"
                />
              </div>
            </div>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="药品名称" :prop="`medicines.${index}.name`">
                  <el-input v-model="medicine.name" placeholder="药品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="规格" :prop="`medicines.${index}.specification`">
                  <el-input v-model="medicine.specification" placeholder="如：0.25g*24粒" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="用量" :prop="`medicines.${index}.dosage`">
                  <el-input v-model="medicine.dosage" placeholder="如：一次0.5g" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="频次" :prop="`medicines.${index}.frequency`">
                  <el-select v-model="medicine.frequency" placeholder="选择频次" style="width: 100%">
                    <el-option
                      v-for="opt in frequencyOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="数量" :prop="`medicines.${index}.quantity`">
                  <el-input-number
                    v-model="medicine.quantity"
                    :min="1"
                    :max="999"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="天数" :prop="`medicines.${index}.days`">
                  <el-input-number
                    v-model="medicine.days"
                    :min="1"
                    :max="365"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="备注">
              <el-input v-model="medicine.notes" placeholder="用药备注，如：饭后服用" />
            </el-form-item>
          </div>
        </el-tab-pane>

        <el-tab-pane label="其他备注" name="notes">
          <el-form-item label="医嘱备注">
            <el-input
              v-model="formData.notes"
              type="textarea"
              :rows="6"
              placeholder="请输入医嘱或其他备注信息，如：饮食禁忌、复诊时间等"
            />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '添加处方' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.prescription-form-dialog {
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

.prescription-form {
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

  &__ocr-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--color-text-light);
  }

  &__medicines-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__medicines-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__medicine-item {
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    background: var(--color-bg);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__medicine-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-light);
  }

  &__medicine-number {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-primary);
  }

  &__medicine-actions {
    display: flex;
    gap: 8px;
  }

  &__link-popover {
    padding: 8px 0;
  }

  &__link-tip {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}
</style>
