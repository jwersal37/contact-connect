import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useContactStore } from '../store/contactStore'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Search, Trash2, Edit2, MessageCircle } from 'lucide-react'

export default function Contacts() {
  const { user } = useAuthStore()
  const { contacts, subscribeToContacts, unsubscribeFromContacts, addContact, deleteContact, logInteraction } = useContactStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    reminderInterval: 30,
    notes: '',
  })

  useEffect(() => {
    if (user) {
      subscribeToContacts(user.id)
    }
    
    // Cleanup: unsubscribe when component unmounts or user changes
    return () => {
      unsubscribeFromContacts()
    }
  }, [user])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddContact = async (e) => {
    e.preventDefault()
    const result = await addContact(user.id, newContact)
    if (result.success) {
      setShowAddModal(false)
      setNewContact({
        name: '',
        email: '',
        phone: '',
        reminderInterval: 30,
        notes: '',
      })
    }
  }

  const handleLogInteraction = async (contactId) => {
    const note = prompt('Add a note about this interaction (optional):')
    await logInteraction(contactId, {
      type: 'manual',
      note: note || '',
    })
  }

  const handleDelete = async (contactId, contactName) => {
    if (window.confirm(`Are you sure you want to delete ${contactName}?`)) {
      await deleteContact(contactId)
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-2 text-gray-600">Manage your relationships</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search contacts..."
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredContacts.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No contacts found. {searchQuery ? 'Try a different search.' : 'Add your first contact!'}
            </li>
          ) : (
            filteredContacts.map((contact) => (
              <li key={contact.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:space-x-4">
                      {contact.email && (
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Last contact: {formatDistanceToNow(new Date(contact.lastContact), { addSuffix: true })}
                      {' • '}
                      Remind every {contact.reminderInterval} days
                    </p>
                    {contact.notes && (
                      <p className="mt-2 text-sm text-gray-600">{contact.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLogInteraction(contact.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Log interaction"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="Edit contact"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id, contact.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete contact"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reminder Interval (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newContact.reminderInterval}
                  onChange={(e) => setNewContact({ ...newContact, reminderInterval: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  rows="3"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
                >
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
