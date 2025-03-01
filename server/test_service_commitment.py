import requests
import json

# Base URL for your local Flask server
BASE_URL = "http://localhost:5001"  # Adjust port if different

def test_service_commitments():
    print("TESTING SERVICE COMMITMENT ENDPOINT WITH SHIFT_ID FILTERING")
    print("--------------------------------------------------------")
    
    # 1. Create some test service commitments with different shift IDs
    print("\n1. Creating test service commitments...")
    
    # Create commitment for shift_1
    commitment1 = {
        "shift_id": "shift_1",
        "volunteer_id": "volunteer_1"
        # Add other required fields if necessary
    }
    resp1 = requests.post(f"{BASE_URL}/service_commitment", json=commitment1)
    print(f"Created commitment 1: {resp1.status_code}")
    
    # Create another commitment for shift_1
    commitment2 = {
        "shift_id": "shift_1",
        "volunteer_id": "volunteer_2"
    }
    resp2 = requests.post(f"{BASE_URL}/service_commitment", json=commitment2)
    print(f"Created commitment 2: {resp2.status_code}")
    
    # Create commitment for shift_2
    commitment3 = {
        "shift_id": "shift_2",
        "volunteer_id": "volunteer_3"
    }
    resp3 = requests.post(f"{BASE_URL}/service_commitment", json=commitment3)
    print(f"Created commitment 3: {resp3.status_code}")
    
    # 2. Test GET with shift_id=shift_1 (should return 2 commitments)
    print("\n2. Testing GET /service_commitment?shift_id=shift_1")
    shift1_response = requests.get(f"{BASE_URL}/service_commitment?shift_id=shift_1")
    shift1_data = shift1_response.json()
    
    print(f"Status code: {shift1_response.status_code}")
    print(f"Response: {json.dumps(shift1_data, indent=2)}")
    
    # Check if we only got commitments for shift_1
    if shift1_response.status_code == 200:
        commitments = shift1_data.get("results", [])
        print(f"Number of commitments returned: {len(commitments)}")
        
        all_shift1 = all(c.get("shift_id") == "shift_1" for c in commitments)
        print(f"All returned commitments have shift_id=shift_1: {all_shift1}")
        
        if len(commitments) == 2 and all_shift1:
            print("✅ Test passed: Got exactly 2 commitments for shift_1")
        else:
            print("❌ Test failed: Expected 2 commitments for shift_1")
    
    # 3. Test GET with shift_id=shift_2 (should return 1 commitment)
    print("\n3. Testing GET /service_commitment?shift_id=shift_2")
    shift2_response = requests.get(f"{BASE_URL}/service_commitment?shift_id=shift_2")
    shift2_data = shift2_response.json()
    
    print(f"Status code: {shift2_response.status_code}")
    print(f"Response: {json.dumps(shift2_data, indent=2)}")
    
    # 4. Test GET with nonexistent shift_id (should return empty list)
    print("\n4. Testing GET /service_commitment?shift_id=nonexistent")
    none_response = requests.get(f"{BASE_URL}/service_commitment?shift_id=nonexistent")
    none_data = none_response.json()
    
    print(f"Status code: {none_response.status_code}")
    print(f"Response: {json.dumps(none_data, indent=2)}")
    
    if none_response.status_code == 200:
        commitments = none_data.get("results", [])
        if len(commitments) == 0:
            print("✅ Test passed: Got empty list for nonexistent shift_id")
        else:
            print("❌ Test failed: Expected empty list for nonexistent shift_id")
    
    # 5. Test GET without shift_id (should return all commitments)
    print("\n5. Testing GET /service_commitment (no filter)")
    all_response = requests.get(f"{BASE_URL}/service_commitment")
    all_data = all_response.json()
    
    print(f"Status code: {all_response.status_code}")
    print(f"Number of commitments returned: {len(all_data.get('results', []))}")

if __name__ == "__main__":
    test_service_commitments()

