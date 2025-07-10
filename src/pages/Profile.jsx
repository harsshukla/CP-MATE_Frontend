import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  
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

    // Only send non-empty fields
    const dataToSend = {}
    if (profileForm.name) dataToSend.name = profileForm.name
    if (profileForm.bio) dataToSend.bio = profileForm.bio
    if (profileForm.location) dataToSend.location = profileForm.location
    if (profileForm.website) dataToSend.website = profileForm.website

    try {
      const response = await userAPI.updateProfile(dataToSend)
      updateUser({ ...user, profile: response.data.profile })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error ||
          (error.response?.data?.errors?.[0]?.msg || 'Failed to update profile')
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

  const handleDeleteAccount = async () => {
    setDeleteError('')
    if (!deletePassword) {
      setDeleteError('Password is required to delete your account.')
      return;
    }
    setDeleting(true)
    try {
      await userAPI.deleteAccount(deletePassword)
      localStorage.removeItem('token')
      setDeleting(false)
      setDeleteDialogOpen(false)
      navigate('/login')
    } catch (error) {
      setDeleting(false)
      setDeleteError(error.response?.data?.error || 'Failed to delete account')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
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
      <div className="card bg-white dark:bg-gray-800">
        <div className="card-header bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Platform Handles</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Connect your competitive programming accounts to fetch your stats
          </p>
        </div>
        <div className="card-body bg-white dark:bg-gray-800">
          <form onSubmit={handleHandlesSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="input bg-gray-50 dark:bg-gray-800"
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
                  className="input bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? 'Updating...' : 'Update Handles'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card bg-white dark:bg-gray-800">
        <div className="card-header bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
        </div>
        <div className="card-body bg-white dark:bg-gray-800">
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
                  className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
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
                  className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
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
                  className="input bg-gray-50 dark:bg-gray-800"
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
                  className="input bg-gray-50 dark:bg-gray-800"
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
                  className="input bg-gray-50 dark:bg-gray-800 resize-none"
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
                  className="input bg-gray-50 dark:bg-gray-800"
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
      <div className="card bg-white dark:bg-gray-800">
        <div className="card-header bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h3>
        </div>
        <div className="card-body bg-white dark:bg-gray-800">
          <div className="space-y-4">
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
            <button className="btn-danger" onClick={() => setDeleteDialogOpen(true)} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Confirm Account Deletion</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
            <input
              type="password"
              className="input mb-2"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              disabled={deleting}
            />
            {deleteError && <p className="text-sm text-red-600 mb-2">{deleteError}</p>}
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => { setDeleteDialogOpen(false); setDeletePassword(''); setDeleteError(''); }} disabled={deleting}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile 