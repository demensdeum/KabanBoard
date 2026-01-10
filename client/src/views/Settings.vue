<template>
  <div class="settings-container">
    <h2 class="settings-title">{{ $t('settings') }}</h2>
    
    <div class="settings-card">
      <div class="setting-item">
        <div class="setting-header">
          <div class="setting-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <label class="setting-label">{{ $t('language') }}</label>
        </div>
        
        <div class="language-selector">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            class="language-option"
            :class="{ active: currentLocale === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <span class="language-flag">{{ lang.flag }}</span>
            <span class="language-name">{{ lang.name }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="settings-card">
      <div class="setting-item">
        <div class="setting-header">
          <div class="setting-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <label class="setting-label">{{ $t('authentication') }}</label>
        </div>

        <div v-if="!authStatus.authEnabled" class="auth-setup">
          <p class="auth-tip">{{ $t('auth_disabled_tip') }}</p>
          <div class="form-group">
            <label class="form-label">{{ $t('admin_username') }}</label>
            <input v-model="adminForm.username" class="form-input" :placeholder="$t('admin_username')">
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('admin_password') }}</label>
            <input v-model="adminForm.password" type="password" class="form-input" :placeholder="$t('admin_password')">
          </div>
          <button class="btn btn-primary" @click="enableAuth" :disabled="!adminForm.username || !adminForm.password">
            {{ $t('enable_auth') }}
          </button>
        </div>

        <div v-else class="auth-status">
          <p class="auth-tip success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-bottom;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ $t('auth_enabled') }}
          </p>
          <button v-if="userPermissions.isAdmin" class="btn btn-secondary danger-hover" @click="disableAuth">
            {{ $t('disable_auth') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="userPermissions.canManageUsers" class="settings-card">
      <div class="setting-item user-management-section">
        <div class="setting-header">
          <div class="setting-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <label class="setting-label">{{ $t('user_management') }}</label>
        </div>

        <div class="user-list">
          <div v-for="user in users" :key="user._id" class="user-item">
            <div class="user-info">
              <span class="user-name">{{ user.username }}</span>
              <div class="user-badges">
                <span v-if="user.isAdmin" class="badge admin">Super user</span>
                <span v-if="user.canManageUsers" class="badge users">User manager</span>
                <span v-if="user.canManageBoards" class="badge boards">Board manager</span>
                <span v-if="user.canManageTasks" class="badge tasks">Task manager</span>
              </div>
            </div>
            <div class="user-actions">
              <button class="btn-icon" @click="editUser(user)" :title="$t('edit')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button v-if="!user.isAdmin" class="btn-icon danger" @click="deleteUser(user._id)" :title="$t('delete')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary add-user-btn" @click="showAddUserModal = true">
          {{ $t('add_user') }}
        </button>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal-overlay" @click.self="closeUserModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingUser ? $t('edit_user') : $t('add_user') }}</h3>
          <button class="modal-close" @click="closeUserModal">&times;</button>
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ $t('username') }}</label>
          <input v-model="newUserForm.username" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">{{ editingUser ? $t('new_password_optional') : $t('password') }}</label>
          <input v-model="newUserForm.password" type="password" class="form-input">
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('permissions') }}</label>
          <div class="permission-grid permissions">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newUserForm.permissions.canManageUsers"> {{ $t('perm_users') }}
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="newUserForm.permissions.canManageBoards"> {{ $t('perm_boards') }}
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="newUserForm.permissions.canManageTasks"> {{ $t('perm_tasks') }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('allowed_boards') }}</label>
          <div class="boards-select-list">
            <label v-for="board in allBoards" :key="board._id" class="checkbox-label">
              <input type="checkbox" :value="board._id" v-model="newUserForm.allowedBoards"> {{ board.name }}
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeUserModal">{{ $t('cancel') }}</button>
          <button class="btn btn-primary" @click="saveUser" :disabled="!newUserForm.username || (!editingUser && !newUserForm.password)">
            {{ editingUser ? $t('save') : $t('create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { ref, watch, onMounted } from 'vue'
import { authApi, boardsApi } from '../api'

export default {
  name: 'Settings',
  setup() {
    const { locale, t } = useI18n()
    const currentLocale = ref(locale.value)
    const authStatus = ref({ authEnabled: false })
    const adminForm = ref({ username: '', password: '' })
    
    // User Management
    const users = ref([])
    const allBoards = ref([])
    const userPermissions = ref({ canManageUsers: false })
    const showAddUserModal = ref(false)
    const editingUser = ref(null)
    const newUserForm = ref({
      username: '',
      password: '',
      permissions: {
        canManageUsers: false,
        canManageBoards: false,
        canManageTasks: false,
        isAdmin: false
      },
      allowedBoards: []
    })

    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ]

    const fetchData = async () => {
      try {
        const { data: status } = await authApi.getStatus()
        authStatus.value = status

        if (status.authEnabled) {
          const { data: me } = await authApi.me()
          userPermissions.value = me
          
          if (me.canManageUsers || me.isAdmin) {
            const [usersRes, boardsRes] = await Promise.all([
              authApi.getUsers(),
              boardsApi.getAll()
            ])
            users.value = usersRes.data
            allBoards.value = boardsRes.data
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings data', err)
      }
    }

    const enableAuth = async () => {
      try {
        await authApi.enable(adminForm.value.username, adminForm.value.password)
        alert(t('auth_enabled_success'))
        window.location.reload()
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to enable auth')
      }
    }

    const disableAuth = async () => {
      if (!confirm(t('disable_auth_confirm'))) return
      try {
        await authApi.disable()
        localStorage.removeItem('auth-token')
        alert(t('auth_disabled_success'))
        window.location.reload()
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to disable auth')
      }
    }

    const editUser = (user) => {
      editingUser.value = user
      newUserForm.value = {
        username: user.username,
        password: '',
        permissions: {
          canManageUsers: user.canManageUsers || false,
          canManageBoards: user.canManageBoards || false,
          canManageTasks: user.canManageTasks || false,
          isAdmin: user.isAdmin || false
        },
        allowedBoards: [...(user.allowedBoards || [])]
      }
      showAddUserModal.value = true
    }

    const saveUser = async () => {
      try {
        if (editingUser.value) {
          await authApi.updateUser(editingUser.value._id, newUserForm.value)
          alert(t('user_updated_success'))
        } else {
          await authApi.createUser(newUserForm.value)
          alert(t('user_created_success'))
        }
        closeUserModal()
        await fetchData()
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to save user')
      }
    }

    const closeUserModal = () => {
      showAddUserModal.value = false
      editingUser.value = null
      newUserForm.value = {
        username: '',
        password: '',
        permissions: { 
          canManageUsers: false, 
          canManageBoards: false, 
          canManageTasks: false,
          isAdmin: false
        },
        allowedBoards: []
      }
    }

    const deleteUser = async (id) => {
      if (!confirm(t('delete_user_confirm'))) return
      try {
        await authApi.deleteUser(id)
        await fetchData()
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete user')
      }
    }

    const selectLanguage = (code) => {
      currentLocale.value = code
      locale.value = code
      localStorage.setItem('user-locale', code)
    }

    watch(locale, (newVal) => {
      currentLocale.value = newVal
    })

    onMounted(fetchData)

    return {
      currentLocale,
      languages,
      selectLanguage,
      authStatus,
      adminForm,
      enableAuth,
      disableAuth,
      users,
      allBoards,
      userPermissions,
      showAddUserModal,
      newUserForm,
      editingUser,
      editUser,
      saveUser,
      closeUserModal,
      deleteUser
    }
  }
}
</script>

<style scoped>
.auth-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.auth-controls {
  margin-top: 8px;
}

.auth-setup {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-tip {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.auth-tip.success {
  color: var(--success);
}

.danger-hover:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

.form-group {
  margin-bottom: 4px;
}

.user-actions {
  display: flex;
  gap: 8px;
}


.settings-container {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.settings-card {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  color: var(--accent);
  display: flex;
  align-items: center;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.language-selector {
  display: flex;
  gap: 12px;
}

.language-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  font-weight: 500;
}

.language-option:hover {
  border-color: var(--accent);
  color: var(--text-primary);
  background: rgba(99, 102, 241, 0.1);
}

.language-option.active {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.language-flag {
  font-size: 20px;
}

.language-name {
  font-weight: 500;
}
.user-list {
  display: grid;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.user-item:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  min-width: 120px;
}

.user-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.admin {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.badge.users {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.badge.boards {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge.tasks {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent);
  border-color: var(--accent);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border-color: var(--danger);
}

.modal {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 32px;
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.permission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.permissions .checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.permissions .checkbox-label:hover {
  border-color: var(--text-muted);
}

.boards-select-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}

.boards-select-list .checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.boards-select-list .checkbox-label:hover {
  background: var(--bg-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.add-user-btn {
  margin-top: 16px;
  width: 100%;
  border-style: dashed;
}

.add-user-btn:hover {
  border-style: solid;
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(99, 102, 241, 0.05);
}
</style>
