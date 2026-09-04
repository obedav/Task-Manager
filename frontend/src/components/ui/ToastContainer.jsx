const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 w-80"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`p-4 rounded-lg shadow-lg border flex items-start justify-between gap-3 transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' :
            toast.type === 'error'   ? 'bg-red-900/90   border-red-500   text-red-100'   :
            toast.type === 'warning' ? 'bg-yellow-900/90 border-yellow-500 text-yellow-100' :
                                       'bg-blue-900/90  border-blue-500  text-blue-100'
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{toast.title}</p>
            {toast.message && <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
