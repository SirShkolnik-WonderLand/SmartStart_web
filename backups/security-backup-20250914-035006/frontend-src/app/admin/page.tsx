'use client'

import React from 'react'
import { Shield, Users, Settings, BarChart3, Database, FileText } from 'lucide-react'

export default function AdminPage() {
  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-green-500'
    },
    {
      title: 'Analytics & Reports',
      description: 'View system analytics and generate reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Database Management',
      description: 'Manage database operations and maintenance',
      icon: Database,
      href: '/admin/database',
      color: 'bg-orange-500'
    },
    {
      title: 'Legal Documents',
      description: 'Manage legal documents and compliance',
      icon: FileText,
      href: '/admin/legal',
      color: 'bg-red-500'
    },
    {
      title: 'Security & Audit',
      description: 'Monitor security and audit logs',
      icon: Shield,
      href: '/admin/security',
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            System administration and management tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mr-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <a
                  href={section.href}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Access Section →
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
