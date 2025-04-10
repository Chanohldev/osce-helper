import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../config/google';
import { gmailService, Email } from '../services/gmailService';
import './Gmail.css';

export const Gmail = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
    }
  }, [isAuthenticated]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEmails = await gmailService.getEmails();
      setEmails(fetchedEmails);
    } catch (err) {
      setError('Error fetching emails. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (credentialResponse: any) => {
    gmailService.setAccessToken(credentialResponse.credential);
    setIsAuthenticated(true);
  };

  const handleLoginError = () => {
    setError('Login failed. Please try again.');
  };

  return (
    <div className="gmail-container">
      {!isAuthenticated ? (
        <div className="login-container">
          <h2>Welcome to Gmail Integration</h2>
          <div className="google-login-button">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              useOneTap
              theme="filled_blue"
              size="large"
              shape="rectangular"
              text="signin_with"
              logo_alignment="left"
            />
          </div>
        </div>
      ) : (
        <div className="emails-container">
          <h2>Your Emails</h2>
          {loading ? (
            <p>Loading emails...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="email-list">
              {emails.map((email) => (
                <div key={email.id} className="email-item">
                  <h3>{email.subject}</h3>
                  <p className="email-from">From: {email.from}</p>
                  <p className="email-date">{new Date(email.date).toLocaleString()}</p>
                  <p className="email-snippet">{email.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 