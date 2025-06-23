export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <h2>Daily Scribble Terms of Service</h2>
            
            <h3>1. Service Description</h3>
            <p>
              Daily Scribble is a safe, creative platform designed for children ages 4-16 to participate in 
              daily drawing challenges and share artwork in a moderated community environment.
            </p>
            
            <h3>2. Parental Consent (COPPA Compliance)</h3>
            <p>
              For children under 13, verifiable parental consent is required before any personal information 
              can be collected or shared. Parents can grant or revoke this consent at any time through their 
              parent dashboard.
            </p>
            
            <h3>3. User Conduct</h3>
            <p>
              Users agree to share only appropriate content suitable for children. All artwork is subject to 
              AI and manual moderation. Inappropriate content will be removed.
            </p>
            
            <h3>4. Content Moderation</h3>
            <p>
              We use AI-powered moderation and manual review to ensure all shared content is appropriate for 
              children. Content that violates our community guidelines will be removed.
            </p>
            
            <h3>5. Privacy and Data Protection</h3>
            <p>
              We collect minimal personal information and only with proper parental consent for children under 13. 
              See our Privacy Policy for detailed information about data collection and use.
            </p>
            
            <h3>6. Account Termination</h3>
            <p>
              Parents may delete their child's account at any time through the parent dashboard. We reserve the 
              right to suspend accounts that violate these terms.
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