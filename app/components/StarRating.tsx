'use client';

import React from 'react';

interface StarRatingProps {
    stars: number;
    maxStars?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ stars, maxStars = 5 }) => {
    return (
        <div className="flex gap-1">
            {Array.from({ length: maxStars }).map((_, index) => (
                <svg
                    key={index}
                    className={`w-4 h-4 md:w-5 md:h-5 ${index < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
};
