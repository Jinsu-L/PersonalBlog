import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "src/libs/utils/notion"

export const useTagsQuery = () => {
  const allPosts = usePostsQuery()
  // 태그는 Public 포스트만 대상으로
  const filteredPosts = allPosts.filter(post => {
    const postStatus = post.status?.[0]
    const postType = post.type?.[0]
    return postStatus === "Public" && postType === "Post"
  })
  const tags = getAllSelectItemsFromPosts("tags", filteredPosts)

  return tags
}
