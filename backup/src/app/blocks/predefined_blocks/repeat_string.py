import sys
import json

def repeat_string(inputs):
    text = inputs[0]
    times = inputs[1]
    result = text * times
    return [result]

json_str = sys.argv[1]
inputs = json.loads(json_str)
output = repeat_string(inputs)
print(json.dumps(output))
