import numpy as np
import sys
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.primitives import StatevectorSampler as Sampler
from qiskit_algorithms.minimum_eigensolvers import QAOA
from qiskit_algorithms.optimizers import COBYLA

print("Starting execution...")

cost_matrix = [[1.2, 2.5, 3.1], [0.8, 1.1, 4.2], [5.1, 2.2, 1.1], [3.3, 4.4, 2.1]]
weights = [5.0, 3.0, 4.0]

num_assets = 4
num_incidents = 3
cost_matrix = np.array(cost_matrix)
weights = np.array(weights)
qp = QuadraticProgram(name="Q-Rescue_Allocation")

print("Building QUBO...")
for i in range(num_assets):
    for j in range(num_incidents):
        qp.binary_var(name=f"x_{i}_{j}")
        
linear_objectives = {}
for i in range(num_assets):
    for j in range(num_incidents):
        cost = float(cost_matrix[i, j] * weights[j])
        linear_objectives[f"x_{i}_{j}"] = cost
qp.minimize(linear=linear_objectives)

for j in range(num_incidents):
    constraint_dict = {f"x_{i}_{j}": 1.0 for i in range(num_assets)}
    qp.linear_constraint(linear=constraint_dict, sense="==", rhs=1.0, name=f"incident_coverage_{j}")

for i in range(num_assets):
    constraint_dict = {f"x_{i}_{j}": 1.0 for j in range(num_incidents)}
    qp.linear_constraint(linear=constraint_dict, sense="<=", rhs=1.0, name=f"asset_capacity_{i}")

print("Setting up QAOA...")
sampler = Sampler()
optimizer = COBYLA(maxiter=5)
qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=1)
optimizer_backend = MinimumEigenOptimizer(qaoa)

print("Solving QAOA...")
try:
    result = optimizer_backend.solve(qp)
    print("Solved successfully!", result.fval)
except Exception as e:
    print(f"Failed with exception: {e}")
