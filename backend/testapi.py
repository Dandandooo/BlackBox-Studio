import requests

# GET request
url = "http://localhost:8000/api/add-node"
params = {"meta_dir": "./test/meta.json"}  # Optional parameters
response = requests.get(url, params=params)
# response = requests.get(url)

if response.status_code == 200:
    print("Success!")
    print(response.text)  # If the response is in JSON format
else:
    print(f"Error: {response.status_code}")
    print(f"Error: {response.text}")
