import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../services/api'

let savedToken = localStorage.getItem('campushub_token')
const savedUser = localStorage.getItem('campushub_user')

function getSavedUser() {
  if (!savedUser) return null
  try {
    return JSON.parse(savedUser)
  } catch {
    savedToken = null
    localStorage.removeItem('campushub_token')
    localStorage.removeItem('campushub_user')
    return null
  }
}

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (details, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(details),
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (token, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/me', { token })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: getSavedUser(),
    loading: false,
    sessionChecking: false,
    sessionVerified: !savedToken,
    error: null,
  },
  reducers: {
    signOut(state) {
      state.token = null
      state.user = null
      state.error = null
      state.sessionChecking = false
      state.sessionVerified = true
      localStorage.removeItem('campushub_token')
      localStorage.removeItem('campushub_user')
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifySession.pending, (state) => {
        state.sessionChecking = true
        state.error = null
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.sessionChecking = false
        state.sessionVerified = true
        state.user = action.payload.user
        localStorage.setItem('campushub_user', JSON.stringify(action.payload.user))
      })
      .addCase(verifySession.rejected, (state, action) => {
        state.sessionChecking = false
        state.sessionVerified = true
        state.token = null
        state.user = null
        state.error = action.payload || 'Your session has expired. Please sign in again.'
        localStorage.removeItem('campushub_token')
        localStorage.removeItem('campushub_user')
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.sessionVerified = true
        state.token = action.payload.token
        state.user = action.payload.user
        localStorage.setItem('campushub_token', action.payload.token)
        localStorage.setItem('campushub_user', JSON.stringify(action.payload.user))
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.sessionVerified = true
        state.token = action.payload.token
        state.user = action.payload.user
        localStorage.setItem('campushub_token', action.payload.token)
        localStorage.setItem('campushub_user', JSON.stringify(action.payload.user))
      })
      .addMatcher(
        (action) => (signIn.rejected.match(action) || signUp.rejected.match(action)),
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'Unable to authenticate. Please try again.'
        },
      )
  },
})

export const { signOut, clearAuthError } = authSlice.actions
export default authSlice.reducer
