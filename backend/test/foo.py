import sys
import json

def calculate_sum(json_str):
    # Parse the JSON string into a dictionary
    data = json.loads(json_str)
    
    # Dummy example values (replace with actual input values if needed)
    x = 3.5
    y = 2.5
    
    # Calculate the sum
    result = x + y
    
    # Prepare the output JSON
    output = {
        "sum": result
    }

    return json.dumps(output, indent=4)

if __name__ == "__main__":
    # Check if a JSON string argument is passed
    if len(sys.argv) != 2:
        print("Usage: python script.py '<json_string>'")
        sys.exit(1)

    # The JSON string is passed as the second argument
    json_str = sys.argv[1]
    
    # Call the function with the passed JSON string
    result = calculate_sum(json_str)
    print(result)


