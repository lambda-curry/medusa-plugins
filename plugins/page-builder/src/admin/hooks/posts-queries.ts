import { useQuery } from '@tanstack/react-query'

import { sdk } from '../sdk'
import {
  AdminPageBuilderListPostsQuery,
  AdminPageBuilderListPostsResponse,
} from '../../sdk/types'

import { Post } from '../../modules/page-builder/types'

const QUERY_KEY = ['posts']

export const useAdminListPosts = (query: AdminPageBuilderListPostsQuery) => {
  return useQuery<
    AdminPageBuilderListPostsResponse,
    AdminPageBuilderListPostsQuery
  >({
    queryKey: [...QUERY_KEY, query],
    queryFn: async () => {
      return sdk.admin.pageBuilder.listPosts(query)
    },
  })
}

export const useAdminFetchPost = (id: string) => {
  return useQuery<Post>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const post = await sdk.admin.pageBuilder.listPosts({
        id,
      } as AdminPageBuilderListPostsQuery)

      return post?.posts?.[0]
    },
  })
}
