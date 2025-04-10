export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''; // Google Client ID from environment variable
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''; // Google API Key from environment variable
export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send', 
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');	