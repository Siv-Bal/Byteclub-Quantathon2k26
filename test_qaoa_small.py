import numpy as np
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.primitives import StatevectorSampler as Sampler
from qiskit_algorithms.minimum_eigensolvers import QAOA
from qiskit_algorithms.optimizers import COBYLA

cost_matrix = [[1.2, 2.5], [0.8, 1.1], [5.1, 2.2]]
weights = [5.0, 3.0]

num_assets = 3
num_incidents = 2
cost_matrix = np.array(cost_matrix)
weights = np.array(weights)
qp = QuadraticProgram(name="Q-Rescue")

for i in range(num_assets):
    for j in range(num_incidents):
        qp.binary_var(name=f"x_{i}_{j}")
        
linear_objectives = {}
for i in range(num_assets):
    for j in range(num_incidents):
        linear_objectives[f"x_{i}_{j}"] = float(cost_matrix[i, j] * weights[j])
qp.minimize(linear=linear_objectives)

for j in range(num_incidents):
    constraint_dict = {f"x_{i}_{j}": 1.0 for i in range(num_assets)}
    qp.linear_constraint(linear=constraint_dict, sense="==", rhs=1.0, name=f"inc_{j}")

for i in range(num_assets):
    constraint_dict = {f"x_{i}_{j}": 1.0 for j in range(num_incidents)}
    qp.linear_constraint(linear=constraint_dict, sense="<=", rhs=1.0, name=f"ast_{i}")

print("Solving QAOA...")
try:
    sampler = Sampler()
    optimizer = COBYLA(maxiter=5)
    qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=1)
    optimizer_backend = MinimumEigenOptimizer(qaoa)
    result = optimizer_backend.solve(qp)
    print("Success:", result.fval)
except Exception as e:
    print("Failed:", e)
