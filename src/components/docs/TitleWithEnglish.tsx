function splitBilingualTitle(title: string) {
  let depth = 0
  for (let index = title.length - 1; index >= 0; index -= 1) {
    const character = title[index]
    if (character === ')') depth += 1
    if (character === '(') {
      depth -= 1
      if (depth === 0 && index > 0) {
        const primary = title.slice(0, index).trim()
        const secondary = title.slice(index + 1, -1).trim()
        if (/[A-Za-z]/.test(secondary)) return { primary, secondary }
        return undefined
      }
    }
  }
  return undefined
}

export function TitleWithEnglish({ title }: { title: string }) {
  const parts = splitBilingualTitle(title)
  if (!parts) return <>{title}</>
  return (
    <>
      <span className="title-primary">{parts.primary}</span>
      <span className="title-secondary">{parts.secondary}</span>
    </>
  )
}
