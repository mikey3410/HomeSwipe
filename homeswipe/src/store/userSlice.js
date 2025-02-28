import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice ({
name: 'users',

initialState : {
    currentUser: null
},

reducers: {
    setUsers: (users, action) => {
        users.currentUser = action.payload; 
    }
}

})

export const { setUser } = userSlice.actions; 

export const selectUser = state => state.users; 

export default userSlice.reducer; 