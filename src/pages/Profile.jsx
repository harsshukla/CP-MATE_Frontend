import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import { CheckCircle, AlertCircle } from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || ''
  })
  
  const [handlesForm, setHandlesForm] = useState({
    leetcode: user?.handles?.leetcode || '',
    codeforces: user?.handles?.codeforces || ''
  })

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleHandlesChange = (e) => {
    const { name, value } = e.target
    setHandlesForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await userAPI.updateProfile(profileForm)
      updateUser({ ...user, profile: response.data.profile })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleHandlesSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await userAPI.updateHandles(handlesForm)
      updateUser({ ...user, handles: response.data.handles })
      setMessage({ type: 'success', text: 'Handles updated successfully! You can now refresh your stats.' })
      window.dispatchEvent(new Event('handlesUpdated'))
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update handles' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            )}
            <p className={`text-sm ${
              message.type === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Platform Handles */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Platform Handles</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Connect your competitive programming accounts to fetch your stats
          </p>
        </div>
        <div className="card-body">
          <form onSubmit={handleHandlesSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LeetCode Handle
                </label>
                <input
                  type="text"
                  name="leetcode"
                  value={handlesForm.leetcode}
                  onChange={handleHandlesChange}
                  placeholder="Enter your LeetCode username"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  name="codeforces"
                  value={handlesForm.codeforces}
                  onChange={handleHandlesChange}
                  placeholder="Enter your Codeforces handle"
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Updating...' : 'Update Handles'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="input bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your display name"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleProfileChange}
                  placeholder="Enter your location"
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself..."
                  className="input resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={profileForm.website}
                  onChange={handleProfileChange}
                  placeholder="https://your-website.com"
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select className="input">
                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your progress</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="btn-primary">
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-800">
        <div className="card-header border-red-200 dark:border-red-800">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Danger Zone</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete Account</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button className="btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 