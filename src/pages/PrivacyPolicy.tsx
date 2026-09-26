import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, UserCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
        <div className="bg-indigo-600 dark:bg-indigo-700 p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-indigo-100 font-medium">Effective Date: 20 March 2025 | Version 1.0</p>
        </div>

        <div className="p-8 prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Eye className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              1. Introduction
            </h2>
            <p>
              Welcome to PassMate AI ("PassMate", "we", "our", or "us"), an AI-powered exam preparation platform developed and operated by Palmtech Digital Concept. We are committed to protecting your personal data in accordance with the Nigeria Data Protection Act 2023 (NDP Act) and the General Application and Implementation Directive (GAID) 2025 issued by the Nigeria Data Protection Commission (NDPC).
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect your personal data when you use the PassMate AI platform accessible at https://passmate-ai-538153425032.us-west1.run.app/ (the "Platform"). Please read this policy carefully before using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              2. Data Controller Information
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-2 font-bold pr-4">Entity Name</td>
                    <td className="py-2">Palmtech Digital Concept (PassMate AI)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold pr-4">Platform URL</td>
                    <td className="py-2 underline">https://passmate-ai-538153425032.us-west1.run.app/</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold pr-4">Country</td>
                    <td className="py-2">Nigeria (Abuja)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold pr-4">DPO Contact</td>
                    <td className="py-2">palmtechdc@gmail.com</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold pr-4">Regulator</td>
                    <td className="py-2 font-bold">Nigeria Data Protection Commission (NDPC)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Lock className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              3. Data We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full name and email address (registration)</li>
                  <li>Phone number (optional, for account recovery)</li>
                  <li>Exam preferences and study history</li>
                  <li>Payment details processed via Paystack (we do not store card data)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Device type, browser, and operating system</li>
                  <li>IP address and approximate location</li>
                  <li>Session activity logs and usage patterns</li>
                  <li>Cookies and similar tracking technologies (see Section 9)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">3.3 AI Interaction Data</h3>
                <p>
                  When you interact with our AI tutor powered by Google Gemini, your prompts and responses are processed to generate answers. These interactions may be logged for quality assurance and compliance purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              4. Lawful Basis for Processing
            </h2>
            <p>
              We process your personal data based on the following lawful grounds under Section 25 of the NDP Act:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left border-b font-bold">Lawful Basis</th>
                    <th className="px-4 py-2 text-left border-b font-bold">Processing Activity</th>
                    <th className="px-4 py-2 text-left border-b font-bold">Data Types</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-2 border-r">Consent</td>
                    <td className="px-4 py-2 border-r">Marketing emails, cookies, AI interaction logging</td>
                    <td className="px-4 py-2">Email, usage data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Contract</td>
                    <td className="px-4 py-2 border-r">Account creation, service delivery, payment processing</td>
                    <td className="px-4 py-2">Name, email, payment</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Legal Obligation</td>
                    <td className="px-4 py-2 border-r">NDPC compliance, tax records, fraud prevention</td>
                    <td className="px-4 py-2">Identity, transaction data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Legitimate Interest</td>
                    <td className="px-4 py-2 border-r">Platform security, fraud detection, analytics</td>
                    <td className="px-4 py-2">Logs, device info</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your PassMate account</li>
              <li>To provide AI-powered exam preparation and tutoring services</li>
              <li>To process payments and issue receipts via Paystack</li>
              <li>To send service-related notifications and updates</li>
              <li>To respond to your queries and support requests</li>
              <li>To improve platform performance and personalise your experience</li>
              <li>To comply with legal and regulatory obligations under the NDP Act</li>
              <li>To detect, prevent, and address technical issues or fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Data Sharing and Third Parties</h2>
            <p>
              We do not sell your personal data. We share your data only with trusted third-party service providers who are contractually bound to handle data in accordance with the NDP Act. These include:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left border-b font-bold">Provider</th>
                    <th className="px-4 py-2 text-left border-b font-bold">Role</th>
                    <th className="px-4 py-2 text-left border-b font-bold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-2 border-r font-bold">Google (Gemini API)</td>
                    <td className="px-4 py-2 border-r">AI Processor</td>
                    <td className="px-4 py-2">Powers the AI tutoring engine; processes query data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-bold">Paystack</td>
                    <td className="px-4 py-2 border-r">Payment Processor</td>
                    <td className="px-4 py-2">Handles subscription and one-time payments</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-bold">Firebase Atlas</td>
                    <td className="px-4 py-2 border-r">Database Processor</td>
                    <td className="px-4 py-2">Stores user accounts and study data (cloud-hosted)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-bold">Google Cloud.com</td>
                    <td className="px-4 py-2 border-r">Hosting Provider</td>
                    <td className="px-4 py-2">Hosts and serves the PassMate platform</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-bold text-indigo-600 dark:text-indigo-400">NDPC</td>
                    <td className="px-4 py-2 border-r">Regulator</td>
                    <td className="px-4 py-2">Statutory reporting, compliance audits, breach notifications</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Cross-Border Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside Nigeria, including the United States, where our third-party providers operate their infrastructure. We ensure such transfers are protected through:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Standard Contractual Clauses (SCCs) with each provider</li>
              <li>Assessment of the adequacy of data protection in destination countries</li>
              <li>Your explicit consent where required under the NDP Act</li>
            </ul>
            <p className="mt-4 font-bold">
              In accordance with Article 45 of the GAID 2025, all cross-border transfers are governed by Part VIII of the NDP Act 2023.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Data Retention</h2>
            <p>
              We retain personal data only as long as necessary for the purposes for which it was collected, or as required by law:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left border-b font-bold">Data Category</th>
                    <th className="px-4 py-2 text-left border-b font-bold">Retention Period</th>
                    <th className="px-4 py-2 text-left border-b font-bold">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Account & Profile Data</td>
                    <td className="px-4 py-2 border-r">Duration of account + 12 months</td>
                    <td className="px-4 py-2">Contract / Legal Obligation</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Payment Records</td>
                    <td className="px-4 py-2 border-r">7 years</td>
                    <td className="px-4 py-2">Legal Obligation (FIRS)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">AI Interaction Logs</td>
                    <td className="px-4 py-2 border-r">6 months</td>
                    <td className="px-4 py-2">Legitimate Interest</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Session & Usage Logs</td>
                    <td className="px-4 py-2 border-r">3 months</td>
                    <td className="px-4 py-2">Legitimate Interest</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r font-medium">Deleted Account Data</td>
                    <td className="px-4 py-2 border-r">6 months post-deletion</td>
                    <td className="px-4 py-2">NDP Act Article 49(3)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              9. Cookies and Tracking
            </h2>
            <p>
              PassMate AI uses cookies and similar technologies to enhance your experience. In accordance with Article 19 of the GAID 2025, a prominent cookie consent banner is displayed on our homepage. You may accept or decline non-essential cookies at any time.
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">9.1 Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for core platform functionality (login, session management). No consent required.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform. Requires consent.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and study preferences. Requires consent.</li>
            </ul>
            <p>
              You may withdraw cookie consent at any time through your account settings or browser controls. Withdrawal does not affect the lawfulness of processing prior to withdrawal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10. Your Data Subject Rights</h2>
            <p>
              Under Part VI of the NDP Act 2023, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right of Access:</strong> Request a copy of all personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request deletion of your data under qualifying circumstances</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interest or for direct marketing</li>
              <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data</li>
              <li><strong>Right Not to be Subject to Automated Decision-Making:</strong> Request human review of automated decisions</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, submit a request to <strong>palmtechdc@gmail.com</strong>. We will respond within 30 days. You also have the right to lodge a complaint with the NDPC at <strong>ndpc.gov.ng</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Lock className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              11. Security Measures
            </h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>End-to-end encryption (TLS/SSL) for all data in transit</li>
              <li>AES-256 encryption for data at rest on Firebase Atlas</li>
              <li>Role-based access control (RBAC) limiting internal access</li>
              <li>Regular vulnerability assessments and penetration testing</li>
              <li>Multi-factor authentication for administrative access</li>
              <li>Automated monitoring for anomalous activity</li>
              <li>Data breach response procedures (see our Breach Response Workflow)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">12. Children's Privacy</h2>
            <p>
              PassMate AI is designed for secondary school and post-secondary students. If a user is under 18, consent must be obtained from a parent or legal guardian before registration, in accordance with Article 18(1)(d) of the GAID 2025. We do not knowingly collect data from children under 13 without verified parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or in applicable law. We will notify you of any material changes by email and/or by posting a notice prominently on the Platform at least 14 days before the changes take effect. Continued use of the Platform after the effective date constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="bg-gray-50 dark:bg-gray-700/50 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">14. Contact Us</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-600 pb-2">
                <span className="font-bold">Email (DPO)</span>
                <span className="font-bold text-indigo-600">palmtechdc@gmail.com</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-600 pb-2">
                <span className="font-bold">Platform</span>
                <span className="text-xs truncate max-w-[200px]">https://passmate-ai-538153425032.us-west1.run.app/</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-600 pb-2">
                <span className="font-bold">NDPC Complaint Portal</span>
                <span className="font-bold">ndpc.gov.ng</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">NDPC Helpline</span>
                <span className="font-bold">+234 (0) 800-NDPC-HELP</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/30 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                PassMate AI | Palmtech Digital Concept | Abuja, Nig
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
