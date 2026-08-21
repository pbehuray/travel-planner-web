'use client';

import { useState } from 'react';
import type { BuildTrace, TripSpec } from '@/lib/api';

const PROVIDER_LABEL: Record<string, string> = {
  groq: 'Groq',
  gemini: 'Gemini',
};

const PROVIDER_ROLE: Record<string, string> = {
  groq: 'generates',
  gemini: 'checks',
};

function ProviderPill({ provider }: { provider: string }) {
  return <span className={`provider-pill provider-${provider}`}>{PROVIDER_LABEL[provider] || provider}</span>;
}

function StatusDot({ status }: { status: 'ok' | 'fallback' }) {
  return <span className={`status-dot status-${status}`} title={status === 'ok' ? 'Completed normally' : 'Used fallback data'} />;
}

function CheckIcon({ status }: { status: 'pass' | 'fail' | 'warn' }) {
  if (status === 'pass') return <span className="check-icon check-pass">✓</span>;
  if (status === 'fail') return <span className="check-icon check-fail">✗</span>;
  return <span className="check-icon check-warn">!</span>;
}

export function HowThisPlanWasBuilt({ buildTrace, tripSpec }: { buildTrace?: BuildTrace; tripSpec?: TripSpec }) {
  const [open, setOpen] = useState(false);

  if (!buildTrace) return null;

  return (
    <div className="card build-trace-card">
      <button
        type="button"
        className="build-trace-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>🧠 How this plan was built</span>
        <span className="build-trace-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="build-trace-body">
          <p className="build-trace-intro">
            Two brains, one plan: <strong>Groq</strong> generates the itinerary content, while{' '}
            <strong>Gemini</strong> computes the budget and independently checks the result.
          </p>

          {tripSpec && (
            <section className="build-trace-section">
              <h4>Parsed constraints</h4>
              <ul className="constraints-list">
                <li>
                  <strong>Destination:</strong> {tripSpec.destination || '—'}
                </li>
                <li>
                  <strong>Duration:</strong> {tripSpec.duration ? `${tripSpec.duration} days` : '—'}
                </li>
                <li>
                  <strong>Budget:</strong>{' '}
                  {tripSpec.budget ? `${tripSpec.currency || 'USD'} ${tripSpec.budget.toLocaleString()}` : 'not specified'}
                </li>
                <li>
                  <strong>Interests:</strong>{' '}
                  {tripSpec.interests && tripSpec.interests.length > 0 ? tripSpec.interests.join(', ') : 'none specified'}
                </li>
              </ul>
            </section>
          )}

          <section className="build-trace-section">
            <h4>Pipeline</h4>
            <ul className="pipeline-list">
              {buildTrace.pipeline.map((step, idx) => (
                <li key={idx} className="pipeline-step">
                  <StatusDot status={step.status} />
                  <div className="pipeline-step-body">
                    <div className="pipeline-step-header">
                      <span className="pipeline-agent">{step.agent}</span>
                      <ProviderPill provider={step.provider} />
                    </div>
                    <p className="pipeline-section">
                      {PROVIDER_ROLE[step.provider] === 'checks' ? 'computed' : 'produced'} {step.section}
                      {step.status === 'fallback' && ' (fallback used)'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="build-trace-section">
            <h4>
              Validator checklist{' '}
              {typeof buildTrace.validatorScore === 'number' && (
                <span className="validator-score">— score {buildTrace.validatorScore}/100</span>
              )}
            </h4>
            <ul className="checklist">
              {buildTrace.checks.map((check, idx) => (
                <li key={idx} className="checklist-item">
                  <CheckIcon status={check.status} />
                  <div>
                    <span className="checklist-name">{check.name.replace(/_/g, ' ')}</span>
                    <p className="checklist-message">{check.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {buildTrace.repairCount > 0 && (
            <section className="build-trace-section">
              <h4>Repair attempts</h4>
              <p className="repair-note">
                The draft failed validation and was automatically repaired{' '}
                <strong>{buildTrace.repairCount}</strong> time{buildTrace.repairCount > 1 ? 's' : ''}
                {buildTrace.repairProvider && (
                  <>
                    {' '}
                    using <ProviderPill provider={buildTrace.repairProvider} />
                  </>
                )}
                {' '}before passing validation.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
