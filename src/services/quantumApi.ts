import * as turf from '@turf/turf';

interface Location {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  priority?: number; 
}

export interface OptimizationResponse {
  quantum: {
    allocations: Array<{ asset_index: number; incident_index: number }>;
    cost: number;
    execution_time_ms: number;
  };
  classical: {
    allocations: Array<{ asset_index: number; incident_index: number }>;
    cost: number;
    execution_time_ms: number;
  };
}

export async function requestQuantumOptimization(
  assets: Location[],
  incidents: Location[]
): Promise<OptimizationResponse> {
  
  // 1. Compute physical cost matrix on client using pre-installed @turf/turf
  const costMatrix: number[][] = [];
  for (const asset of assets) {
    const row: number[] = [];
    for (const incident of incidents) {
      const from = turf.point(asset.coordinates);
      const to = turf.point(incident.coordinates);
      // Distance calculated via Haversine formula in kilometers
      const distance = turf.distance(from, to, { units: 'kilometers' });
      row.push(distance);
    }
    costMatrix.push(row);
  }

  // 2. Extract relative weight criteria vector
  const weights = incidents.map(incident => incident.priority || 1.0);

  // 3. Dispatch payload to local FastAPI Quantum Pipeline
  const response = await fetch('http://localhost:8000/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      num_assets: assets.length,
      num_incidents: incidents.length,
      cost_matrix: costMatrix,
      weights: weights
    })
  });

  if (!response.ok) {
    throw new Error(`Quantum API internal connection fault: ${response.statusText}`);
  }

  return response.json();
}
