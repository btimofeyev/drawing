export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <h2>Daily Scribble Privacy Policy</h2>
            
            <h3>1. Information We Collect</h3>
            <p>
              We collect minimal information necessary to provide our service. For children under 13, 
              we only collect information with verifiable parental consent as required by COPPA.
            </p>
            
            <h4>For Children:</h4>
            <ul>
              <li>Username and display name</li>
              <li>Age group (not specific age)</li>
              <li>4-digit PIN (encrypted)</li>
              <li>Artwork images and descriptions</li>
              <li>Activity data (uploads, likes, achievements)</li>
            </ul>
            
            <h4>For Parents:</h4>
            <ul>
              <li>Email address for authentication</li>
              <li>Parental consent status</li>
              <li>Account management activity</li>
            </ul>
            
            <h3>2. How We Use Information</h3>
            <p>
              We use collected information solely to provide the Daily Scribble service:
            </p>
            <ul>
              <li>Enable children to participate in daily drawing challenges</li>
              <li>Display artwork in our moderated community gallery</li>
              <li>Track achievements and progress</li>
              <li>Provide parental oversight tools</li>
              <li>Moderate content for child safety</li>
            </ul>
            
            <h3>3. COPPA Compliance</h3>
            <p>
              We comply with the Children's Online Privacy Protection Act (COPPA):
            </p>
            <ul>
              <li>Verifiable parental consent is required before collecting any personal information from children under 13</li>
              <li>Parents can review, delete, or refuse further collection of their child's information</li>
              <li>We do not collect more information than necessary for the service</li>
              <li>We do not share children's personal information with third parties</li>
              <li>Parents can revoke consent at any time through their dashboard</li>
            </ul>
            
            <h3>4. Data Security</h3>
            <p>
              We implement industry-standard security measures to protect all user data:
            </p>
            <ul>
              <li>Encrypted data transmission and storage</li>
              <li>Secure authentication systems</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information</li>
            </ul>
            
            <h3>5. Content Moderation</h3>
            <p>
              All shared artwork undergoes AI-powered and manual moderation to ensure appropriateness 
              for children. We may review content to maintain community safety standards.
            </p>
            
            <h3>6. Data Retention</h3>
            <p>
              We retain user data only as long as necessary to provide our service. Parents may 
              request deletion of their child's account and all associated data at any time.
            </p>
            
            <h3>7. Third-Party Services</h3>
            <p>
              We use trusted third-party services for essential functions:
            </p>
            <ul>
              <li>Supabase for secure data storage and authentication</li>
              <li>OpenAI for content moderation (no personal information is shared)</li>
              <li>Vercel for hosting and performance</li>
            </ul>
            
            <h3>8. Parental Rights</h3>
            <p>
              Parents have the right to:
            </p>
            <ul>
              <li>Review their child's personal information</li>
              <li>Request deletion of their child's account and data</li>
              <li>Refuse further collection or use of their child's information</li>
              <li>Grant or revoke consent for data collection at any time</li>
            </ul>
            
            <h3>9. Contact Information</h3>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your parental rights, 
              please contact us through your parent dashboard or our support channels.
            </p>
            
            <h3>10. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify parents of any 
              material changes and obtain new consent where required by law.
            </p>
            
            <p className="text-sm text-slate-600 mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}