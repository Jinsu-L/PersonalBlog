import { DEFAULT_CATEGORY } from "src/constants"
import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "src/libs/utils/notion"

export const useCategoriesQuery = () => {
  const allPosts = usePostsQuery()
  // 카테고리는 Public 포스트만 대상으로
  const filteredPosts = allPosts.filter(post => {
    const postStatus = post.status?.[0]
    const postType = post.type?.[0]
    return postStatus === "Public" && postType === "Post"
  })
  const categories = getAllSelectItemsFromPosts("category", filteredPosts)

  return {
    [DEFAULT_CATEGORY]: filteredPosts?.length || 0,
    ...categories,
  }
}
