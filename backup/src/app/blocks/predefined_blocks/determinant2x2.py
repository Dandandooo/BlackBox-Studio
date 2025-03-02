import sys
import json

def calculate_determinant(inputs):
    a, b, c, d = inputs
    determinant = (a * d) - (b * c)
    return [determinant]

json_str = sys.argv[1]
inputs = json.loads(json_str)
output = calculate_determinant(inputs)
print(json.dumps(output))
