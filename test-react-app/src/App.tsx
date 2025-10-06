import React from 'react'
import D3ForcePacking from './components/D3ForcePacking'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            D3 Force Packing - Local Test
          </h1>
          <p className="text-gray-600 mt-1">
            Testing responsive D3 component integration
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Benefits Section - Simulating Lovable Structure */}
        <section className="py-24 overflow-x-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Cerebral Node Distribution
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the power of distributed computing with our innovative node architecture. 
                Watch as nodes dynamically organize themselves for optimal performance.
              </p>
            </div>
          </div>
          
          {/* D3 Component - Outside container for full width */}
          <div className="w-full h-[600px] bg-white rounded-lg shadow-lg">
            <D3ForcePacking className="w-full h-full rounded-lg" />
          </div>
        </section>

        {/* Debug Info */}
        <section className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Breakpoints</h4>
              <ul className="space-y-1 text-gray-600">
                <li>xs: 0-639px (Stacked)</li>
                <li>sm: 640-767px (Stacked)</li>
                <li>md: 768-1023px (Hybrid 50/50)</li>
                <li>lg: 1024-1279px (Dual)</li>
                <li>xl: 1280-1535px (Dual)</li>
                <li>2xl: 1536px+ (Dual)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✅ Container-based dimensions</li>
                <li>✅ ResizeObserver responsive updates</li>
                <li>✅ Tailwind breakpoint alignment</li>
                <li>✅ Mobile-optimized layouts</li>
                <li>✅ DAG overlay animation</li>
                <li>✅ Clean UI toggle</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            D3 Force Packing Test Environment - Ready for Lovable Integration
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
