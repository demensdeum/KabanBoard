<template>
  <div id="app">
    <Sidebar 
      v-if="!isLoginPage"
      :boards="boards" 
      :currentBoardId="currentBoardId"
      :canAddBoard="currentUser?.isAdmin || currentUser?.canManageBoards || !currentUser"
      :canDeleteBoard="currentUser?.isAdmin || currentUser?.canManageBoards || !currentUser"
      @select-board="selectBoard"
      @add-board="addBoard"
      @delete-board="deleteBoard"
    />
    <div class="main-content" :class="{ 'no-sidebar': isLoginPage }">
      <router-view 
        :key="$route.fullPath"
        @boards-changed="fetchBoards"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Sidebar from './components/Sidebar.vue'
import { boardsApi, authApi } from './api'

export default {
  name: 'App',
  components: { Sidebar },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const boards = ref([])
    const currentUser = ref(null)
    
    const currentBoardId = computed(() => route.params.id || null)

    const fetchBoards = async () => {
      // Don't fetch if on login page or if we need auth but have no token
      if (route.name === 'login') return

      try {
        const { data: status } = await authApi.getStatus()
        if (status.authEnabled) {
          if (!localStorage.getItem('auth-token')) return
          
          const { data: me } = await authApi.me()
          currentUser.value = me
        }

        const response = await boardsApi.getAll()
        boards.value = response.data
      } catch (error) {
        console.error('Failed to fetch boards:', error)
      }
    }

    // Fetch boards when route changes (e.g. after login)
    watch(() => route.path, (newPath) => {
      if (newPath !== '/login' && boards.value.length === 0) {
        fetchBoards()
      }
    })

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

    const isLoginPage = computed(() => route.name === 'login')

    return {
      boards,
      currentUser,
      currentBoardId,
      fetchBoards,
      selectBoard,
      addBoard,
      deleteBoard,
      isLoginPage
    }
  }
}
</script>
