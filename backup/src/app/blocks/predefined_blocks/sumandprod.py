import sys
import json

def calculate_sum_and_product(inputs):
    x = inputs[0]
    y = inputs[1]
    result_sum = x + y
    result_product = x * y
    return [result_sum, result_product]

json_str = sys.argv[1]
inputs = json.loads(json_str)
output = calculate_sum_and_product(inputs)
print(json.dumps(output))
