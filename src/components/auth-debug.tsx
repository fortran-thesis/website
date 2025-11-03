"use client";

import { useEffect, useState } from 'react';
import { getAuthToken, getUserData } from '@/utils/auth';

/**
 * Debug component to check authentication status
 */
export default function AuthDebug() {
  const [authInfo, setAuthInfo] = useState({
    cookies: '',
    userData: null as any,
    token: '',
    hasToken: false,
  });

  useEffect(() => {
    const cookies = document.cookie;
    const user = getUserData();
    const token = getAuthToken();

    setAuthInfo({
      cookies: cookies || 'NO COOKIES',
      userData: user,
      token: token || 'NO TOKEN',
      hasToken: !!token,
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md border border-white/20 z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 Auth Debug Info</h3>
      <div className="space-y-2 font-mono">
        <div className="p-2 bg-blue-900/50 rounded">
          <div className="text-blue-300 font-bold">Firebase Functions (Cross-Origin)</div>
          <div className="text-xs text-gray-400 mt-1">
            Backend returns session token → Stored client-side
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">Has Auth Token:</span>{' '}
          <span className={authInfo.hasToken ? 'text-green-400' : 'text-red-400'}>
            {authInfo.hasToken ? '✓ YES' : '✗ NO'}
          </span>
        </div>

        <div>
          <span className="text-gray-400">Token (first 40 chars):</span>
          <pre className="text-xs text-blue-400 mt-1 break-all">
            {authInfo.token.substring(0, 40)}...
          </pre>
        </div>
        
        <div>
          <span className="text-gray-400">User Data:</span>{' '}
          <span className={authInfo.userData ? 'text-green-400' : 'text-gray-500'}>
            {authInfo.userData ? '✓ Present' : '✗ None'}
          </span>
        </div>
        
        <div className="pt-2 border-t border-white/20">
          <span className="text-gray-400">All Cookies:</span>
          <pre className="text-xs text-purple-400 mt-1 break-all whitespace-pre-wrap max-h-16 overflow-auto">
            {authInfo.cookies}
          </pre>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/20 text-gray-400 text-xs">
        <div className="text-yellow-400">Should see "authToken=..." in cookies above</div>
      </div>
    </div>
  );
}
