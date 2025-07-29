import { useState } from 'react'
import { Bell, Shield, Palette, Camera, Mic, Globe, Lock, Save } from 'lucide-react'
import { useAuth } from '../App'
import Navbar from './Navbar'

const SettingsPage = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    messageNotifications: true,
    
    // Privacy
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    showStudyHistory: true,
    
    // Video & Audio
    defaultCamera: true,
    defaultMicrophone: false,
    videoQuality: 'high',
    
    // General
    theme: 'light',
    language: 'en',
    timezone: 'UTC-5'
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleSelect = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <Icon className="text-sky-500" size={20} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )

  const ToggleSetting = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <h3 className="font-medium text-gray-900">{label}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-sky-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const SelectSetting = ({ label, description, value, options, onChange }) => (
    <div className="py-2">
      <div className="mb-2">
        <h3 className="font-medium text-gray-900">{label}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your GenZce experience</p>
        </div>

        {/* Notifications */}
        <SettingSection title="Notifications" icon={Bell}>
          <ToggleSetting
            label="Email Notifications"
            description="Receive updates and reminders via email"
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <ToggleSetting
            label="Push Notifications"
            description="Get real-time notifications in your browser"
            checked={settings.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
          />
          <ToggleSetting
            label="Session Reminders"
            description="Get notified before scheduled study sessions"
            checked={settings.sessionReminders}
            onChange={() => handleToggle('sessionReminders')}
          />
          <ToggleSetting
            label="Message Notifications"
            description="Receive notifications for new messages"
            checked={settings.messageNotifications}
            onChange={() => handleToggle('messageNotifications')}
          />
        </SettingSection>

        {/* Privacy & Security */}
        <SettingSection title="Privacy & Security" icon={Shield}>
          <SelectSetting
            label="Profile Visibility"
            description="Control who can see your profile"
            value={settings.profileVisibility}
            options={[
              { value: 'public', label: 'Public - Anyone can see' },
              { value: 'friends', label: 'Friends only' },
              { value: 'private', label: 'Private - Only you' }
            ]}
            onChange={(value) => handleSelect('profileVisibility', value)}
          />
          <ToggleSetting
            label="Show Online Status"
            description="Let others see when you're online"
            checked={settings.showOnlineStatus}
            onChange={() => handleToggle('showOnlineStatus')}
          />
          <ToggleSetting
            label="Allow Direct Messages"
            description="Allow other users to send you direct messages"
            checked={settings.allowDirectMessages}
            onChange={() => handleToggle('allowDirectMessages')}
          />
          <ToggleSetting
            label="Show Study History"
            description="Display your study sessions on your profile"
            checked={settings.showStudyHistory}
            onChange={() => handleToggle('showStudyHistory')}
          />
        </SettingSection>

        {/* Video & Audio */}
        <SettingSection title="Video & Audio" icon={Camera}>
          <ToggleSetting
            label="Default Camera On"
            description="Turn on camera automatically when joining rooms"
            checked={settings.defaultCamera}
            onChange={() => handleToggle('defaultCamera')}
          />
          <ToggleSetting
            label="Default Microphone On"
            description="Turn on microphone automatically (disabled in camera-only mode)"
            checked={settings.defaultMicrophone}
            onChange={() => handleToggle('defaultMicrophone')}
          />
          <SelectSetting
            label="Video Quality"
            description="Choose your preferred video quality"
            value={settings.videoQuality}
            options={[
              { value: 'low', label: 'Low (360p)' },
              { value: 'medium', label: 'Medium (720p)' },
              { value: 'high', label: 'High (1080p)' }
            ]}
            onChange={(value) => handleSelect('videoQuality', value)}
          />
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="Appearance" icon={Palette}>
          <SelectSetting
            label="Theme"
            description="Choose your preferred theme"
            value={settings.theme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto (System)' }
            ]}
            onChange={(value) => handleSelect('theme', value)}
          />
          <SelectSetting
            label="Language"
            description="Select your preferred language"
            value={settings.language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' },
              { value: 'de', label: 'Deutsch' }
            ]}
            onChange={(value) => handleSelect('language', value)}
          />
          <SelectSetting
            label="Timezone"
            description="Set your local timezone"
            value={settings.timezone}
            options={[
              { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
              { value: 'UTC-7', label: 'Mountain Time (UTC-7)' },
              { value: 'UTC-6', label: 'Central Time (UTC-6)' },
              { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
              { value: 'UTC+0', label: 'GMT (UTC+0)' },
              { value: 'UTC+1', label: 'Central European Time (UTC+1)' }
            ]}
            onChange={(value) => handleSelect('timezone', value)}
          />
        </SettingSection>

        {/* Account Management */}
        <SettingSection title="Account" icon={Lock}>
          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </button>
            <button className="w-full text-left p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Download Data</h3>
              <p className="text-sm text-gray-600">Download a copy of your account data</p>
            </button>
            <button className="w-full text-left p-4 border border-red-300 rounded-xl hover:bg-red-50 transition-colors text-red-600">
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm">Permanently delete your account and all data</p>
            </button>
          </div>
        </SettingSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-sky-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage