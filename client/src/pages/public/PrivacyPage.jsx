// client/src/pages/public/PrivacyPage.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-6 text-neutral-900">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-display font-extrabold text-neutral-900 mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-neutral-700 bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">1. Data We Collect</h2>
            <p className="text-sm leading-relaxed text-neutral-600">We collect information you provide directly, including your name, email, phone number, complaint content, and any uploaded media files. Location data (GPS coordinates) is only collected when explicitly provided during complaint submission.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">2. How We Use Your Data</h2>
            <p className="text-sm leading-relaxed text-neutral-600">Your data is used to process and route civic complaints, improve AI triage accuracy, send status updates on your complaints, and comply with applicable laws. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">3. AI Processing</h2>
            <p className="text-sm leading-relaxed text-neutral-600">Complaint content and uploaded media are processed by Google Gemini AI on our secure servers. The AI analyzes content to classify issues, detect duplicates, and suggest routing. Credentials are never exposed to the client.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">4. Data Security</h2>
            <p className="text-sm leading-relaxed text-neutral-600">We use bcrypt password hashing, JWT authentication, Supabase Row Level Security, and HTTPS encryption to protect your data. File uploads are stored securely.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">5. Contact Us</h2>
            <p className="text-sm leading-relaxed text-neutral-600">For privacy inquiries, contact privacy@citypulse.ai</p>
          </section>
        </div>
      </div>
    </div>
  );
}
