export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">BuildRunner SaaS</h1>
        <p className="text-gray-600 mb-8">Welcome to the PRD Builder</p>
        <div className="space-y-4">
          <a
            href="/create"
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Create Page
          </a>
          <a
            href="/test"
            className="block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go to Test Page
          </a>
        </div>
      </div>
    </div>
  );
}
