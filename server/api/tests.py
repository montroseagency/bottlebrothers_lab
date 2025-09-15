import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("🔍 Testing Restaurant Reservation API...\n")
    
    # Test 1: Check API root
    print("1. Testing API root...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ API is running")
            print(f"   Response: {response.json()}\n")
        else:
            print(f"❌ API returned status code: {response.status_code}\n")
    except Exception as e:
        print(f"❌ Could not connect to API: {e}\n")
        return
    
    # Test 2: Check availability
    print("2. Testing availability endpoint...")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    try:
        response = requests.get(f"{BASE_URL}/reservations/availability/", 
                               params={"start_date": tomorrow})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Got availability for {tomorrow}")
            if data and len(data[0]['slots']) > 0:
                print(f"   Available slots: {len(data[0]['slots'])}")
                print(f"   First slot: {data[0]['slots'][0]['time_display']}\n")
        else:
            print(f"❌ Failed to get availability: {response.status_code}\n")
    except Exception as e:
        print(f"❌ Error checking availability: {e}\n")
    
    # Test 3: Create a reservation
    print("3. Testing reservation creation...")
    reservation_data = {
        "first_name": "Test",
        "last_name": "Customer",
        "email": f"test{datetime.now().timestamp()}@example.com",
        "phone": "+1234567890",
        "date": tomorrow,
        "time": "19:00",
        "party_size": 4,
        "occasion": "birthday",
        "special_requests": "Testing the API"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/reservations/", 
                                json=reservation_data)
        if response.status_code == 201:
            data = response.json()
            print("✅ Reservation created successfully")
            print(f"   Reservation ID: {data['id']}")
            print(f"   Status: {data['status']}")
            reservation_id = data['id']
            
            # Test 4: Lookup the reservation
            print("\n4. Testing reservation lookup...")
            response = requests.get(f"{BASE_URL}/reservations/lookup/", 
                                   params={
                                       "email": reservation_data['email'],
                                       "phone": reservation_data['phone']
                                   })
            if response.status_code == 200:
                data = response.json()
                if len(data) > 0:
                    print("✅ Found reservation via lookup")
                    print(f"   Found {len(data)} reservation(s)\n")
            
            # Test 5: Cancel the reservation
            print("5. Testing reservation cancellation...")
            response = requests.post(f"{BASE_URL}/reservations/{reservation_id}/cancel/")
            if response.status_code == 200:
                print("✅ Reservation cancelled successfully\n")
            else:
                print(f"❌ Failed to cancel: {response.status_code}\n")
                
        else:
            print(f"❌ Failed to create reservation: {response.status_code}")
            print(f"   Error: {response.json()}\n")
    except Exception as e:
        print(f"❌ Error creating reservation: {e}\n")
    
    # Test 6: Send contact message
    print("6. Testing contact message...")
    contact_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "+1234567890",
        "subject": "general",
        "message": "This is a test message from the API test script"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contact/", json=contact_data)
        if response.status_code == 201:
            print("✅ Contact message sent successfully")
            print(f"   Response: {response.json()['message']}\n")
        else:
            print(f"❌ Failed to send message: {response.status_code}\n")
    except Exception as e:
        print(f"❌ Error sending message: {e}\n")
    
    print("✨ API testing complete!")
    print("\nNext steps:")
    print("1. Visit http://localhost:8000/admin/ to see the data")
    print("2. Start your React frontend and test the full flow")
    print("3. Check the database for the test entries")

if __name__ == "__main__":
    test_api()