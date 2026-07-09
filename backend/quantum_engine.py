import numpy as np
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.primitives import StatevectorSampler as Sampler
from qiskit_algorithms.minimum_eigensolvers import QAOA
from qiskit_algorithms.optimizers import COBYLA

class QuantumAllocationEngine:
    def __init__(self, num_assets: int, num_incidents: int, cost_matrix: list, weights: list):
        self.num_assets = num_assets
        self.num_incidents = num_incidents
        self.cost_matrix = np.array(cost_matrix) # Shape: (M, N)
        self.weights = np.array(weights)         # Shape: (N,)
        self.qp = QuadraticProgram(name="Q-Rescue_Allocation")
        
    def build_qubo(self):
        # 1. Define Binary Variables
        for i in range(self.num_assets):
            for j in range(self.num_incidents):
                self.qp.binary_var(name=f"x_{i}_{j}")
                
        # 2. Define Objective Function: Minimize Total Weighted Response Distance
        linear_objectives = {}
        for i in range(self.num_assets):
            for j in range(self.num_incidents):
                # Scale physical distance by emergency weight
                cost = float(self.cost_matrix[i, j] * self.weights[j])
                linear_objectives[f"x_{i}_{j}"] = cost
        self.qp.minimize(linear=linear_objectives)
        
        # 3. Constraint: Every incident MUST have exactly 1 responding asset
        for j in range(self.num_incidents):
            constraint_dict = {f"x_{i}_{j}": 1.0 for i in range(self.num_assets)}
            self.qp.linear_constraint(linear=constraint_dict, sense="==", rhs=1.0, name=f"incident_coverage_{j}")
            
        # 4. Constraint: An asset can handle at most 1 incident simultaneously
        for i in range(self.num_assets):
            constraint_dict = {f"x_{i}_{j}": 1.0 for j in range(self.num_incidents)}
            self.qp.linear_constraint(linear=constraint_dict, sense="<=", rhs=1.0, name=f"asset_capacity_{i}")

    def solve_with_qaoa(self):
        if self.num_assets * self.num_incidents > 8:
            # Safely fallback to classical solver to prevent Scipy C-extension segfault on Py3.13
            return self.solve_classical_baseline()
            
        self.build_qubo()
        
        # Initialize the Aer execution environment simulator
        sampler = Sampler()
        optimizer = COBYLA(maxiter=50)
        
        # Setup the QAOA solver configuration
        qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=2)
        optimizer_backend = MinimumEigenOptimizer(qaoa)
        
        # Execute optimization loop
        result = optimizer_backend.solve(self.qp)
        
        # Parse output vector back into asset allocation mapping arrays
        allocations = []
        for variable in result.variables:
            if variable.value == 1.0:
                # Variable string looks like "x_i_j"
                parts = variable.name.split("_")
                allocations.append({
                    "asset_index": int(parts[1]),
                    "incident_index": int(parts[2])
                })
                
        return {
            "status": "Success",
            "optimal_value": result.fval,
            "allocations": allocations
        }

    def solve_classical_baseline(self):
        """Fallback validation baseline using classical optimization."""
        from scipy.optimize import linear_sum_assignment
        # Formulate simple assignment problem matching matrix rows to columns
        row_ind, col_ind = linear_sum_assignment(self.cost_matrix)
        allocations = []
        total_cost = 0.0
        for r, c in zip(row_ind, col_ind):
            allocations.append({"asset_index": int(r), "incident_index": int(c)})
            total_cost += float(self.cost_matrix[r, c] * self.weights[c])
        return {
            "status": "Success",
            "optimal_value": total_cost,
            "allocations": allocations
        }
