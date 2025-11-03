'use client';

import SwiftSwiftUI from '../src/components/Swift/SwiftUI';
import CreateSwiftUIProjectStructure from '../src/components/Create SwiftUI Project Structure';
import TripManagementInterface from '../src/components/Trip Management Interface';
import ConflictResolutionInterface from '../src/components/Conflict Resolution Interface';
import WeatherForecastDisplay from '../src/components/Weather Forecast Display';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Generated App</h1>
                <div className="mb-8">
          <SwiftSwiftUI />
        </div>
        <div className="mb-8">
          <CreateSwiftUIProjectStructure />
        </div>
        <div className="mb-8">
          <TripManagementInterface />
        </div>
        <div className="mb-8">
          <ConflictResolutionInterface />
        </div>
        <div className="mb-8">
          <WeatherForecastDisplay />
        </div>
      </div>
    </main>
  )
}
