<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import { ref } from 'vue'

interface Props {
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false,
})

const showDetail = ref(false)
</script>

<template>
  <div class="disclaimer-banner" :class="{ 'disclaimer-banner--compact': compact }">
    <div class="disclaimer-banner__icon">
      <el-icon :size="20"><Warning /></el-icon>
    </div>
    <div class="disclaimer-banner__content">
      <div class="disclaimer-banner__title">
        仅供参考，严重情况请及时就医
      </div>
      <div v-if="!compact" class="disclaimer-banner__text">
        本系统提供的用药建议仅作为参考，不能替代专业医疗诊断。
        如症状严重或持续不缓解，请立即前往医院就诊。
      </div>
      <button
        v-if="!compact"
        class="disclaimer-banner__link"
        @click="showDetail = true"
      >
        查看完整免责声明
      </button>
    </div>
    <el-dialog
      v-model="showDetail"
      title="免责声明"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="disclaimer-banner__detail">
        <div class="disclaimer-banner__detail-title">
          <el-icon :size="24"><Warning /></el-icon>
          重要提示
        </div>
        <div class="disclaimer-banner__detail-content">
          <p>
            本系统提供的用药建议仅供参考，不能替代专业医疗诊断和治疗。
          </p>
          <p class="disclaimer-banner__detail-warning">
            如有以下情况，请立即就医：
          </p>
          <ul>
            <li>症状严重或持续不缓解</li>
            <li>伴有高热、呼吸困难、剧烈疼痛等严重症状</li>
            <li>慢性病患者、孕妇、哺乳期妇女、儿童、老年人</li>
            <li>对药物成分过敏或有药物过敏史</li>
            <li>正在服用其他药物，可能存在药物相互作用</li>
          </ul>
          <p>
            请仔细阅读药品说明书，按说明书使用或遵医嘱用药。
          </p>
          <p class="disclaimer-banner__detail-footer">
            严重情况请及时就医，以免延误病情。
          </p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showDetail = false">
          我已了解
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.disclaimer-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  border-radius: var(--radius-lg);
  border: 1px solid #FFE082;

  &--compact {
    padding: 12px 16px;

    .disclaimer-banner__title {
      font-size: 13px;
    }
  }

  &__icon {
    color: #FF9800;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #E65100;
    margin: 0 0 4px 0;
  }

  &__text {
    font-size: 13px;
    color: #FF6F00;
    line-height: 1.6;
    margin: 0 0 8px 0;
  }

  &__link {
    background: none;
    border: none;
    color: #F57C00;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;

    &:hover {
      color: #E65100;
    }
  }

  &__detail {
    &-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #E65100;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-light);
    }

    &-content {
      font-size: 14px;
      color: var(--color-text-primary);
      line-height: 1.8;

      p {
        margin: 0 0 12px 0;
      }

      ul {
        margin: 0 0 12px 0;
        padding-left: 20px;

        li {
          margin-bottom: 6px;
        }
      }
    }

    &-warning {
      font-weight: 600;
      color: #D32F2F;
    }

    &-footer {
      font-weight: 600;
      color: #D32F2F;
      text-align: center;
      padding-top: 12px;
      border-top: 1px dashed var(--color-border);
      margin-top: 12px;
    }
  }
}
</style>
