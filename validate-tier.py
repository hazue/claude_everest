import requests

if __name__ == "__main__":
    
    reqBody = {
        "accessCode":"a",
        "resourceId":"1"
    }

    print("running requests.post()")
    resp = requests.post("http://localhost:4000/api/hardware/validate-tier", json=reqBody)

    print(resp.status_code)
    print(resp.text)