import { useState } from 'react';
import { Search, Filter, Download, Eye, Trash2 } from 'lucide-react';

export function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-secondary-900">Applications</h1>
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Applications List */}
          <div className="card">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-medium text-secondary-900">All Applications</h3>
            </div>
            <div className="divide-y divide-secondary-200">
              {/* Application Item */}
              <div className="p-6 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-secondary-900">John Doe</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary-600">
                      Applied for: Senior Frontend Developer
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-secondary-500">
                      <span>john.doe@example.com</span>
                      <span>•</span>
                      <span>Applied 2 hours ago</span>
                      <span>•</span>
                      <span>Resume attached</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary text-sm flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button className="btn-secondary text-sm flex items-center space-x-1 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Another Application Item */}
              <div className="p-6 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-secondary-900">Jane Smith</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Reviewed
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary-600">
                      Applied for: Backend Developer
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-secondary-500">
                      <span>jane.smith@example.com</span>
                      <span>•</span>
                      <span>Applied 1 day ago</span>
                      <span>•</span>
                      <span>Resume attached</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary text-sm flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button className="btn-secondary text-sm flex items-center space-x-1 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
