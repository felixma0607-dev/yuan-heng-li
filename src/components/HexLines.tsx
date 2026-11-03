export function HexLines({ lines, moving = [] }: { lines: number[]; moving?: number[] }) {
  const topDown = [5, 4, 3, 2, 1, 0]
  return (
    <div className="hex-lines" aria-hidden="true">
      {topDown.map((index) => {
        const yang = lines[index] === 1
        const isMoving = moving.includes(index + 1)
        return (
          <div className="yao" key={index}>
            {yang ? (
              <span className="bar full" />
            ) : (
              <span className="bar broken">
                <i />
                <i />
              </span>
            )}
            <span className={isMoving ? 'mark' : 'mark quiet'}>{isMoving ? (yang ? '●' : '○') : ''}</span>
          </div>
        )
      })}
    </div>
  )
}
