import sys
import json

def calculate_sum_and_product(inputs):
    x = inputs[0]
    y = inputs[1]
    return [x + y, x * y]

if not sys.stdin.isatty():
    json_str = sys.stdin.read()
else:
    json_str = sys.argv[1]

inputs = json.loads(json_str)
output = calculate_sum_and_product(inputs)
print(json.dumps(output))
