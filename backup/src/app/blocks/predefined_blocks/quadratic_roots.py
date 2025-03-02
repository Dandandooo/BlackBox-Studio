import sys
import json
import math

def calculate_roots(inputs):
    a, b, c = inputs
    discriminant = b ** 2 - 4 * a * c
    sqrt_discriminant = math.sqrt(discriminant)
    root1 = (-b + sqrt_discriminant) / (2 * a)
    root2 = (-b - sqrt_discriminant) / (2 * a)
    return [root1, root2]

json_str = sys.argv[1]
inputs = json.loads(json_str)
output = calculate_roots(inputs)
print(json.dumps(output))
