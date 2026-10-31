import React from 'react';

interface JungsanLogoProps {
  className?: string;
  size?: number;
}

export const JungsanLogo: React.FC<JungsanLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <img
      src="assets/aistudio/images_0069c149.png"
      alt="중산고등학교 로고"
      width={size}
      height={size}
      className={`shrink-0 object-contain rounded-full select-none ${className}`}
      loading="eager"
    />
  );
};
