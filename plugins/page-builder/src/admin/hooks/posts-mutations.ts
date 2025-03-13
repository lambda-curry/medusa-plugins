import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../sdk'
import {
  AdminPageBuilderCreatePostBody,
  AdminPageBuilderCreatePostResponse,
} from '../../sdk/types'

const QUERY_KEY = ['posts']

export const useAdminCreatePost = () => {
  const queryClient = useQueryClient()
  return useMutation<
    AdminPageBuilderCreatePostResponse,
    Error,
    AdminPageBuilderCreatePostBody
  >({
    mutationFn: async (data) => {
      return sdk.admin.pageBuilder.createPost(data)
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
