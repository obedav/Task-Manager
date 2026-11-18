import { useState, useEffect, useCallback } from 'react'
import { Users, CheckSquare, CreditCard, Shield, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import api from '../services/api'

const PLAN_COLORS = {
  free:  { bg: 'var(--surface-2)', text: 'var(--text-muted)' },
  pro:   { bg: 'var(--royal-light)', text: 'var(--royal)' },
  team:  { bg: 'rgba(var(--gold-rgb,212,175,55),0.15)', text: 'var(--gold)' }
}

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--royal-light)' }}>
        <Icon className="w-5 h-5" style={{ color: 'var(--royal)' }} />
      </div>
    </div>
    <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{value ?? '—'}</p>
    {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
)

const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null)
  const [users,   setUsers]   = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search,  setSearch]  = useState('')
  const [query,   setQuery]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [roleLoading, setRoleLoading] = useState({})

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats')
      if (res.success) setStats(res.data)
    } catch { /* non-critical */ }
  }, [])

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      const res = await api.get(`/admin/users?${params}`)
      if (res.success) {
        setUsers(res.data)
        setPagination(res.pagination)
      }
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchUsers(1, '')
  }, [fetchStats, fetchUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1, query)
  }

  const handlePage = (newPage) => fetchUsers(newPage, query)

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setRoleLoading(p => ({ ...p, [userId]: true }))
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.role } : u))
      }
    } catch { /* ignore */ } finally {
      setRoleLoading(p => ({ ...p, [userId]: false }))
    }
  }

  const refresh = () => {
    fetchStats()
    fetchUsers(pagination.page, query)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Platform overview and user management</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}       label="Total Users"        value={stats?.totalUsers}     sub={`${stats?.subscriptions?.pro ?? 0} Pro · ${stats?.subscriptions?.team ?? 0} Team`} />
        <StatCard icon={CheckSquare} label="Total Tasks"        value={stats?.totalTasks}     sub={`${stats?.completedTasks ?? 0} completed`} />
        <StatCard icon={CreditCard}  label="Paying Subscribers" value={stats ? (stats.subscriptions.pro + stats.subscriptions.team) : null} sub="Pro + Team plans" />
        <StatCard icon={Shield}      label="Free Plan"          value={stats?.subscriptions?.free} sub="Free tier users" />
      </div>

      {/* User Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold flex-1" style={{ color: 'var(--text)' }}>Users</h2>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="search"
                placeholder="Search name or email…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', width: 220 }}
              />
            </div>
            <button type="submit" className="px-3 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--royal)' }}>Search</button>
          </form>
        </div>

        {error && (
          <div className="m-5 p-4 rounded-xl text-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Email', 'Role', 'Plan', 'Tasks', 'Joined', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2" style={{ borderColor: 'var(--royal)' }} /></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found</td>
                </tr>
              ) : users.map(u => {
                const plan = u.subscription?.plan ?? 'free'
                const pc   = PLAN_COLORS[plan] ?? PLAN_COLORS.free
                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text)' }}>{u.name}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={u.role === 'admin'
                          ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                          : { background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{ background: pc.bg, color: pc.text }}>{plan}</span>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text)' }}>{u.taskCount}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleRole(u._id, u.role)}
                        disabled={roleLoading[u._id]}
                        className="text-xs px-3 py-1 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                        style={u.role === 'admin'
                          ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                          : { background: 'var(--royal-light)', color: 'var(--royal)' }}>
                        {roleLoading[u._id] ? '…' : u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.pages} · {pagination.total} users
            </span>
            <div className="flex gap-2">
              <button onClick={() => handlePage(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-lg transition-colors hover:bg-surface-2 disabled:opacity-40"
                style={{ color: 'var(--text)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => handlePage(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg transition-colors hover:bg-surface-2 disabled:opacity-40"
                style={{ color: 'var(--text)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
