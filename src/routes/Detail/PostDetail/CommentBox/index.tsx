import { TPost } from "src/types"
import { CONFIG } from "site.config"
import dynamic from "next/dynamic"

const UtterancesComponent = dynamic(
  () => {
    return import("./Utterances")
  },
  { ssr: false }
)
const CusdisComponent = dynamic(
  () => {
    return import("./Cusdis")
  },
  { ssr: false }
)

type Props = {
  data: TPost
}

const CommentBox: React.FC<Props> = ({ data }) => {
  const hasUtterances = CONFIG.utterances.enable && CONFIG.utterances.config.repo?.trim()
  const hasCusdis = CONFIG.cusdis.enable

  // 댓글 시스템이 하나도 활성화되지 않은 경우 렌더링하지 않음
  if (!hasUtterances && !hasCusdis) {
    return null
  }

  return (
    <div>
      {hasUtterances && <UtterancesComponent issueTerm={data.id} />}
      {hasCusdis && (
        <CusdisComponent id={data.id} slug={data.slug} title={data.title} />
      )}
    </div>
  )
}

export default CommentBox
