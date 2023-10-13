import json
from application.app import create_app
from repository.memrepo import MemRepo

def test_list_work_shifts():
    app = create_app('testing')
    client = app.test_client()
    headers = {
        'Authorization': 'volunteer@slu.edu'
    }
    
    response = client.get('/shifts', headers=headers)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert len(data) == 2

def test_add_work_shifts():
    app = create_app('testing')
    client = app.test_client()
    
    new_shift = {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35d",
        "worker": "volunteer@slu.edu",
        "shelter": "new-shelter-id",
        "start_time": 1701442800000,
        "end_time": 1701453600000,
    }

    headers = {
        'Authorization': 'volunteer@slu.edu',
        'Content-Type': 'application/json'
    }
    
    response = client.post('/shifts', headers=headers, data=json.dumps([new_shift]))
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data[0]["code"] == "f853578c-fc0f-4e65-81b8-566c5dffa35d"

def test_delete_work_shift():
    app = create_app('testing')
    client = app.test_client()
    
    headers = {
        'Authorization': 'volunteer@slu.edu'
    }

    response = client.delete('/shifts/f853578c-fc0f-4e65-81b8-566c5dffa35a', headers=headers)
    data = json.loads(response.data)
    
    assert response.status_code == 200

