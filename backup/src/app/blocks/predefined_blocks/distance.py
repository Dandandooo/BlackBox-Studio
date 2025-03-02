import sys
import json
import math

def calculate_distance(inputs):
    x1, y1, x2, y2 = inputs
    distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    return [distance]

json_str = sys.argv[1]
inputs = json.loads(json_str)
output = calculate_distance(inputs)
print(json.dumps(output))
