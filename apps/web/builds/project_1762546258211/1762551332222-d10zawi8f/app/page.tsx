'use client';

import { Rocket } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <Rocket className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your App is Ready!
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            The foundation has been built. Start adding your features and components to bring your vision to life.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Next Steps:
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                Add your first feature component
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                Configure your database and API connections
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                Customize the design system to match your brand
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
