import { authAPI } from '../services/api';

// Add export to make this a module
export {};

// Your auth utility code here...

export const handleGoogleReauthentication = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initiating Google re-authentication...');
    
    const response = await authAPI.reauthenticateGoogle();
    
    if (response.data.success) {
      console.log('✅ Invalid credentials cleared, redirecting to Google OAuth...');
      
      // Redirect to Google OAuth
      window.location.href = response.data.authUrl;
      return true;
    } else {
      console.error('❌ Failed to initiate re-authentication');
      return false;
    }
  } catch (error) {
    console.error('❌ Error during re-authentication:', error);
    return false;
  }
};

export const isGoogleAuthError = (error: any): boolean => {
  return error?.message?.includes('Google authentication expired') ||
         error?.response?.data?.error?.includes('Google authentication expired') ||
         error?.message?.includes('unauthorized_client');
};
