'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  shareToken: string;
}

export function CopyLinkButton({ shareToken }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/do/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyLink}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Đã sao chép
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Sao chép link
        </>
      )}
    </button>
  );
}
