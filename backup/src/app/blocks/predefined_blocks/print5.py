import json

def output_five():
    return [5]

output = output_five()
print(json.dumps(output))
