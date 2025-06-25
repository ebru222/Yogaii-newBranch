import sys
import pkg_resources

# Check package versions before imports
required_packages = {
    'numpy': '1.26.0',
    'opencv-python': '4.8.1.78',
    'tensorflow': '2.18.0',
    'keras': '3.8.0'
}

for package, version in required_packages.items():
    try:
        pkg_resources.require(f'{package}=={version}')
    except pkg_resources.VersionConflict:
        print(f"Error: {package} version {version} is required. Please run:")
        print(f"pip install {package}=={version}")
        sys.exit(1)
    except pkg_resources.DistributionNotFound:
        print(f"Error: {package} is not installed. Please run:")
        print(f"pip install {package}=={version}")
        sys.exit(1)

try:
    import os
    import cv2
    import numpy as np
    import tensorflow as tf
    import keras
    from keras.models import load_model
    from keras.applications.mobilenet_v2 import preprocess_input
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install the required packages using:")
    print("pip install -r requirements.txt")
    sys.exit(1)

print("TensorFlow version:", tf.__version__)
print("Keras version:", keras.__version__)

CLASSES = ['downdog', 'goddess', 'plank', 'tree', 'warrior2']

# Model dosya yolu
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yoga_pose_model_two.keras')

def preprocess_image(image, target_size=(224, 224)):
    """
    Görüntüyü modele uygun şekilde önişleme
    """
    # Görüntüyü hedef boyuta yeniden boyutlandır
    image = cv2.resize(image, target_size)
    
    # BGR'dan RGB'ye dönüştür (OpenCV BGR kullanır, modelimiz RGB bekliyor)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Girişi önişleme (piksel değerlerini ölçeklendir, vb.)
    image = preprocess_input(image)
    
    # Batch boyutu ekle
    return np.expand_dims(image, axis=0)

def real_time_yoga_pose_detection():
    """
    Webcam kullanarak gerçek zamanlı yoga pozu tespiti
    """
    print("Model yükleniyor...")
    try:
        model = load_model(MODEL_PATH)
        print(f"Model başarıyla yüklendi: {MODEL_PATH}")
    except Exception as e:
        print(f"Model yüklenirken hata oluştu: {e}")
        return
    
    print("Webcam başlatılıyor...")
    cap = cv2.VideoCapture(0)  # 0 numaralı kamera (varsayılan webcam)
    
    if not cap.isOpened():
        print("Hata: Webcam açılamadı!")
        return
    
    print("Gerçek zamanlı yoga pozu tespiti başladı! Çıkmak için 'q' tuşuna basın.")
    
    while True:
        # Kameradan görüntü al
        ret, frame = cap.read()
        if not ret:
            print("Hata: Kameradan görüntü okunamadı!")
            break
        
        # Ekrandaki görüntüyü aynalama (doğal kullanım için)
        frame = cv2.flip(frame, 1)
        
        # Orijinal görüntünün bir kopyasını oluştur
        display_frame = frame.copy()
        
        # Görüntüyü önişle ve tahmin yap
        processed_frame = preprocess_image(frame)
        predictions = model.predict(processed_frame, verbose=0)
        
        # En yüksek olasılıklı sınıfı al
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = CLASSES[predicted_class_idx]
        confidence = predictions[0][predicted_class_idx] * 100
        
        # Ekrana bilgi yazdır
        info_text = f"Poz: {predicted_class} ({confidence:.1f}%)"
        cv2.putText(display_frame, info_text, (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
        
        # Kullanım talimatlarını ekle
        cv2.putText(display_frame, "ESC veya q: Cikis", (10, display_frame.shape[0] - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        # Çerçeveyi göster
        cv2.imshow("Yoga Pozu Siniflandirici", display_frame)
        
        # Çıkış için tuş kontrolü
        key = cv2.waitKey(1) & 0xFF
        if key == 27 or key == ord('q'):  # ESC veya 'q' tuşu
            break
    
    # Kaynakları serbest bırak
    cap.release()
    cv2.destroyAllWindows()
    print("Yoga pozu tespit uygulaması kapatıldı.")

if __name__ == "__main__":
    real_time_yoga_pose_detection()
