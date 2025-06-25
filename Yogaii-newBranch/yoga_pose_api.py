import os
import sys
import json
import numpy as np
import cv2
import tensorflow as tf
from keras.models import load_model
from keras.applications.mobilenet_v2 import preprocess_input
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import logging
from datetime import datetime
import time

CLASSES = ['downdog', 'goddess', 'plank', 'tree', 'warrior2']

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yoga_pose_model_two.keras')

# Log dosyası yapılandırması
LOG_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(LOG_FOLDER, exist_ok=True)
LOG_FILE = os.path.join(LOG_FOLDER, f'yoga_api_{datetime.now().strftime("%Y%m%d")}.log')

# Logger yapılandırması
logger = logging.getLogger('yoga_api')
logger.setLevel(logging.INFO)

# Dosya handler
file_handler = logging.FileHandler(LOG_FILE)
file_handler.setLevel(logging.INFO)

# Konsol handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Format belirleme
log_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(log_format)
console_handler.setFormatter(log_format)

# Handler'ları logger'a ekle
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Flask uygulaması oluştur
app = Flask(__name__)

# CORS yapılandırması - Tüm rotalar için CORS'u etkinleştir
CORS(app, resources={
    r"/api/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Host ve port ayarları
HOST = '127.0.0.1'
PORT = 5000

# Global model değişkeni
model = None

def load_yoga_model():
    """Yoga pozu modelini yükle"""
    global model
    try:
        model = load_model(MODEL_PATH)
        logger.info(f"Model başarıyla yüklendi: {MODEL_PATH}")
        return True
    except Exception as e:
        logger.error(f"Model yüklenirken hata oluştu: {e}")
        return False

def preprocess_image(image, target_size=(224, 224)):
    """Görüntüyü modele uygun şekilde önişleme"""
    # Görüntüyü hedef boyuta yeniden boyutlandır
    image = cv2.resize(image, target_size)
    
    # BGR'dan RGB'ye dönüştür (OpenCV BGR kullanır, modelimiz RGB bekliyor)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Girişi önişleme (piksel değerlerini ölçeklendir, vb.)
    image = preprocess_input(image)
    
    # Batch boyutu ekle
    return np.expand_dims(image, axis=0)

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    """Base64 kodlu görüntüden yoga pozu tahmini yap"""
    # OPTIONS isteği için CORS preflight yanıtı
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response
    
    # İstek bilgilerini logla
    client_ip = request.remote_addr
    request_id = f"{int(time.time())}-{client_ip}"
    logger.info(f"[{request_id}] Yeni tahmin isteği alındı - IP: {client_ip}")
    
    start_time = time.time()
    
    if model is None:
        logger.error(f"[{request_id}] Model yüklenmedi hatası")
        return jsonify({'error': 'Model yüklenmedi'}), 500
    
    # JSON verisini al
    data = request.get_json()
    
    if not data or 'image' not in data:
        logger.warning(f"[{request_id}] Görüntü verisi bulunamadı")
        return jsonify({'error': 'Görüntü verisi bulunamadı'}), 400
    
    try:
        # Base64 kodlu görüntüyü decode et
        image_data = data['image']
        # Base64 header'ı varsa kaldır (örn: 'data:image/jpeg;base64,')
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        logger.debug(f"[{request_id}] Base64 görüntü alındı ve işleniyor")
        
        # Base64'ten binary'ye dönüştür
        image_bytes = base64.b64decode(image_data)
        
        # Binary'den numpy array'e dönüştür
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # Numpy array'den görüntü oluştur
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.warning(f"[{request_id}] Görüntü decode edilemedi")
            return jsonify({'error': 'Görüntü decode edilemedi'}), 400
        
        # Görüntüyü önişle
        processed_image = preprocess_image(image)
        
        # Tahmin yap
        logger.debug(f"[{request_id}] Model tahmini yapılıyor")
        predictions = model.predict(processed_image, verbose=0)
        
        # En yüksek olasılıklı sınıfı al
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = CLASSES[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx] * 100)
        
        # Tüm sınıfların olasılıklarını al
        all_probabilities = {cls: float(prob * 100) for cls, prob in zip(CLASSES, predictions[0])}
        
        # İşlem süresini hesapla
        process_time = time.time() - start_time
        
        # Sonucu döndür
        result = {
            'pose': predicted_class,
            'confidence': confidence,
            'all_probabilities': all_probabilities
        }
        
        logger.info(f"[{request_id}] Tahmin başarılı: {predicted_class} ({confidence:.2f}%) - İşlem süresi: {process_time:.3f}s")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"[{request_id}] Tahmin yapılırken hata oluştu: {str(e)}")
        return jsonify({'error': f'Tahmin yapılırken hata oluştu: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """API sağlık kontrolü"""
    client_ip = request.remote_addr
    logger.info(f"Sağlık kontrolü isteği alındı - IP: {client_ip}")
    
    if model is None:
        logger.error(f"Sağlık kontrolü başarısız - Model yüklenmedi - IP: {client_ip}")
        return jsonify({'status': 'error', 'message': 'Model yüklenmedi'}), 500
    
    logger.info(f"Sağlık kontrolü başarılı - IP: {client_ip}")
    return jsonify({'status': 'ok', 'message': 'API çalışıyor ve model yüklü'})

if __name__ == '__main__':
    # API başlatma log
    logger.info("=== Yoga Pose API Başlatılıyor ===")
    logger.info(f"Host: {HOST}, Port: {PORT}")
    
    # Modeli yükle
    if not load_yoga_model():
        logger.critical("Model yüklenemedi, uygulama kapatılıyor.")
        sys.exit(1)
    
    # Flask uygulamasını başlat
    logger.info("Flask uygulaması başlatılıyor...")
    app.run(host=HOST, port=PORT, debug=True)