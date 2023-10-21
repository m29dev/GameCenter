import { apiSlice } from '../redux/apiSlice'

const AUTH_URL = '/auth'

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        userConnect: builder.mutation({
            query: (nickname) => ({
                url: `${AUTH_URL}/connect/${nickname}`,
                method: 'GET',
            }),
        }),
    }),
})

export const { useUserConnectMutation } = authApiSlice
