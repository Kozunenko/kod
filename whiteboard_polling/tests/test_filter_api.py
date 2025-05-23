from fastapi.testclient import TestClient
from backend.app import app
from config import ROOM_ID

client = TestClient(app)

def test_filter_api():
    payload = {
        "image_data": [1, 2, 3, 255],
        "filter_name": "invert",
        "width": 1,
        "height": 1
    }
    res = client.post(f"/filter/{ROOM_ID}", json=payload)
    assert res.status_code == 200 and res.json()["image_data"] == [254, 253, 252, 255]

