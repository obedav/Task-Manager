const AppLoadingOverlay = ({ isVisible, message = 'Loading…' }) => {
  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="bg-slate-800 rounded-xl p-6 flex items-center gap-4 shadow-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
        <span className="text-white font-medium">{message}</span>
      </div>
    </div>
  )
}

export default AppLoadingOverlay
