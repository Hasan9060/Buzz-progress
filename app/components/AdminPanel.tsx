'use client';

import React, { useState } from 'react';
import { AppData, Student } from '../types';

interface AdminPanelProps {
    data: AppData;
    onSave: (data: AppData) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    data,
    onSave,
    onExport,
    onImport,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'students' | 'groups'>('students');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        groupId: data.groups[0]?.id || '',
        photo: '',
        percentage: 0
    });

    const handleAddStudent = () => {
        if (!formData.name || !formData.groupId) {
            alert('Please fill in all required fields');
            return;
        }

        const newStudent: Student = {
            id: `s${Date.now()}`,
            name: formData.name,
            groupId: formData.groupId,
            photo: formData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
            percentage: formData.percentage || 0
        };

        const updatedData = {
            ...data,
            students: [...data.students, newStudent]
        };

        onSave(updatedData);
        setFormData({ name: '', groupId: data.groups[0]?.id || '', photo: '', percentage: 0 });
        setIsAddingNew(false);
    };

    const handleUpdateStudent = () => {
        if (!editingStudent || !formData.name || !formData.groupId) {
            alert('Please fill in all required fields');
            return;
        }

        const updatedData = {
            ...data,
            students: data.students.map(s =>
                s.id === editingStudent.id
                    ? { ...s, ...formData }
                    : s
            )
        };

        onSave(updatedData);
        setEditingStudent(null);
        setFormData({ name: '', groupId: data.groups[0]?.id || '', photo: '', percentage: 0 });
    };

    const handleDeleteStudent = (studentId: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        const updatedData = {
            ...data,
            students: data.students.filter(s => s.id !== studentId),
            groups: data.groups.map(g =>
                g.cr === studentId ? { ...g, cr: null } : g
            )
        };

        onSave(updatedData);
    };

    const handleSetCR = (groupId: string, studentId: string) => {
        const student = data.students.find(s => s.id === studentId);
        if (student?.groupId !== groupId) {
            alert('Student must be in the same field to be assigned as CR');
            return;
        }

        const updatedData = {
            ...data,
            groups: data.groups.map(g =>
                g.id === groupId ? { ...g, cr: studentId } : g
            )
        };

        onSave(updatedData);
    };

    const handleRemoveCR = (groupId: string) => {
        const updatedData = {
            ...data,
            groups: data.groups.map(g =>
                g.id === groupId ? { ...g, cr: null } : g
            )
        };

        onSave(updatedData);
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    const startEdit = (student: Student) => {
        setEditingStudent(student);
        setFormData(student);
        setIsAddingNew(false);
    };

    const startAddNew = () => {
        setIsAddingNew(true);
        setEditingStudent(null);
        setFormData({ name: '', groupId: data.groups[0]?.id || '', photo: '', percentage: 0 });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col my-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl md:text-3xl font-bold">Admin Panel</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`flex-1 py-3 md:py-4 px-4 md:px-6 font-semibold text-sm md:text-base transition-colors ${activeTab === 'students'
                            ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`flex-1 py-3 md:py-4 px-4 md:px-6 font-semibold text-sm md:text-base transition-colors ${activeTab === 'groups'
                            ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Fields & CRs
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeTab === 'students' && (
                        <div className="space-y-4 md:space-y-6">
                            {/* Import/Export */}
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                <button
                                    onClick={onExport}
                                    className="px-4 md:px-6 py-2 md:py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg text-sm md:text-base"
                                >
                                    📥 Export Data
                                </button>
                                <label className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg cursor-pointer text-sm md:text-base">
                                    📤 Import Data
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileImport}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    onClick={startAddNew}
                                    className="px-4 md:px-6 py-2 md:py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors shadow-lg ml-auto text-sm md:text-base"
                                >
                                    ➕ Add New Student
                                </button>
                            </div>

                            {/* Add/Edit Form */}
                            {(isAddingNew || editingStudent) && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 rounded-2xl border-2 border-indigo-200">
                                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-indigo-900">
                                        {isAddingNew ? 'Add New Student' : 'Edit Student'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                                                placeholder="Enter student name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Percentage (0-100)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.percentage || 0}
                                                onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) || 0 })}
                                                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <button
                                            onClick={isAddingNew ? handleAddStudent : handleUpdateStudent}
                                            className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm md:text-base"
                                        >
                                            {isAddingNew ? 'Add Student' : 'Update Student'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingNew(false);
                                                setEditingStudent(null);
                                                setFormData({ name: '', groupId: data.groups[0]?.id || '', photo: '', percentage: 0 });
                                            }}
                                            className="px-4 md:px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-sm md:text-base"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Students List */}
                            <div className="space-y-3">
                                <h3 className="text-lg md:text-xl font-bold text-gray-800">All Students ({data.students.length})</h3>
                                {data.students.map(student => {
                                    const group = data.groups.find(g => g.id === student.groupId);
                                    return (
                                        <div
                                            key={student.id}
                                            className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-base md:text-lg truncate">{student.name}</h4>
                                                <p className="text-xs md:text-sm text-gray-600 truncate">{group?.name} • {student.percentage}%</p>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => startEdit(student)}
                                                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs md:text-sm font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs md:text-sm font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div className="space-y-4 md:space-y-6">
                            {data.groups.map(group => {
                                const groupStudents = data.students.filter(s => s.groupId === group.id);
                                const currentCR = groupStudents.find(s => s.id === group.cr);

                                return (
                                    <div key={group.id} className="bg-white border-2 border-indigo-200 rounded-2xl p-4 md:p-6">
                                        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-indigo-900">{group.name}</h3>

                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Current CR:</p>
                                            {currentCR ? (
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-green-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-green-800">{currentCR.name}</span>
                                                    <button
                                                        onClick={() => handleRemoveCR(group.id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                                    >
                                                        Remove CR
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">No CR assigned</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Students in this field:</p>
                                            <div className="space-y-2">
                                                {groupStudents.map(student => (
                                                    <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg gap-2">
                                                        <span className="font-medium">{student.name}</span>
                                                        {group.cr !== student.id && (
                                                            <button
                                                                onClick={() => handleSetCR(group.id, student.id)}
                                                                className="px-3 md:px-4 py-1 bg-indigo-500 text-white rounded-lg text-xs md:text-sm hover:bg-indigo-600 transition-colors w-full sm:w-auto"
                                                            >
                                                                Set as CR
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
