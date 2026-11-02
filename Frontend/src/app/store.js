import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import dataReducer from '../features/dashboard/dataSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
  },
})
