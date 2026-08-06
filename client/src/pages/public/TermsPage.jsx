// client/src/pages/public/TermsPage.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-6 text-neutral-900">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-display font-extrabold text-neutral-900 mb-8">Terms of Service</h1>
        <div className="space-y-6 text-neutral-700 bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed text-neutral-600">By using CityPulse AI, you agree to these Terms. If you do not agree, please do not use our services.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">2. Use of Service</h2>
            <p className="text-sm leading-relaxed text-neutral-600">CityPulse AI is for reporting genuine civic issues. You agree not to submit false, misleading, or malicious complaints. Abuse of the platform may result in account suspension.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">3. Accuracy of Complaints</h2>
            <p className="text-sm leading-relaxed text-neutral-600">You are responsible for the accuracy of information you submit. AI triage results are advisory and subject to officer review.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">4. Uploaded Content</h2>
            <p className="text-sm leading-relaxed text-neutral-600">By uploading content, you grant us a license to process it for the purpose of complaint triage. You retain ownership of your content.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
