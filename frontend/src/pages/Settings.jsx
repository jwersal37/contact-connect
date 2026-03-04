export default function Settings() {
  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Email Integration */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Integration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your email to automatically track conversations with your contacts.
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium">
            Connect Gmail
          </button>
        </div>

        {/* Notifications */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Reminders</p>
                <p className="text-sm text-gray-500">Receive email notifications for overdue contacts</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Browser Notifications</p>
                <p className="text-sm text-gray-500">Get push notifications in your browser</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Reminder Interval (days)
              </label>
              <input
                type="number"
                min="1"
                defaultValue="30"
                className="w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account</h3>
          <div className="space-y-3">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Change Password
            </button>
            <br />
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
