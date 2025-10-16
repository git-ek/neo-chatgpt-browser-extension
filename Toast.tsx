import { FC, useEffect } from 'react'

export const Toast: FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({
  message,
  type,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded-md text-white ${bgColor} shadow-lg transition-opacity duration-300`}
    >
      {message}
    </div>
  )
}
