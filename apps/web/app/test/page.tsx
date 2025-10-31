export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, routing is working!</p>
        <a href="/create" className="text-blue-600 hover:text-blue-800 underline">
          Go to Create Page
        </a>
      </div>
    </div>
  );
}
