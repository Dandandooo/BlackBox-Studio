import json

def process_json(input_json):
  # Parse the input JSON string into a Python dictionary
  data = json.loads(input_json)

  # Extract values from the JSON object
  arg1_value = data.get("arg1", "")
  arg2_value = data.get("arg2", "")

  # Construct the result
  ret1 = f"{arg1_value}{arg2_value}"  # "value" + 3 -> "value3"
  ret2 = f"{arg2_value}{arg1_value}"  # 3 + "value" -> "3value"

  # Return the result as a JSON string
  result = json.dumps({"ret1": ret1, "ret2": ret2})
  return result