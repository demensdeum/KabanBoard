<template>
  <div id="app">
    <Sidebar 
      :boards="boards" 
      :currentBoardId="currentBoardId"
      @select-board="selectBoard"
      @add-board="addBoard"
      @delete-board="deleteBoard"
    />
    <div class="main-content">
      <router-view 
        :key="$route.fullPath"
        @boards-changed="fetchBoards"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Sidebar from './components/Sidebar.vue'
import { boardsApi } from './api'

export default {
  name: 'App',
  components: { Sidebar },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const boards = ref([])
    
    const currentBoardId = computed(() => route.params.id || null)

    const fetchBoards = async () => {
      try {
        const response = await boardsApi.getAll()
        boards.value = response.data
      } catch (error) {
        console.error('Failed to fetch boards:', error)
      }
    }

    const selectBoard = (boardId) => {
      router.push(`/board/${boardId}`)
    }

    const addBoard = async (name) => {
      try {
        const defaultColumns = [
          t('column_new'),
          t('column_in_progress'),
          t('column_done')
        ]
        const response = await boardsApi.create(name, defaultColumns)
        boards.value.unshift(response.data)
        router.push(`/board/${response.data._id}`)
      } catch (error) {
        console.error('Failed to create board:', error)
      }
    }

    const deleteBoard = async (boardId) => {
      if (!confirm(t('delete_board_confirm'))) return
      try {
        await boardsApi.delete(boardId)
        boards.value = boards.value.filter(b => b._id !== boardId)
        if (currentBoardId.value === boardId) {
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to delete board:', error)
      }
    }

    onMounted(fetchBoards)

    return {
      boards,
      currentBoardId,
      fetchBoards,
      selectBoard,
      addBoard,
      deleteBoard
    }
  }
}
</script>
