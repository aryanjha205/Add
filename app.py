import os
import certifi
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://pubgb0232_db_user:esJyAwyw0sCTC3XC@cluster0.egwoi83.mongodb.net/?appName=Cluster0")
PORT = int(os.environ.get("PORT", 5000))
DEBUG = os.environ.get("DEBUG", "True") == "True"

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
db = client['ads_platform']
ads_collection = db['ads']

# Verify Connection
try:
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB Atlas")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")

# Helper function to serialize MongoDB objects
def serialize_ad(ad):
    ad['_id'] = str(ad['_id'])
    return ad

# --- Frontend Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')

# --- API Routes ---

# Public API: Get all active ads
@app.route('/api/ads', methods=['GET'])
def get_active_ads():
    try:
        ads = list(ads_collection.find({'status': 'active'}))
        return jsonify([serialize_ad(ad) for ad in ads]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin API: CRUD operations
@app.route('/api/admin/ads', methods=['GET', 'POST'])
def handle_ads():
    try:
        if request.method == 'GET':
            ads = list(ads_collection.find().sort('created_at', -1))
            return jsonify([serialize_ad(ad) for ad in ads]), 200
        
        if request.method == 'POST':
            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), 400
                
            new_ad = {
                'logo_url': data.get('logo_url'),
                'ad_text': data.get('ad_text'),
                'redirect_url': data.get('redirect_url'),
                'status': data.get('status', 'active'),
                'created_at': datetime.now(timezone.utc),
                'impressions': 0,
                'clicks': 0
            }
            result = ads_collection.insert_one(new_ad)
            new_ad['_id'] = str(result.inserted_id)
            return jsonify(new_ad), 201
    except Exception as e:
        print(f"Error in handle_ads: {e}")
        return jsonify({'error': 'Database connection error. Please check if your IP is whitelisted in MongoDB Atlas.'}), 500

@app.route('/api/admin/ads/<ad_id>', methods=['PUT', 'DELETE'])
def update_delete_ad(ad_id):
    if request.method == 'PUT':
        data = request.json
        update_data = {
            'logo_url': data.get('logo_url'),
            'ad_text': data.get('ad_text'),
            'redirect_url': data.get('redirect_url'),
            'status': data.get('status')
        }
        ads_collection.update_one({'_id': ObjectId(ad_id)}, {'$set': update_data})
        return jsonify({'message': 'Ad updated successfully'}), 200
    
    if request.method == 'DELETE':
        ads_collection.delete_one({'_id': ObjectId(ad_id)})
        return jsonify({'message': 'Ad deleted successfully'}), 200

# Scalability Hooks: Tracking
@app.route('/api/ads/<ad_id>/click', methods=['POST'])
def track_click(ad_id):
    ads_collection.update_one({'_id': ObjectId(ad_id)}, {'$inc': {'clicks': 1}})
    return jsonify({'message': 'Click tracked'}), 200

@app.route('/api/ads/<ad_id>/impression', methods=['POST'])
def track_impression(ad_id):
    ads_collection.update_one({'_id': ObjectId(ad_id)}, {'$inc': {'impressions': 1}})
    return jsonify({'message': 'Impression tracked'}), 200

if __name__ == '__main__':
    app.run(debug=DEBUG, port=PORT)
