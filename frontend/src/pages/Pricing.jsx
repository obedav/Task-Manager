import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import api from '../services/api';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started for free',
    features: [
      'Up to 50 tasks',
      'Basic task management',
      'Mobile PWA access',
      '1 GB storage',
      'Community support'
    ],
    cta: 'Current Plan',
    highlighted: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    description: 'For power users and freelancers',
    features: [
      'Unlimited tasks',
      'Advanced analytics',
      'AI task assistant',
      'Data export (JSON/CSV)',
      'Priority email support',
      'Custom working hours',
      'Daily check-ins',
      '10 GB storage'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true
  },
  {
    id: 'team',
    name: 'Team',
    price: 24.99,
    description: 'For teams that ship together',
    features: [
      'Everything in Pro',
      'Up to 25 team members',
      'Shared workspaces',
      'Task assignments',
      'Team analytics',
      'Real-time collaboration',
      'Admin dashboard',
      'SSO (coming soon)',
      '100 GB storage'
    ],
    cta: 'Upgrade to Team',
    highlighted: false
  }
];

export default function Pricing() {
  const { isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    setLoading(planId);
    setError('');
    try {
      const res = await api.post('/billing/checkout', { plan: planId });
      if (res.url) window.location.href = res.url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-xl" style={{ color: 'var(--text-muted)' }}>
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-lg text-center"
            style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="rounded-2xl p-8 flex flex-col"
              style={
                plan.highlighted
                  ? { background: 'var(--royal)', border: '2px solid var(--gold)' }
                  : { background: 'var(--surface)', border: '1px solid var(--border)' }
              }
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="px-3 py-1 text-xs font-bold rounded-full"
                    style={{ background: 'var(--gold)', color: '#fff' }}>
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h2 className="text-2xl font-bold mb-2"
                style={{ color: plan.highlighted ? '#fff' : 'var(--text)' }}>
                {plan.name}
              </h2>
              <p className="mb-6 text-sm"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                {plan.description}
              </p>

              <div className="mb-8">
                <span className="text-5xl font-bold"
                  style={{ color: plan.highlighted ? '#fff' : 'var(--text)' }}>
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="ml-1 text-sm"
                    style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                    / month
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: plan.highlighted ? 'var(--gold)' : 'var(--success)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm"
                      style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--text)' }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.id !== 'free' && handleUpgrade(plan.id)}
                disabled={plan.id === 'free' || loading === plan.id}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={
                  plan.highlighted
                    ? { background: 'var(--gold)', color: '#fff' }
                    : plan.id === 'free'
                    ? { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                    : { background: 'var(--royal)', color: '#fff' }
                }
              >
                {loading === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text)' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel through your billing portal and you retain access until the end of your billing period. No questions asked.' },
              { q: 'Is there a free trial for Pro?', a: 'Pro includes a 14-day free trial. No credit card required to start.' },
              { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Stripe. We never store your card details.' },
              { q: 'Can I switch plans?', a: 'Yes. Upgrade or downgrade anytime from the billing settings. Proration is handled automatically.' }
            ].map(({ q, a }) => (
              <div key={q} className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{q}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
