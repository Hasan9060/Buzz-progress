'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppData, StudentWithRank } from './types';
import { loadData, saveData, exportData, importData, calculateRanks, getStarRating } from './utils/dataManager';
import { StudentTable } from './components/StudentTable';
import { AdminPanel } from './components/AdminPanel';

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Admin password - you can change this
  const ADMIN_PASSWORD = 'Buzz9060';

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showCROnly, setShowCROnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'percentage'>('rank');

  useEffect(() => {
    loadData().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);

  const handleSaveData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const handleAdminClick = () => {
    setShowPasswordPrompt(true);
    setPasswordInput('');
    setPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setShowPasswordPrompt(false);
      setShowAdmin(true);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleUpdatePercentage = (studentId: string, newPercentage: number) => {
    if (!data) return;

    const updatedData = {
      ...data,
      students: data.students.map(s =>
        s.id === studentId ? { ...s, percentage: newPercentage } : s
      )
    };

    handleSaveData(updatedData);
  };

  const handleExport = () => {
    if (data) exportData(data);
  };

  const handleImport = async (file: File) => {
    try {
      const importedData = await importData(file);
      handleSaveData(importedData);
      alert('Data imported successfully!');
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  const rankedStudents = useMemo(() => {
    if (!data) return [];
    return calculateRanks(data);
  }, [data]);

  const filteredStudents = useMemo(() => {
    let filtered = [...rankedStudents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.groupName.toLowerCase().includes(query) ||
        (student.isCR && 'cr'.includes(query))
      );
    }

    // Group filter
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(student => student.groupId === selectedGroup);
    }

    // CR filter
    if (showCROnly) {
      filtered = filtered.filter(student => student.isCR);
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'percentage') {
      filtered.sort((a, b) => b.percentage - a.percentage);
    }
    // 'rank' is already sorted by default

    return filtered;
  }, [rankedStudents, searchQuery, selectedGroup, showCROnly, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg md:text-xl font-semibold text-gray-700">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg md:text-xl font-semibold text-red-600">Failed to load data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎓 Student Progress Tracker
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-700">Track and manage student performance across all fields</p>
        </div>

        {/* Admin Button */}
        <div className="flex justify-end mb-4 md:mb-6">
          <button
            onClick={handleAdminClick}
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-sm md:text-base"
          >
            ⚙️ Admin Panel
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                🔍 Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, field, or CR..."
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              />
            </div>

            {/* Field Filter */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                👥 Field
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              >
                <option value="all">All Fields</option>
                {data.groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                📊 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rank' | 'name' | 'percentage')}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              >
                <option value="rank">Rank</option>
                <option value="percentage">Percentage</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* CR Filter Toggle */}
          <div className="mt-3 md:mt-4">
            <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showCROnly}
                onChange={(e) => setShowCROnly(e.target.checked)}
                className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="font-semibold text-gray-700 text-sm md:text-base">Show Class Representatives Only</span>
            </label>
          </div>

          {/* Results Count */}
          <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
            Showing <span className="font-bold text-indigo-600">{filteredStudents.length}</span> of{' '}
            <span className="font-bold">{rankedStudents.length}</span> students
          </div>
        </div>

        {/* Student Table */}
        <StudentTable
          students={filteredStudents}
          starThresholds={data.settings.starThresholds}
          getStarRating={getStarRating}
          onUpdatePercentage={handleUpdatePercentage}
        />
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Admin Access</h2>
              <p className="text-sm md:text-base text-gray-600">Please enter the admin password to continue</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                  placeholder="Enter password"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-base"
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdmin && (
        <AdminPanel
          data={data}
          onSave={handleSaveData}
          onExport={handleExport}
          onImport={handleImport}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}
