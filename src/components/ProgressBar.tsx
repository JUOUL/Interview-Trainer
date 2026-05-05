interface Props {
  percentage: number
  className?: string
}

export default function ProgressBar({ percentage, className = '' }: Props) {
  return (
    <div className={`w-full bg-gray-100 rounded-full h-1.5 ${className}`}>
      <div
        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
