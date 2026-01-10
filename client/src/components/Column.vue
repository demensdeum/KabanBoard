<template>
  <div class="column">
    <div class="column-header">
      <div class="column-title">
        <span v-if="!editingTitle" @dblclick="startEditTitle">{{ column.title }}</span>
        <input 
          v-else
          v-model="titleInput"
          class="inline-input"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          @keyup.escape="cancelEditTitle"
          ref="titleInputRef"
        />
        <span class="column-count">{{ column.cards?.length || 0 }}</span>
      </div>
      <div class="column-actions">
        <button class="column-action-btn danger" @click="$emit('delete-column', column._id)" title="Delete column">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div 
      class="column-cards"
      :class="{ 'drag-over': dragOver }"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <Card 
        v-for="card in column.cards" 
        :key="card._id"
        :card="card"
        @edit="$emit('update-card', card)"
        @delete="$emit('delete-card', card._id, column._id)"
        @dragstart="onCardDragStart(card, $event)"
      />
      
      <button class="add-card-btn" @click="$emit('add-card', column._id)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Card
      </button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import Card from './Card.vue'

export default {
  name: 'Column',
  components: { Card },
  props: {
    column: { type: Object, required: true }
  },
  emits: ['add-card', 'update-card', 'delete-card', 'delete-column', 'update-column', 'move-card'],
  setup(props, { emit }) {
    const editingTitle = ref(false)
    const titleInput = ref('')
    const titleInputRef = ref(null)
    const dragOver = ref(false)

    const startEditTitle = async () => {
      titleInput.value = props.column.title
      editingTitle.value = true
      await nextTick()
      titleInputRef.value?.focus()
      titleInputRef.value?.select()
    }

    const saveTitle = () => {
      if (titleInput.value.trim() && titleInput.value !== props.column.title) {
        emit('update-column', props.column._id, titleInput.value.trim())
        props.column.title = titleInput.value.trim()
      }
      editingTitle.value = false
    }

    const cancelEditTitle = () => {
      editingTitle.value = false
    }

    const onCardDragStart = (card, event) => {
      event.dataTransfer.setData('cardId', card._id)
      event.dataTransfer.setData('fromColumnId', props.column._id)
      event.dataTransfer.effectAllowed = 'move'
    }

    const onDragOver = (event) => {
      dragOver.value = true
      event.dataTransfer.dropEffect = 'move'
    }

    const onDragLeave = () => {
      dragOver.value = false
    }

    const onDrop = (event) => {
      dragOver.value = false
      const cardId = event.dataTransfer.getData('cardId')
      const fromColumnId = event.dataTransfer.getData('fromColumnId')
      
      if (cardId) {
        const newOrder = props.column.cards?.length || 0
        emit('move-card', cardId, fromColumnId, props.column._id, newOrder)
      }
    }

    return {
      editingTitle,
      titleInput,
      titleInputRef,
      dragOver,
      startEditTitle,
      saveTitle,
      cancelEditTitle,
      onCardDragStart,
      onDragOver,
      onDragLeave,
      onDrop
    }
  }
}
</script>
