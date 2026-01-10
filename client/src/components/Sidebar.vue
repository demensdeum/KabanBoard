<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">Kaban</div>
      <router-link class="settings-link" to="/settings" :title="$t('settings')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </router-link>
    </div>
    <div class="sidebar-content">
      <div class="sidebar-section-title">{{ $t('your_boards') }}</div>
      <ul class="board-list">
        <li 
          v-for="board in boards" 
          :key="board._id" 
          class="board-item"
          :class="{ active: board._id === currentBoardId }"
          @click="$emit('select-board', board._id)"
        >
          <span class="board-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>
            </svg>
          </span>
          <span class="board-item-name">{{ board.name }}</span>
          <button 
            class="board-item-delete" 
            @click.stop="$emit('delete-board', board._id)"
            :title="$t('delete_board')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </li>
      </ul>
      
      <button v-if="!showAddInput" class="add-board-btn" @click="showAddInput = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('add_new_board') }}
      </button>
      
      <div v-else class="form-group" style="margin-top: 8px;">
        <input 
          v-model="newBoardName"
          type="text"
          class="inline-input"
          :placeholder="$t('board_name_placeholder')"
          @keyup.enter="createBoard"
          @keyup.escape="cancelAdd"
          ref="inputRef"
        />
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="btn btn-primary" @click="createBoard" style="flex: 1;">{{ $t('create') }}</button>
          <button class="btn btn-secondary" @click="cancelAdd">{{ $t('cancel') }}</button>

</div>
      </div>
    </div>
    
    <div v-if="isAuthenticated" class="sidebar-footer">
      <button class="logout-btn" @click="handleLogout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {{ $t('logout') }}
      </button>
    </div>
  </aside>
</template>

<script>
import { ref, nextTick } from 'vue'

export default {
  name: 'Sidebar',
  props: {
    boards: { type: Array, default: () => [] },
    currentBoardId: { type: String, default: null }
  },
  emits: ['select-board', 'add-board', 'delete-board'],
  setup(props, { emit }) {
    const showAddInput = ref(false)
    const newBoardName = ref('')
    const inputRef = ref(null)

    const createBoard = () => {
      if (newBoardName.value.trim()) {
        emit('add-board', newBoardName.value.trim())
        cancelAdd()
      }
    }

    const cancelAdd = () => {
      showAddInput.value = false
      newBoardName.value = ''
    }

    const showInput = async () => {
      showAddInput.value = true
      await nextTick()
      inputRef.value?.focus()
    }

    const isAuthenticated = ref(!!localStorage.getItem('auth-token'))

    const handleLogout = () => {
      localStorage.removeItem('auth-token')
      window.location.reload()
    }

    return {
      showAddInput,
      newBoardName,
      inputRef,
      createBoard,
      cancelAdd,
      showInput,
      isAuthenticated,
      handleLogout
    }
  }
}
</script>
