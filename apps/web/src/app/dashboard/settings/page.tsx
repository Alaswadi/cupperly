'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { settingsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Save,
  Eye,
  EyeOff,
  Bot,
  Key
} from 'lucide-react';

export default function SettingsPage() {
  const { user, organization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    organizationName: '',
    organizationDescription: '',
    timezone: '',
    language: '',
    emailNotifications: true,
    pushNotifications: false,
    aiProvider: 'gemini',
    geminiApiKey: '',
    openRouterApiKey: '',
    openRouterModel: 'anthropic/claude-3.5-sonnet',
  });
  const [availableModels, setAvailableModels] = useState<Array<{id: string, name: string, description: string}>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (user && organization) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        organizationName: organization.name || '',
        organizationDescription: organization.description || '',
      }));
    }
  }, [user, organization]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      if (response.success) {
        const settings = response.data || {};
        setFormData(prev => ({
          ...prev,
          aiProvider: settings.aiProvider || 'gemini',
          geminiApiKey: settings.geminiApiKey || '',
          openRouterApiKey: settings.openRouterApiKey || '',
          openRouterModel: settings.openRouterModel || 'anthropic/claude-3.5-sonnet',
        }));

        // Load models if OpenRouter is selected and API key exists
        if (settings.aiProvider === 'openrouter' && settings.openRouterApiKey) {
          loadOpenRouterModels(settings.openRouterApiKey);
        }
      } else {
        console.error('Failed to load settings:', response.error?.message);
        toast.error('Failed to load settings');
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'organization', name: 'Organization', icon: Building },
    { id: 'ai', name: 'AI Integration', icon: Bot },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

  const loadOpenRouterModels = async (apiKey: string) => {
    if (!apiKey) return;

    setLoadingModels(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for popular models suitable for text generation
        const popularModels = data.data.filter((model: any) =>
          model.id.includes('claude') ||
          model.id.includes('gpt') ||
          model.id.includes('gemini') ||
          model.id.includes('llama') ||
          model.id.includes('mistral')
        ).map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description || `${model.id} model`
        }));

        setAvailableModels(popularModels);
        if (popularModels.length > 0) {
          toast.success('Models loaded successfully!');
        }
      } else {
        throw new Error(`Failed to load models: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to load OpenRouter models:', error);
      toast.error('Failed to load OpenRouter models. Please check your API key.');
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Load models when OpenRouter API key is entered
    if (field === 'openRouterApiKey' && typeof value === 'string' && value.length > 10) {
      loadOpenRouterModels(value);
    }
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      if (section === 'ai') {
        // Validate required fields
        if (formData.aiProvider === 'gemini' && !formData.geminiApiKey) {
          toast.error('Please enter your Gemini API key');
          return;
        }
        if (formData.aiProvider === 'openrouter' && !formData.openRouterApiKey) {
          toast.error('Please enter your OpenRouter API key');
          return;
        }

        const response = await settingsApi.updateSettings({
          aiProvider: formData.aiProvider,
          geminiApiKey: formData.geminiApiKey,
          openRouterApiKey: formData.openRouterApiKey,
          openRouterModel: formData.openRouterModel,
        });

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to save AI settings');
        }

        toast.success('AI settings saved successfully!');
      } else {
        // TODO: Implement actual save functionality for other sections
        console.log(`Saving ${section}:`, formData);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`${section} settings saved successfully!`);
      }
    } catch (error: any) {
      console.error(`Failed to save ${section}:`, error);
      toast.error(error.message || `Failed to save ${section} settings`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account, organization, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-coffee-brown text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <p className="text-gray-600 mt-1">Update your personal information and profile details</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('profile')}
                    disabled={isLoading}
                    className="bg-coffee-brown hover:bg-coffee-dark text-white"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Organization Settings</h3>
                <p className="text-gray-600 mt-1">Manage your organization's information and settings</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="Enter organization name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="organizationDescription" className="text-sm font-medium text-gray-700">Description</Label>
                  <textarea
                    id="organizationDescription"
                    value={formData.organizationDescription}
                    onChange={(e) => handleInputChange('organizationDescription', e.target.value)}
                    placeholder="Enter organization description"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 focus:border-coffee-brown"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('organization')}
                    disabled={isLoading}
                    className="bg-coffee-brown hover:bg-coffee-dark text-white"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-coffee-brown" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Integration</h3>
                </div>
                <p className="text-gray-600 mt-1">Configure AI services for automated report generation and analysis</p>
              </div>
              <div className="p-6 space-y-6">
                {/* AI Provider Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">AI Provider</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.aiProvider === 'gemini'
                          ? 'border-coffee-brown bg-coffee-cream/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('aiProvider', 'gemini')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Google Gemini</h4>
                          <p className="text-sm text-gray-500">Advanced AI by Google</p>
                        </div>
                      </div>
                      {formData.aiProvider === 'gemini' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-coffee-brown rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.aiProvider === 'openrouter'
                          ? 'border-coffee-brown bg-coffee-cream/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('aiProvider', 'openrouter')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">OR</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">OpenRouter</h4>
                          <p className="text-sm text-gray-500">Access multiple AI models</p>
                        </div>
                      </div>
                      {formData.aiProvider === 'openrouter' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-coffee-brown rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gemini Configuration */}
                {formData.aiProvider === 'gemini' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="geminiApiKey" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Key className="h-4 w-4 text-coffee-brown" />
                        Gemini API Key
                      </Label>
                      <Input
                        id="geminiApiKey"
                        type="password"
                        value={formData.geminiApiKey}
                        onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
                        placeholder="Enter your Gemini API key"
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Get your API key from{' '}
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-coffee-brown hover:underline"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* OpenRouter Configuration */}
                {formData.aiProvider === 'openrouter' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="openRouterApiKey" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Key className="h-4 w-4 text-coffee-brown" />
                        OpenRouter API Key
                      </Label>
                      <Input
                        id="openRouterApiKey"
                        type="password"
                        value={formData.openRouterApiKey}
                        onChange={(e) => handleInputChange('openRouterApiKey', e.target.value)}
                        placeholder="Enter your OpenRouter API key"
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Get your API key from{' '}
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-coffee-brown hover:underline"
                        >
                          OpenRouter Dashboard
                        </a>
                        . OpenRouter provides access to multiple AI models including GPT-4, Claude, and more.
                      </p>
                    </div>

                    {/* Model Selection */}
                    {formData.openRouterApiKey && (
                      <div>
                        <Label htmlFor="openRouterModel" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Bot className="h-4 w-4 text-coffee-brown" />
                          AI Model
                        </Label>
                        {loadingModels ? (
                          <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-white flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-gray-600">Loading available models...</span>
                          </div>
                        ) : availableModels.length > 0 ? (
                          <select
                            id="openRouterModel"
                            value={formData.openRouterModel}
                            onChange={(e) => handleInputChange('openRouterModel', e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 focus:border-coffee-brown bg-white"
                          >
                            {availableModels.map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.name}
                              </option>
                            ))}
                          </select>
                        ) : formData.openRouterApiKey ? (
                          <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-white">
                            <p className="text-sm text-gray-600">
                              Unable to load models. Please check your API key or try again.
                            </p>
                          </div>
                        ) : null}

                        {availableModels.length > 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Choose the AI model that best fits your needs. Claude models excel at detailed analysis,
                            while GPT models offer creative insights.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('ai')}
                    disabled={isLoading}
                    className="bg-coffee-brown hover:bg-coffee-dark text-white"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                    Save AI Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <p className="text-gray-600 mt-1">Update your password and security preferences</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-coffee-brown"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('security')}
                    disabled={isLoading}
                    className="bg-coffee-brown hover:bg-coffee-dark text-white"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-gray-600 mt-1">Choose how you want to be notified about activities</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-brown"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pushNotifications}
                        onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-brown"></div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('notifications')}
                    disabled={isLoading}
                    className="bg-coffee-brown hover:bg-coffee-dark text-white"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'billing' || activeTab === 'preferences') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'billing' ? 'Billing & Subscription' : 'Preferences'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'billing'
                    ? 'Manage your subscription and billing information'
                    : 'Customize your application preferences'
                  }
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12 text-gray-500">
                  {activeTab === 'billing' ? (
                    <>
                      <div className="w-16 h-16 bg-coffee-cream/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-coffee-brown" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Management</h3>
                      <p>Billing and subscription management will be implemented here.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-coffee-cream/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="h-8 w-8 text-coffee-brown" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Application Preferences</h3>
                      <p>Language, timezone, and other preferences will be implemented here.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
