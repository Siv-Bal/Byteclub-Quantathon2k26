import sys
print("Starting imports...")
try:
    from qiskit_optimization import QuadraticProgram
    print("1 success")
except Exception as e:
    print(f"1 failed: {e}")

try:
    from qiskit_optimization.algorithms import MinimumEigenOptimizer
    print("2 success")
except Exception as e:
    print(f"2 failed: {e}")

try:
    from qiskit.primitives import StatevectorSampler as Sampler
    print("3 success")
except Exception as e:
    print(f"3 failed: {e}")

try:
    from qiskit_algorithms.minimum_eigensolvers import QAOA
    print("4 success")
except Exception as e:
    print(f"4 failed: {e}")

try:
    from qiskit_algorithms.optimizers import COBYLA
    print("5 success")
except Exception as e:
    print(f"5 failed: {e}")
