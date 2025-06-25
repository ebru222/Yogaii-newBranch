// Gerçek modeli entegre edene kadar yoga pozu tahminlerini simüle eden servis
// Bu, yoga_pose_model_two.h5 modelini geçici olarak taklit eder

// Model sınıfları (gerçek veri setinden)
export const YOGA_POSES = ['downdog', 'goddess', 'plank', 'tree', 'warrior2'];

class SimulatedModelService {
  // Rastgele bir gecikme süresi ile tahmin yapma simülasyonu
  async predictPose(imageData: ImageData | HTMLImageElement | HTMLCanvasElement): Promise<{
    className: string;
    probability: number;
    allPredictions: { className: string; probability: number }[];
  }> {
    // 0.5 - 1.5 saniye arası rastgele gecikme (gerçek model davranışını taklit etmek için)
    const delay = 500 + Math.random() * 1000;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Poz başına rastgele olasılıklar oluştur
        const rawProbabilities = YOGA_POSES.map(() => Math.random());
        // Normalize et (toplam = 1)
        const sum = rawProbabilities.reduce((a, b) => a + b, 0);
        const normalizedProbabilities = rawProbabilities.map(p => p / sum);
        
        // Gerçekçi olması için, bazen bir pozu belirgin şekilde daha yüksek olasılıkla seç
        let dominantIndex = Math.floor(Math.random() * YOGA_POSES.length);
        if (Math.random() > 0.3) {  // %70 olasılıkla dominant poz belirleme
          normalizedProbabilities[dominantIndex] = 0.6 + Math.random() * 0.3; // %60-%90 arası
          
          // Diğer olasılıkları yeniden normalize et
          const otherSum = normalizedProbabilities.reduce((a, b, i) => i === dominantIndex ? a : a + b, 0);
          const remainingProb = 1 - normalizedProbabilities[dominantIndex];
          
          for (let i = 0; i < normalizedProbabilities.length; i++) {
            if (i !== dominantIndex) {
              normalizedProbabilities[i] = normalizedProbabilities[i] / otherSum * remainingProb;
            }
          }
        }
        
        // Tahminleri sınıf adları ile eşle ve sırala
        const result = YOGA_POSES.map((className, index) => ({
          className,
          probability: normalizedProbabilities[index]
        })).sort((a, b) => b.probability - a.probability);
        
        // En yüksek olasılıklı pozu ve tüm tahminleri döndür
        resolve({
          className: result[0].className,
          probability: result[0].probability,
          allPredictions: result
        });
      }, delay);
    });
  }
  
  // Kamera görüntüsünü işleme simülasyonu (gerçek uygulamada TensorFlow.js kullanılacak)
  preprocessImage(imageData: ImageData | HTMLImageElement | HTMLCanvasElement): any {
    // Gerçek bir model olsaydı burada görüntü ön işleme yapılırdı
    console.log('Görüntü ön işleme simülasyonu yapılıyor...');
    return imageData; // Simülasyon için görüntüyü olduğu gibi döndür
  }
}

// Singleton olarak dışa aktar
export default new SimulatedModelService();
