import { useQuery } from "@tanstack/react-query"
import { TPost } from "src/types"

const useAllPostsQuery = () => {
  const { data } = useQuery({
    queryKey: ['posts', 'all'],
    initialData: [] as TPost[],
    enabled: false,
  })

  // 데이터가 없으면 빈 배열 반환 (에러 없이)
  return data || []
}

export default useAllPostsQuery