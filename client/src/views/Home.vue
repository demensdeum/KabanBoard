<template>
  <div class="empty-state">
    <div class="empty-state-icon">📋</div>
    <h2 class="empty-state-title">{{ $t('welcome') }}</h2>
    <p class="empty-state-text">{{ $t('welcome_text') }}</p>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
