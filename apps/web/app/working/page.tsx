export default function WorkingPage() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 SUCCESS!</h1>
        <p className="text-gray-600 mb-4">The server is working correctly!</p>
        <p className="text-sm text-gray-500 mb-6">
          If you can see this page, Next.js routing is functional.
        </p>
        <div className="space-y-2">
          <a 
            href="/" 
            className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </a>
          <a 
            href="/create" 
            className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Create (PRD Builder)
          </a>
        </div>
      </div>
    </div>
  );
}
