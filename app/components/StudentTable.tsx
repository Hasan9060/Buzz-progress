'use client';

import React, { useState } from 'react';
import { StudentWithRank } from '../types';
import { StarRating } from './StarRating';

interface StudentTableProps {
    students: StudentWithRank[];
    starThresholds: number[];
    getStarRating: (percentage: number, thresholds: number[]) => number;
    onEditStudent?: (student: StudentWithRank) => void;
    onUpdatePercentage?: (studentId: string, newPercentage: number) => void;
    mousePosition?: { x: number; y: number };
}

export const StudentTable: React.FC<StudentTableProps> = ({
    students,
    starThresholds,
    getStarRating,
    onEditStudent,
    onUpdatePercentage,
    mousePosition = { x: 0, y: 0 }
}) => {
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    const handleIncrement = (student: StudentWithRank, e: React.MouseEvent) => {
        e.stopPropagation();
        if (student.percentage < 100 && onUpdatePercentage) {
            onUpdatePercentage(student.id, Math.min(100, student.percentage + 1));
        }
    };

    const handleDecrement = (student: StudentWithRank, e: React.MouseEvent) => {
        e.stopPropagation();
        if (student.percentage > 0 && onUpdatePercentage) {
            onUpdatePercentage(student.id, Math.max(0, student.percentage - 1));
        }
    };

    // 3D transform based on mouse position
    const parallaxStyle = {
        transform: `perspective(1000px) rotateY(${mousePosition.x * 1}deg) rotateX(${-mousePosition.y * 1}deg)`,
        transition: 'transform 0.3s ease-out'
    };

    // Rank badge colors
    const getRankColor = (rank: number) => {
        switch(rank) {
            case 1: return 'from-yellow-500 via-amber-400 to-orange-500';
            case 2: return 'from-gray-400 via-gray-300 to-gray-400';
            case 3: return 'from-amber-600 via-orange-500 to-amber-600';
            default: return 'from-indigo-600 via-purple-500 to-indigo-600';
        }
    };

    const getRankIcon = (rank: number) => {
        switch(rank) {
            case 1: return '👑';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏆';
        }
    };

    return (
        <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4 pb-8">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                            selectedStudent === student.id ? 'ring-2 ring-cyan-500 scale-[1.02]' : ''
                        }`}
                        onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                        style={{
                            transform: `perspective(1000px) rotateY(${mousePosition.x * 2}deg) rotateX(${-mousePosition.y * 2}deg)`,
                            transition: 'all 0.3s ease-out'
                        }}
                    >
                        {/* Card background with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
                        
                        {/* Glow effect for top ranks */}
                        {student.rank <= 3 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 animate-pulse"></div>
                        )}

                        {/* Card content */}
                        <div className="relative p-4 space-y-4">
                            {/* Header with Rank and Name */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Rank Badge */}
                                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(student.rank)} flex items-center justify-center shadow-lg`}>
                                        <span className="text-lg font-bold text-white">{student.rank}</span>
                                        <div className="absolute -top-1 -right-1 text-xs">
                                            {getRankIcon(student.rank)}
                                        </div>
                                    </div>
                                    
                                    {/* Name and Field */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white truncate">{student.name}</h3>
                                        <p className="text-sm text-gray-400">{student.groupName}</p>
                                    </div>
                                </div>

                                {/* CR Badge */}
                                {student.isCR && (
                                    <div className="relative group">
                                        <div className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full text-xs font-bold text-white shadow-lg">
                                            CR
                                        </div>
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Class Representative
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Progress Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-300">Progress</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                        {student.percentage}%
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="relative h-2.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${student.percentage}%` }}
                                    >
                                        <div className="absolute right-0 top-0 w-1 h-full bg-white opacity-50 animate-pulse"></div>
                                    </div>
                                </div>

                            </div>

                            {/* Star Rating */}
                            <div className="pt-3 border-t border-gray-700/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-300">Performance Rating</span>
                                    <StarRating stars={getStarRating(student.percentage, starThresholds)} />
                                </div>
                            </div>

                            {/* Additional Info (on expand) */}
                            {selectedStudent === student.id && (
                                <div className="pt-4 mt-4 border-t border-gray-700/50 animate-slideDown">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800/50 rounded-xl p-3">
                                            <p className="text-xs text-gray-400">Field Rank</p>
                                            <p className="text-lg font-bold text-white">#{student.rank}</p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-xl p-3">
                                            <p className="text-xs text-gray-400">Star Rating</p>
                                            <p className="text-lg font-bold text-yellow-400">
                                                {getStarRating(student.percentage, starThresholds)} Stars
                                            </p>
                                        </div>
                                    </div>
                                    {onEditStudent && (
                                        <button
                                            onClick={() => onEditStudent(student)}
                                            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                                        >
                                            Edit Student
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Floating particles */}
                            <div className="absolute top-2 right-2">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-1 bg-cyan-400/50 rounded-full animate-float"
                                        style={{
                                            right: `${i * 4}px`,
                                            top: `${i * 4}px`,
                                            animationDelay: `${i * 0.3}s`
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {students.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full animate-pulse"></div>
                            <div className="absolute inset-4 bg-gray-900 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Students Found</h3>
                        <p className="text-gray-400">Try adjusting your search filters</p>
                    </div>
                )}
            </div>

            {/* Desktop View - Enhanced Table */}
            <div className="hidden md:block relative">
                {/* Table background with 3D effect */}
                <div 
                    className="overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm"
                    style={parallaxStyle}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80"></div>
                    
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 "></div>
                    
                    <div className="relative overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold">#</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-300">Rank</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-300">Student</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-300">Progress</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-300">Rating</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-300">Status</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {students.map((student) => (
                                    <tr 
                                        key={student.id} 
                                        className="group hover:bg-gray-800/30 transition-all duration-300"
                                        style={{
                                            transform: `translateX(${mousePosition.x * 2}px)`,
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                    >
                                        {/* Rank */}
                                        <td className="px-6 py-4">
                                            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(student.rank)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                <span className="text-lg font-bold text-white">{student.rank}</span>
                                                {student.rank <= 3 && (
                                                    <div className="absolute -top-2 -right-2 text-xl animate-bounce">
                                                        {getRankIcon(student.rank)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Student Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg font-bold text-gray-300">
                                                        {student.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                                        {student.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Progress */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                                        {student.percentage}%
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {student.percentage >= 90 ? 'Excellent' : 
                                                         student.percentage >= 75 ? 'Good' : 
                                                         student.percentage >= 50 ? 'Average' : 'Needs Improvement'}
                                                    </span>
                                                </div>
                                                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-700 group-hover:shadow-lg group-hover:shadow-cyan-500/30"
                                                        style={{ width: `${student.percentage}%` }}
                                                    >
                                                        <div className="absolute right-0 top-0 w-1 h-full bg-white/50 animate-pulse"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-2">
                                                <StarRating stars={getStarRating(student.percentage, starThresholds)} />
                                                <span className="text-xs text-gray-400">
                                                    {getStarRating(student.percentage, starThresholds)} star
                                                    {getStarRating(student.percentage, starThresholds) !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                {student.isCR && (
                                                    <div className="relative group">
                                                        <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full text-xs font-bold text-white shadow-lg inline-block">
                                                            Class Representative
                                                        </div>
                                                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                            Special privileges & responsibilities
                                                        </div>
                                                    </div>
                                                )}
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                                                    student.percentage >= 90 ? 'bg-green-900/30 text-green-400' :
                                                    student.percentage >= 75 ? 'bg-blue-900/30 text-blue-400' :
                                                    student.percentage >= 50 ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-red-900/30 text-red-400'
                                                }`}>
                                                    {student.percentage >= 90 ? 'Top Performer' : 
                                                     student.percentage >= 75 ? 'Above Average' : 
                                                     student.percentage >= 50 ? 'On Track' : 'Needs Support'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {students.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full blur-xl"></div>
                                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl">
                                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Students Found</h3>
                            <p className="text-gray-400 mb-6">Try adjusting your search filters or add new students</p>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-400">
                                    Showing <span className="font-bold text-white">{students.length}</span> students
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                Updated in real-time • Auto-saved
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating particles effect */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Add custom animations */}
            <style jsx global>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                
                
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `}</style>
        </>
    );
};