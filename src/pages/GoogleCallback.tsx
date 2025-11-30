import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, profileAPI } from '../lib/api';
import { toast } from '@/components/ui/sonner';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google Sign-In Failed', {
          description: decodeURIComponent(error),
        });
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);
          
          // Get user profile to update auth context
          const profileResponse = await profileAPI.getProfile();
          if (profileResponse.success && profileResponse.data) {
            localStorage.setItem('user', JSON.stringify(profileResponse.data));
          }
          
          toast.success('Successfully signed in with Google!');
          navigate('/');
          
          // Reload to update auth state
          window.location.reload();
        } catch (err: any) {
          toast.error('Authentication Failed', {
            description: err.message || 'Failed to complete Google sign-in',
          });
          navigate('/login');
        }
      } else {
        toast.error('No token received', {
          description: 'Google authentication did not return a token',
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign-in...</h2>
        <p className="text-muted-foreground">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

