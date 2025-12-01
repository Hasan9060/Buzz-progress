'use client';

import React from 'react';
import { StudentWithRank } from '../types';
import { StarRating } from './StarRating';

interface StudentTableProps {
    students: StudentWithRank[];
    starThresholds: number[];
    getStarRating: (percentage: number, thresholds: number[]) => number;
    onEditStudent?: (student: StudentWithRank) => void;
    onUpdatePercentage?: (studentId: string, newPercentage: number) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
    students,
    starThresholds,
    getStarRating,
    onEditStudent,
    onUpdatePercentage
}) => {
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

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold">Rank</th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold">Name</th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold">Percentage</th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold">Rating</th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                        <tr
                            key={student.id}
                            className="hover:bg-indigo-50 transition-colors"
                        >
                            <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="flex items-center">
                                    <span className={`text-base md:text-lg font-bold ${student.rank === 1 ? 'text-yellow-500' :
                                            student.rank === 2 ? 'text-gray-400' :
                                                student.rank === 3 ? 'text-orange-500' :
                                                    'text-gray-700'
                                        }`}>
                                        #{student.rank}
                                    </span>
                                </div>
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="font-semibold text-gray-900 text-sm md:text-base">{student.name}</div>
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="flex items-center gap-1 md:gap-2">
                                    {/* Decrement Button */}
                                    <button
                                        onClick={(e) => handleDecrement(student, e)}
                                        disabled={student.percentage <= 0}
                                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                                        title="Decrease percentage"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div className="flex flex-col items-center gap-1 min-w-[60px] md:min-w-[80px]">
                                        <span className="text-lg md:text-2xl font-bold text-indigo-600">{student.percentage}%</span>
                                        <div className="bg-gray-200 rounded-full h-1.5 md:h-2 w-full">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                                                style={{ width: `${student.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Increment Button */}
                                    <button
                                        onClick={(e) => handleIncrement(student, e)}
                                        disabled={student.percentage >= 100}
                                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                                        title="Increase percentage"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4">
                                <StarRating stars={getStarRating(student.percentage, starThresholds)} />
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4">
                                {student.isCR && (
                                    <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                                        CR
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {students.length === 0 && (
                <div className="text-center py-8 md:py-12 text-gray-500 text-sm md:text-base">
                    No students found matching your criteria.
                </div>
            )}
        </div>
    );
};
