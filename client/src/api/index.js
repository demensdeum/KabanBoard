import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export const boardsApi = {
    getAll: () => api.get('/boards'),
    getOne: (id) => api.get(`/boards/${id}`),
    create: (name, columns) => api.post('/boards', { name, columns }),
    update: (id, name) => api.put(`/boards/${id}`, { name }),
    delete: (id) => api.delete(`/boards/${id}`)
}

export const columnsApi = {
    create: (title, boardId) => api.post('/columns', { title, boardId }),
    update: (id, title) => api.put(`/columns/${id}`, { title }),
    delete: (id) => api.delete(`/columns/${id}`),
    reorder: (id, order) => api.put(`/columns/${id}/reorder`, { order })
}

export const cardsApi = {
    create: (data) => api.post('/cards', data),
    update: (id, data) => api.put(`/cards/${id}`, data),
    delete: (id) => api.delete(`/cards/${id}`),
    move: (id, columnId, order) => api.put(`/cards/${id}/move`, { columnId, order }),
    batchReorder: (cards) => api.put('/cards/batch/reorder', { cards })
}

export default api
