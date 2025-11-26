import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { profileAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, Package, Lock } from 'lucide-react';

const Profile = () => {
  const { isAuthenticated, user: currentUser, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        if (response.success && response.data) {
          setProfile({
            name: response.data.name || '',
            email: response.data.email || '',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, toast]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await profileAPI.updateProfile(profile);
      
      if (response.success && response.data) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
        
        // Update auth context if email changed
        if (response.data.email !== currentUser?.email) {
          // Re-login might be needed if email changed
          toast({
            title: 'Email changed',
            description: 'Please sign in again with your new email',
          });
          // You might want to handle logout and redirect to login here
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }

    // Validate password requirements
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      toast({
        title: 'Password validation failed',
        description: 'Password must contain at least one uppercase letter',
        variant: 'destructive',
      });
      return;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      toast({
        title: 'Password validation failed',
        description: 'Password must contain at least one lowercase letter',
        variant: 'destructive',
      });
      return;
    }

    // Check for number
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      toast({
        title: 'Password validation failed',
        description: 'Password must contain at least one number',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);
      const response = await profileAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      if (response.success) {
        toast({
          title: 'Password changed',
          description: 'Your password has been changed successfully',
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      let errorMessage = error.message || 'Failed to change password';
      
      // Check if it's a validation error with details
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map((err: any) => {
          if (err.path && err.path.length > 0) {
            return `${err.path.join('.')}: ${err.message}`;
          }
          return err.message;
        }).join(', ');
        errorMessage = validationErrors || errorMessage;
      } else if (error.errorData) {
        // Log the full error data for debugging
        console.error('Error data:', error.errorData);
        if (error.errorData.errors && Array.isArray(error.errorData.errors)) {
          const validationErrors = error.errorData.errors.map((err: any) => {
            const path = err.path ? err.path.join('.') : '';
            return path ? `${path}: ${err.message}` : err.message;
          }).join(', ');
          errorMessage = validationErrors || error.errorData.message || errorMessage;
        } else {
          errorMessage = error.errorData.message || errorMessage;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/profile">
                  <Button variant="default" className="w-full justify-start">
                    Profile Information
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Order History
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                {showPasswordForm ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                      {passwordForm.newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className={`text-xs ${passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                            {passwordForm.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                          </div>
                          <div className={`text-xs ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                            {/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '○'} One uppercase letter
                          </div>
                          <div className={`text-xs ${/[a-z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                            {/[a-z]/.test(passwordForm.newPassword) ? '✓' : '○'} One lowercase letter
                          </div>
                          <div className={`text-xs ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                            {/[0-9]/.test(passwordForm.newPassword) ? '✓' : '○'} One number
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={changingPassword}>
                        {changingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button onClick={() => setShowPasswordForm(true)} variant="outline">
                    Change Password
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;

