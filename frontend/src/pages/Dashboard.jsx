import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useContactStore } from '../store/contactStore'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, TrendingUp, Users, Clock } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { contacts, loadContacts } = useContactStore()
  const [overdueContacts, setOverdueContacts] = useState([])

  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user])

  useEffect(() => {
    // Calculate overdue contacts
    const now = new Date()
    const overdue = contacts.filter(contact => {
      const lastContactDate = new Date(contact.lastContact)
      const daysSinceContact = Math.floor((now - lastContactDate) / (1000 * 60 * 60 * 24))
      return daysSinceContact > (contact.reminderInterval || 30)
    })
    setOverdueContacts(overdue)
  }, [contacts])

  const stats = [
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Need Attention',
      value: overdueContacts.length,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      name: 'This Week',
      value: contacts.filter(c => {
        const lastContact = new Date(c.lastContact)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return lastContact >= weekAgo
      }).length,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your relationship overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Contacts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-red-500" />
            Contacts Needing Attention
          </h3>
          
          {overdueContacts.length === 0 ? (
            <p className="text-gray-500">Great job! You're all caught up. 🎉</p>
          ) : (
            <div className="space-y-3">
              {overdueContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      {contact.email && (
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      )}
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      Last contact: {formatDistanceToNow(new Date(contact.lastContact), { addSuffix: true })}
                    </span>
                  </div>
                  {contact.notes && (
                    <p className="mt-2 text-sm text-gray-600">{contact.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
