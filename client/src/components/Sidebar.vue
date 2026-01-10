<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">Kaban</div>
    </div>
    <div class="sidebar-content">
      <div class="sidebar-section-title">Your Boards</div>
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
            title="Delete board"
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
        Add New Board
      </button>
      
      <div v-else class="form-group" style="margin-top: 8px;">
        <input 
          v-model="newBoardName"
          type="text"
          class="inline-input"
          placeholder="Board name..."
          @keyup.enter="createBoard"
          @keyup.escape="cancelAdd"
          ref="inputRef"
        />
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="btn btn-primary" @click="createBoard" style="flex: 1;">Create</button>
          <button class="btn btn-secondary" @click="cancelAdd">Cancel</button>
        </div>
      </div>
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

    return {
      showAddInput,
      newBoardName,
      inputRef,
      createBoard,
      cancelAdd,
      showInput
    }
  }
}
</script>
