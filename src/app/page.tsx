import React from 'react';
import Link from 'next/link';
import { portals } from '@/config/portals';

export default function PortalSelectorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50">
      <div className="max-w-4xl w-full flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
            SafePickup Ecosystem
          </h1>
          <p className="text-xl text-zinc-600">
            Select a portal mock environment below to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(portals).map((portal) => (
            <Link 
              key={portal.id} 
              href={portal.basePath}
              className="flex flex-col items-center gap-4 p-8 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${portal.themeClass} bg-primary shadow-sm`}
              >
                {/* Note: Icon usage via mapping is simplified for structural purposes */}
                <span className="font-bold text-2xl">{portal.name[0]}</span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">{portal.name}</h2>
                <p className="text-zinc-500 mt-2 text-sm">Enter the {portal.name.toLowerCase()} view.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
