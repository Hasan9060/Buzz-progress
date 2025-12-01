import { AppData, StudentWithRank } from '../types';

const STORAGE_KEY = 'studentProgressData';

/**
 * Load data from localStorage if available, otherwise from /data.json
 */
export const loadData = async (): Promise<AppData> => {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  }

  // Fetch from public/data.json with cache disabled (always fresh)
  const response = await fetch('/data.json', { cache: 'no-store' });
  const data: AppData = await response.json();

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
};

/**
 * Save updated data to localStorage
 */
export const saveData = (data: AppData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

/**
 * Export current data as JSON file
 */
export const exportData = (data: AppData): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-progress-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Import data from JSON file
 */
export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as AppData);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Calculate student ranks based on percentage
 */
export const calculateRanks = (data: AppData): StudentWithRank[] => {
  const studentsWithGroups: StudentWithRank[] = data.students.map((student) => {
    const group = data.groups.find((g) => g.id === student.groupId);
    return {
      ...student,
      groupName: group?.name || 'Unknown',
      isCR: group?.cr === student.id,
      rank: 0
    };
  });

  // Sort by percentage descending, then by name ascending
  const sorted = [...studentsWithGroups].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return a.name.localeCompare(b.name);
  });

  // Assign ranks
  let currentRank = 1;
  sorted.forEach((student, index) => {
    if (index > 0 && sorted[index - 1].percentage !== student.percentage) {
      currentRank = index + 1;
    }
    student.rank = currentRank;
  });

  return sorted;
};

/**
 * Get star rating based on thresholds
 */
export const getStarRating = (percentage: number, thresholds: number[]): number => {
  for (let i = 0; i < thresholds.length; i++) {
    if (percentage <= thresholds[i]) return i + 1;
  }
  return thresholds.length;
};
