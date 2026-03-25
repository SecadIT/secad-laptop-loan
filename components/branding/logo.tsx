import React from 'react';
import Image from 'next/image';

export const BrandingLogo = () => {
  return (
    <div className="flex items-center ">
      <Image
        src="/branding/SECAD Logo (Classic).jpg"
        alt="SECAD Logo"
        width={120}
        height={40}
        priority
        className="object-contain rounded"
      />
    </div>
  );
};
