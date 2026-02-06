<script setup>
import { onBeforeRouteLeave } from 'vue-router'

const props = defineProps({
  hasUnsavedChanges: {
    type: Boolean,
    required: true
  },
  onConfirmExit: {
    type: Function,
    required: true
  },
  onCancelExit: {
    type: Function,
    default: () => {}
  },
  message: {
    type: String,
    default: 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?'
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (props.hasUnsavedChanges) {
    if (confirm(props.message)) {
      // Пользователь подтвердил выход - вызываем callback
      props.onConfirmExit()
      next()
    } else {
      // Пользователь отменил выход
      props.onCancelExit()
      next(false)
    }
  } else {
    // Нет изменений - разрешаем переход
    next()
  }
})
</script>