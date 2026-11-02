import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../services/api'

const resourceNames = ['projects', 'tasks', 'skills', 'certifications']

export const loadDashboard = createAsyncThunk(
  'data/loadDashboard',
  async (token, { rejectWithValue }) => {
    try {
      const responses = await Promise.all(resourceNames.map((resource) =>
        apiRequest(`/${resource}`, { token }),
      ))
      const projects = responses[0].items
      const feedbackResponses = await Promise.all(projects.map((project) =>
        apiRequest(`/projects/${project.id}/feedback`, { token }),
      ))
      return {
        ...Object.fromEntries(
        resourceNames.map((resource, index) => [resource, responses[index].items]),
        ),
        feedback: feedbackResponses.flatMap((response) => response.items),
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const saveItem = createAsyncThunk(
  'data/saveItem',
  async ({ resource, values, itemId, token }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/${resource}${itemId ? `/${itemId}` : ''}`, {
        token,
        method: itemId ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      })
      return { resource, item: response.item }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteItem = createAsyncThunk(
  'data/deleteItem',
  async ({ resource, itemId, token }, { rejectWithValue }) => {
    try {
      await apiRequest(`/${resource}/${itemId}`, { token, method: 'DELETE' })
      return { resource, itemId }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const saveFeedback = createAsyncThunk(
  'data/saveFeedback',
  async ({ projectId, comment, grade, token }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/projects/${projectId}/feedback`, {
        token,
        method: 'POST',
        body: JSON.stringify({ comment, grade }),
      })
      return { projectId: Number(projectId), feedback: response.item }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    projects: [],
    tasks: [],
    skills: [],
    certifications: [],
    feedback: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearDataError(state) {
      state.error = null
    },
    resetData(state) {
      state.projects = []
      state.tasks = []
      state.skills = []
      state.certifications = []
      state.feedback = []
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.loading = true
        state.error = null
        state.projects = []
        state.tasks = []
        state.skills = []
        state.certifications = []
        state.feedback = []
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.loading = false
        Object.assign(state, action.payload)
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to load your workspace.'
      })
      .addCase(saveItem.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveFeedback.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveItem.fulfilled, (state, action) => {
        state.saving = false
        const items = state[action.payload.resource]
        const index = items.findIndex((item) => item.id === action.payload.item.id)
        if (index >= 0) items[index] = action.payload.item
        else items.unshift(action.payload.item)
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state[action.payload.resource] = state[action.payload.resource].filter(
          (item) => item.id !== Number(action.payload.itemId),
        )
      })
      .addCase(saveFeedback.fulfilled, (state, action) => {
        state.feedback.unshift(action.payload.feedback)
      })
      .addMatcher(
        (action) =>
          [saveItem.rejected, deleteItem.rejected, saveFeedback.rejected].some((thunk) =>
            thunk.match(action),
          ),
        (state, action) => {
          state.saving = false
          state.error = action.payload || 'Unable to save your changes.'
        },
      )
  },
})

export const { clearDataError, resetData } = dataSlice.actions
export default dataSlice.reducer
