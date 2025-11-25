import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime

# 1. INITIALIZE FIREBASE
# You need to download your "Service Account Key" from Firebase Console
# Go to Project Settings -> Service Accounts -> Generate New Private Key
cred = credentials.Certificate("./serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def generate_forecast():
    print("--- STARTING AI ENGINE ---")
    
    # 2. FETCH SALES DATA
    print("Fetching sales data...")
    sales_ref = db.collection('sales')
    docs = sales_ref.stream()
    
    data = []
    for doc in docs:
        d = doc.to_dict()
        data.append(d)
    
    if not data:
        print("No data found!")
        return

    df = pd.DataFrame(data)
    print(f"Loaded {len(df)} sales records.")

    # 3. SIMPLE PREDICTION LOGIC (Mocking XGBoost for now)
    # In a real app, you would train a model here.
    # For this MVP, we will find the "Most Popular Item".
    
    if 'item' not in df.columns:
        print("Invalid data format")
        return

    top_item = df['item'].mode()[0]
    total_qty = df[df['item'] == top_item]['quantity'].sum()
    
    prediction_text = f"High demand expected for {top_item}. Sold {total_qty} units recently."
    
    print(f"Prediction: {prediction_text}")

    # 4. WRITE PREDICTION BACK TO FIRESTORE
    # We write this to the shop's document so the App sees it instantly.
    
    # Group by User ID to update the correct shop
    unique_users = df['uid'].unique()
    
    for uid in unique_users:
        print(f"Updating forecast for Shop: {uid}")
        shop_ref = db.collection('shops').document(uid)
        shop_ref.update({
            'aiForecast': prediction_text,
            'lastForecast': datetime.now()
        })

    print("--- FORECAST UPDATED SUCCESSFULLY ---")

if __name__ == "__main__":
    generate_forecast()
