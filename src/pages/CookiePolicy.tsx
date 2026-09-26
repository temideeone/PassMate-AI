import React from 'react';
import { motion } from 'motion/react';
import { Shield, Cookie, ShieldCheck, Database, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to App
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300"
      >
        <div className="bg-amber-600 dark:bg-amber-700 p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Cookie className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
          </div>
          <p className="text-amber-100 font-medium">Effective Date: 20 March 2025 | Last Updated: 20 March 2025</p>
        </div>

        <div className="p-8 prose prose-amber dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Shield className="w-6 h-6 mr-2 text-amber-600 dark:text-amber-400" />
              1. Introduction
            </h2>
            <p>
              This Cookie Policy explains how <strong>PassMate AI</strong> ("we", "our", or "us"), operated by <strong>Palmtech Digital Concept</strong>, uses cookies and similar technologies when you visit our platform:
            </p>
            <p className="underline font-medium text-amber-600 dark:text-amber-400">
              https://passmate-ai-538153425032.us-west1.run.app/
            </p>
            <p>This policy should be read alongside our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Cookie className="w-6 h-6 mr-2 text-amber-600 dark:text-amber-400" />
              2. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your device (phone, tablet, or computer) when you visit a website. They help websites function properly, improve user experience, and provide analytical data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="w-6 h-6 mr-2 text-amber-600 dark:text-amber-400" />
              3. Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.1 Essential Cookies (Strictly Necessary)</h3>
                <p>These cookies are required for the platform to function properly and cannot be disabled.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>User authentication (login sessions via Firebase Authentication)</li>
                  <li>Security and fraud prevention</li>
                  <li>Session management</li>
                </ul>
                <p className="mt-2 text-sm font-bold text-amber-600">Legal Basis: Legitimate interest (no consent required)</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.2 Analytics Cookies</h3>
                <p>These cookies help us understand how users interact with PassMate AI so we can improve performance and features.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Page visits and session duration</li>
                  <li>Feature usage tracking</li>
                  <li>Error monitoring</li>
                </ul>
                <p className="mt-2 text-sm font-bold text-amber-600">Tools Used: Google Analytics (hosted on Google Cloud infrastructure)</p>
                <p className="text-sm font-bold text-amber-600">Legal Basis: Consent required</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.3 Functional Cookies</h3>
                <p>These cookies remember your preferences to enhance your experience.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Study preferences</li>
                  <li>Exam selections</li>
                  <li>User interface settings</li>
                </ul>
                <p className="mt-2 text-sm font-bold text-amber-600">Legal Basis: Consent required</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.4 Performance & Security Cookies</h3>
                <p>Used to ensure the platform runs efficiently and securely.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Load balancing</li>
                  <li>Bot detection</li>
                  <li>Abuse prevention via Firebase and Google Cloud services</li>
                </ul>
                <p className="mt-2 text-sm font-bold text-amber-600">Legal Basis: Legitimate interest</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Third-Party Cookies</h2>
            <p>We may allow trusted third-party services to place cookies on your device, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Google (Analytics & Cloud services)</strong> – performance and analytics</li>
              <li><strong>Firebase (Authentication & backend services)</strong> – session and security handling</li>
            </ul>
            <p className="mt-4">These providers process data in accordance with their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-amber-600 dark:text-amber-400" />
              5. Cookie Consent
            </h2>
            <p>
              In compliance with the <strong>Nigeria Data Protection Act (2023)</strong> and <strong>GAID 2025</strong>, we display a cookie consent banner when you first visit our platform.
            </p>
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Settings className="w-6 h-6 mr-2 text-amber-600 dark:text-amber-400" />
              6. Managing Cookies
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">6.1 Browser Settings</h3>
                <p>Most browsers allow you to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Block cookies</li>
                  <li>Delete stored cookies</li>
                  <li>Receive alerts before cookies are stored</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">6.2 Platform Settings</h3>
                <p>You can update your cookie preferences within your PassMate account (where available).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Data Collected via Cookies</h2>
            <p>Cookies may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address</li>
              <li>Device and browser information</li>
              <li>Pages visited</li>
              <li>Interaction patterns</li>
            </ul>
            <p className="mt-4 font-medium italic">This data is processed in line with our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Data Retention</h2>
            <p>Cookie data is retained for varying periods depending on its purpose:</p>
            <ul className="list-disc pl-6 space-y-1 border-l-4 border-amber-100 dark:border-amber-900/30 ml-2">
              <li className="pl-4"><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li className="pl-4"><strong>Persistent cookies:</strong> Stored for up to 12 months</li>
              <li className="pl-4"><strong>Analytics data:</strong> Up to 6 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page and, where necessary, communicated to users.
            </p>
          </section>

          <section className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-3xl border border-amber-100 dark:border-amber-900/30">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
            <p>If you have any questions about this Cookie Policy or how we use cookies, contact:</p>
            <div className="mt-4 flex items-center space-x-2">
              <span className="font-bold">Palmtech Digital Concept</span>
              <a href="mailto:palmtechdc@gmail.com" className="text-amber-600 font-bold hover:underline">palmtechdc@gmail.com</a>
            </div>
            
            <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-900/30 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                PassMate AI | Palmtech Digital Concept | Abuja, Nigeria
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default CookiePolicy;
