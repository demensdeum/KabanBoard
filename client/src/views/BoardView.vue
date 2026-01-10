<template>
  <div v-if="loading" class="loading">
    <div class="spinner"></div>
  </div>
  <template v-else-if="board">
    <div class="board-header">
      <input 
        v-model="board.name" 
        class="board-title-input"
        @blur="updateBoardName"
        @keyup.enter="$event.target.blur()"
      />
    </div>
    <div class="board-container">
      <Column 
        v-for="column in board.columns" 
        :key="column._id"
        :column="column"
        @add-card="addCard"
        @update-card="updateCard"
        @delete-card="deleteCard"
        @delete-column="deleteColumn"
        @update-column="updateColumn"
        @move-card="moveCard"
      />
      
      <div class="add-column">
        <button v-if="!showAddColumn" class="add-column-btn" @click="showAddColumn = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Column
        </button>
        <div v-else class="column" style="padding: 16px;">
          <input 
            v-model="newColumnTitle"
            class="inline-input"
            placeholder="Column title..."
            @keyup.enter="addColumn"
            @keyup.escape="cancelAddColumn"
            ref="columnInputRef"
          />
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button class="btn btn-primary" @click="addColumn" style="flex: 1;">Add</button>
            <button class="btn btn-secondary" @click="cancelAddColumn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <!-- Card Modal -->
  <Teleport to="body">
    <div v-if="showCardModal" class="modal-overlay" @click.self="closeCardModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingCard ? 'Edit Card' : 'Add Card' }}</h3>
          <button class="modal-close" @click="closeCardModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="cardForm.title" class="form-input" placeholder="Enter card title..." />
        </div>
        
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="cardForm.description" class="form-input form-textarea" placeholder="Enter description..."></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-picker">
            <div 
              v-for="color in colors" 
              :key="color"
              class="color-option"
              :class="{ selected: cardForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="cardForm.color = color"
            ></div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeCardModal">Cancel</button>
          <button class="btn btn-primary" @click="saveCard">{{ editingCard ? 'Update' : 'Add' }} Card</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import Column from '../components/Column.vue'
import { boardsApi, columnsApi, cardsApi } from '../api'

export default {
  name: 'BoardView',
  components: { Column },
  setup() {
    const route = useRoute()
    const board = ref(null)
    const loading = ref(true)
    
    // Add column
    const showAddColumn = ref(false)
    const newColumnTitle = ref('')
    const columnInputRef = ref(null)
    
    // Card modal
    const showCardModal = ref(false)
    const editingCard = ref(null)
    const targetColumnId = ref(null)
    const cardForm = ref({
      title: '',
      description: '',
      color: '#6366f1'
    })
    
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
      '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
    ]

    const fetchBoard = async () => {
      loading.value = true
      try {
        const response = await boardsApi.getOne(route.params.id)
        board.value = response.data
      } catch (error) {
        console.error('Failed to fetch board:', error)
      } finally {
        loading.value = false
      }
    }

    const updateBoardName = async () => {
      if (!board.value.name.trim()) return
      try {
        await boardsApi.update(board.value._id, board.value.name)
      } catch (error) {
        console.error('Failed to update board:', error)
      }
    }

    // Column functions
    const addColumn = async () => {
      if (!newColumnTitle.value.trim()) return
      try {
        const response = await columnsApi.create(newColumnTitle.value.trim(), board.value._id)
        board.value.columns.push(response.data)
        cancelAddColumn()
      } catch (error) {
        console.error('Failed to add column:', error)
      }
    }

    const cancelAddColumn = () => {
      showAddColumn.value = false
      newColumnTitle.value = ''
    }

    const updateColumn = async (columnId, title) => {
      try {
        await columnsApi.update(columnId, title)
      } catch (error) {
        console.error('Failed to update column:', error)
      }
    }

    const deleteColumn = async (columnId) => {
      if (!confirm('Delete this column and all its cards?')) return
      try {
        await columnsApi.delete(columnId)
        board.value.columns = board.value.columns.filter(c => c._id !== columnId)
      } catch (error) {
        console.error('Failed to delete column:', error)
      }
    }

    // Card functions
    const addCard = (columnId) => {
      targetColumnId.value = columnId
      editingCard.value = null
      cardForm.value = { title: '', description: '', color: '#6366f1' }
      showCardModal.value = true
    }

    const updateCard = (card) => {
      editingCard.value = card
      targetColumnId.value = card.columnId
      cardForm.value = {
        title: card.title,
        description: card.description || '',
        color: card.color || '#6366f1'
      }
      showCardModal.value = true
    }

    const saveCard = async () => {
      if (!cardForm.value.title.trim()) return
      
      try {
        if (editingCard.value) {
          const response = await cardsApi.update(editingCard.value._id, cardForm.value)
          const column = board.value.columns.find(c => c._id === targetColumnId.value)
          const cardIndex = column.cards.findIndex(c => c._id === editingCard.value._id)
          if (cardIndex !== -1) {
            column.cards[cardIndex] = response.data
          }
        } else {
          const response = await cardsApi.create({
            ...cardForm.value,
            columnId: targetColumnId.value
          })
          const column = board.value.columns.find(c => c._id === targetColumnId.value)
          column.cards.push(response.data)
        }
        closeCardModal()
      } catch (error) {
        console.error('Failed to save card:', error)
      }
    }

    const deleteCard = async (cardId, columnId) => {
      try {
        await cardsApi.delete(cardId)
        const column = board.value.columns.find(c => c._id === columnId)
        column.cards = column.cards.filter(c => c._id !== cardId)
      } catch (error) {
        console.error('Failed to delete card:', error)
      }
    }

    const moveCard = async (cardId, fromColumnId, toColumnId, newOrder) => {
      try {
        await cardsApi.move(cardId, toColumnId, newOrder)
        
        // Move card in local state
        const fromColumn = board.value.columns.find(c => c._id === fromColumnId)
        const toColumn = board.value.columns.find(c => c._id === toColumnId)
        
        const cardIndex = fromColumn.cards.findIndex(c => c._id === cardId)
        const [card] = fromColumn.cards.splice(cardIndex, 1)
        card.columnId = toColumnId
        card.order = newOrder
        toColumn.cards.splice(newOrder, 0, card)
      } catch (error) {
        console.error('Failed to move card:', error)
        fetchBoard() // Refresh on error
      }
    }

    const closeCardModal = () => {
      showCardModal.value = false
      editingCard.value = null
      targetColumnId.value = null
    }

    watch(() => route.params.id, fetchBoard, { immediate: true })

    watch(showAddColumn, async (val) => {
      if (val) {
        await nextTick()
        columnInputRef.value?.focus()
      }
    })

    return {
      board,
      loading,
      showAddColumn,
      newColumnTitle,
      columnInputRef,
      showCardModal,
      editingCard,
      cardForm,
      colors,
      updateBoardName,
      addColumn,
      cancelAddColumn,
      updateColumn,
      deleteColumn,
      addCard,
      updateCard,
      saveCard,
      deleteCard,
      moveCard,
      closeCardModal
    }
  }
}
</script>
