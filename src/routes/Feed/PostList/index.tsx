import { useRouter } from "next/router"
import React, { useEffect, useState, useMemo } from "react"
import PostCard from "src/routes/Feed/PostList/PostCard"
import { DEFAULT_CATEGORY } from "src/constants"
import usePostsQuery from "src/hooks/usePostsQuery"

type Props = {
  q: string
}

const PostList: React.FC<Props> = ({ q }) => {
  const router = useRouter()
  const allPosts = usePostsQuery()
  
  console.log('PostList: All posts data:', allPosts?.length || 0, 'posts')
  
  // Feed에서는 필터링된 데이터만 사용
  const data = useMemo(() => {
    if (!allPosts || allPosts.length === 0) {
      console.log('PostList: No posts data available')
      return []
    }
    
    console.log('PostList: Sample post data:', allPosts[0])
    
    const filtered = allPosts.filter(post => {
      const postStatus = post.status?.[0]
      const postType = post.type?.[0]
      const isPublic = postStatus === "Public"
      const isPost = postType === "Post"
      
      console.log(`PostList: Post ${post.title} - status: ${postStatus}, type: ${postType}, isPublic: ${isPublic}, isPost: ${isPost}`)
      
      return isPublic && isPost
    })
    
    console.log('PostList: Filtered posts count:', filtered.length)
    return filtered
  }, [allPosts])
  
  const [filteredPosts, setFilteredPosts] = useState(data)

  const currentTag = `${router.query.tag || ``}` || undefined
  const currentCategory = `${router.query.category || ``}` || DEFAULT_CATEGORY
  const currentOrder = `${router.query.order || ``}` || "desc"

  useEffect(() => {
    setFilteredPosts(() => {
      let newFilteredPosts = data
      // keyword
      newFilteredPosts = newFilteredPosts.filter((post) => {
        const tagContent = post.tags ? post.tags.join(" ") : ""
        const searchContent = post.title + post.summary + tagContent
        return searchContent.toLowerCase().includes(q.toLowerCase())
      })

      // tag
      if (currentTag) {
        newFilteredPosts = newFilteredPosts.filter(
          (post) => post && post.tags && post.tags.includes(currentTag)
        )
      }

      // category
      if (currentCategory !== DEFAULT_CATEGORY) {
        newFilteredPosts = newFilteredPosts.filter(
          (post) =>
            post && post.category && post.category.includes(currentCategory)
        )
      }
      // order
      if (currentOrder !== "desc") {
        newFilteredPosts = newFilteredPosts.reverse()
      }

      return newFilteredPosts
    })
  }, [q, currentTag, currentCategory, currentOrder, data])

  console.log('PostList: Final filtered posts for render:', filteredPosts.length)
  console.log('PostList: Current filters - tag:', currentTag, 'category:', currentCategory, 'order:', currentOrder, 'q:', q)

  return (
    <>
      <div className="my-2">
        {!filteredPosts.length && (
          <p className="text-gray-500 dark:text-gray-300">Nothing! 😺</p>
        )}
        {filteredPosts.map((post) => (
          <PostCard key={post.id} data={post} />
        ))}
      </div>
    </>
  )
}

export default PostList
