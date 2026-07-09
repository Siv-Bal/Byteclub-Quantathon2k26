from backend.quantum_engine import QuantumAllocationEngine
import time

cost_matrix = [[1.2, 2.5, 3.1], [0.8, 1.1, 4.2], [5.1, 2.2, 1.1], [3.3, 4.4, 2.1]]
weights = [5.0, 3.0, 4.0]

print("Initializing engine...")
engine = QuantumAllocationEngine(
    num_assets=4,
    num_incidents=3,
    cost_matrix=cost_matrix,
    weights=weights
)

print("Running QAOA...")
start_q = time.perf_counter()
quantum_results = engine.solve_with_qaoa()
end_q = time.perf_counter()

print("QAOA Results:", quantum_results)

print("Running Classical...")
start_c = time.perf_counter()
classical_results = engine.solve_classical_baseline()
end_c = time.perf_counter()

print("Classical Results:", classical_results)
