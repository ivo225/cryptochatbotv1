import type { NextPage } from 'next'

const Test: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This is a simple test page to verify Next.js routing.</p>
      <div className="mt-4">
        <a href="/" className="text-blue-400 hover:text-blue-300">
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default Test
