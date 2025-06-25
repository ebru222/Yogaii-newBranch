import os
import tensorflow as tf
import tensorflowjs as tfjs

# Model dosya yolu
MODEL_PATH = '../../yoga_pose_model_two.h5'
OUTPUT_DIR = '../public/models/yoga_pose_model_two'

def convert_model():
    """
    H5 modelini TensorFlow.js formatına dönüştürür
    """
    # Çıkış dizini yoksa oluştur
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Modeli yükle
    print(f"Model yükleniyor: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    # Model özetini görüntüle
    model.summary()
    
    # Modeli TensorFlow.js formatına dönüştür
    print(f"Model dönüştürülüyor ve {OUTPUT_DIR} dizinine kaydediliyor...")
    tfjs.converters.save_keras_model(model, OUTPUT_DIR)
    
    print("Dönüştürme tamamlandı!")
    print(f"Model.json dosyasını şu konumda bulabilirsiniz: {os.path.join(OUTPUT_DIR, 'model.json')}")

if __name__ == "__main__":
    convert_model()
