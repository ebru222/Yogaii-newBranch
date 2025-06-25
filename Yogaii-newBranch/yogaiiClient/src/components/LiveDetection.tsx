import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, ClockIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import ApiModelService from '../services/ApiModelService';
import StreakService from '../services/StreakService';
import { useAuth } from '../contexts/AuthContext';
import { YOGA_POSES } from '../services/SimulatedModelService';

// Pose tracking için interface
interface PoseSession {
  [poseName: string]: {
    totalDuration: number; // seconds
    detectionCount: number;
    firstDetectedAt?: Date;
    lastDetectedAt?: Date;
  };
}

interface SessionStats {
  startTime: Date;
  endTime?: Date;
  totalDuration: number;
  poses: PoseSession;
  bestPose?: string;
  totalPoses: number;
}

// Prediction result interface
interface PredictionResult {
  className: string;
  probability: number;
  allPredictions: { className: string; probability: number }[];
}

// Pose colors for visualization
const POSE_COLORS: { [key: string]: string } = {
    'downdog': '#7F7FFF',
    'goddess': '#7F7FFF', 
  'plank': '#06B6D4',
  'tree': '#10B981',
  'warrior2': '#F59E0B'
};

// Pose timer component
const PoseTimer = ({ poseSession, currentPose }: { poseSession: PoseSession, currentPose: string | null }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <ClockIcon className="w-5 h-5 mr-2" />
        Pose Süreleri
      </h3>
      
      <div className="space-y-2">
        {Object.entries(poseSession).map(([pose, stats]) => (
          <div key={pose} className={`flex items-center justify-between p-2 rounded-lg ${
            currentPose === pose ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
          }`}>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: POSE_COLORS[pose] || '#gray' }}
              ></div>
              <span className="font-medium capitalize">{pose}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{Math.floor(stats.totalDuration)}s</div>
              <div className="text-xs text-gray-500">{stats.detectionCount} tespit</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Session summary component
const SessionSummary = ({ 
  sessionStats, 
  onSaveSession, 
  onStartNewSession 
}: { 
  sessionStats: SessionStats, 
  onSaveSession: (quality: string) => void,
  onStartNewSession: () => void 
}) => {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair'>('good');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSaveSession(quality);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Seans Tamamlandı! 🎉</h2>
          <p className="text-gray-600">Harika bir yoga seansı geçirdin!</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(sessionStats.totalDuration / 60)}:{(sessionStats.totalDuration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Toplam Süre</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{sessionStats.totalPoses}</div>
              <div className="text-sm text-gray-600">Tespit Edilen Poz</div>
            </div>
          </div>
          
          {sessionStats.bestPose && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">En Uzun Tutulan Poz</div>
              <div className="font-semibold text-green-600 capitalize">{sessionStats.bestPose}</div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seansını nasıl değerlendirirsin?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'fair', label: 'İyi', emoji: '😊', color: 'blue' },
              { value: 'good', label: 'Harika', emoji: '😍', color: 'green' },
              { value: 'excellent', label: 'Mükemmel', emoji: '🤩', color: 'purple' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setQuality(option.value as any)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  quality === option.value 
                    ? `border-${option.color}-500 bg-${option.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onStartNewSession}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tekrar Dene
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet & Bitir'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tahmin gösterimi bileşeni
const PredictionDisplay = ({ predictions }: { predictions: PredictionResult | null }) => {
  if (!predictions) return null;
  
  const topPrediction = predictions.allPredictions[0];
  
  return (
    <div className="mt-4 w-full">
      <h3 className="text-xl font-semibold mb-3">
        Tespit Edilen Poz: <span className="text-purple-600">{topPrediction.className}</span>
        <span className="ml-2 inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
          {(topPrediction.probability * 100).toFixed(1)}%
        </span>
      </h3>
      
      <h4 className="text-lg font-medium mb-3 text-gray-700">
        Tüm Tahminler:
      </h4>
      
      <div className="space-y-3">
        {predictions.allPredictions.map((pred) => (
          <div key={pred.className}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 min-w-24">
                {pred.className}:
              </span>
              <span className="text-sm font-medium text-gray-600">
                {(pred.probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pred.probability * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Canlı tespit bileşeni
function LiveDetection() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  
  // Session tracking state
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    startTime: new Date(),
    totalDuration: 0,
    poses: {},
    totalPoses: 0
  });
  const [currentPose, setCurrentPose] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  
  // Timers
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const poseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Kamerayı açma ve kapatma
  const toggleCamera = async () => {
    if (cameraActive) {
      // Kamerayı kapat
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setPrediction(null);
    } else {
      // Kamerayı aç
      setIsLoading(true);
      setError(null);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          
          // Kamera açıldıktan sonra otomatik olarak tahminde bulunmaya başla
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Kamera erişimi hatası:', err);
        setError('Kameraya erişim sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Session başlatma
  const startSession = () => {
    const now = new Date();
    setSessionStats({
      startTime: now,
      totalDuration: 0,
      poses: {},
      totalPoses: 0
    });
    setSessionTimer(0);
    setSessionActive(true);
    
    // Session timer başlat
    sessionIntervalRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
  };

  // Session durdurma
  const stopSession = () => {
    setSessionActive(false);
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
    if (poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
      poseTimeoutRef.current = null;
    }
    
    // Session stats güncelleyin
    setSessionStats(prev => ({
      ...prev,
      endTime: new Date(),
      totalDuration: sessionTimer,
      bestPose: Object.entries(prev.poses).reduce((best, [pose, stats]) => 
        !best || stats.totalDuration > prev.poses[best]?.totalDuration ? pose : best, ''
      )
    }));
    
    setShowSummary(true);
  };

  // Pose tracking
  const trackPose = (poseName: string) => {
    const now = new Date();
    
    setSessionStats(prev => {
      const newPoses = { ...prev.poses };
      
      if (!newPoses[poseName]) {
        newPoses[poseName] = {
          totalDuration: 0,
          detectionCount: 0,
          firstDetectedAt: now
        };
      }
      
      newPoses[poseName].detectionCount++;
      newPoses[poseName].lastDetectedAt = now;
      
      return {
        ...prev,
        poses: newPoses,
        totalPoses: prev.totalPoses + 1
      };
    });
    
    // Eğer pose değiştiyse, önceki pose süresini güncelle
    if (currentPose && currentPose !== poseName && poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
    }
    
    setCurrentPose(poseName);
    
    // 3 saniye boyunca aynı pozda kalırsa süreyi artır
    if (poseTimeoutRef.current) {
      clearTimeout(poseTimeoutRef.current);
    }
    
    poseTimeoutRef.current = setTimeout(() => {
      setSessionStats(prev => ({
        ...prev,
        poses: {
          ...prev.poses,
          [poseName]: {
            ...prev.poses[poseName],
            totalDuration: prev.poses[poseName].totalDuration + 3
          }
        }
      }));
    }, 3000);
  };

  // Session kaydetme
  const saveSession = async (quality: string) => {
    if (!user) return;
    
    try {
      const activity = {
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        practiced: true,
        duration: Math.floor(sessionStats.totalDuration / 60), // saniyeden dakikaya çevir
        poses: Object.keys(sessionStats.poses),
        quality: quality as 'excellent' | 'good' | 'fair'
      };
      
      await StreakService.addDailyActivity(activity);
      console.log('Session kaydedildi:', activity);
    } catch (error) {
      console.error('Session kaydedilemedi:', error);
    }
    
    setShowSummary(false);
    resetSession();
  };

  // Session sıfırlama
  const resetSession = () => {
    setSessionStats({
      startTime: new Date(),
      totalDuration: 0,
      poses: {},
      totalPoses: 0
    });
    setSessionTimer(0);
    setCurrentPose(null);
    setSessionActive(false);
  };

  // Görüntü yakalama ve tahmin yapma
  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Video boyutlarını ayarla
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Videodan kareyi canvas'a çiz
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Simüle edilmiş model servisini kullan
      const result = await ApiModelService.predictPose(canvas);
      setPrediction(result);
      
      // Eğer session aktifse ve güven skoru yeterli yüksekse, pose'u track et
      if (sessionActive && result.probability > 0.7) {
        trackPose(result.className);
      }
    } catch (err) {
      console.error('Tahmin hatası:', err);
      setError('Yoga pozu tahmini yapılırken bir hata oluştu.');
    }
  };
  
  // Her 2 saniyede bir tahmin yap
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cameraActive) {
      // İlk tahmini hemen yap, sonra her 2 saniyede bir tekrarla
      captureAndPredict();
      interval = setInterval(captureAndPredict, 2000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cameraActive]);
  
  // Component temizleme
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Canlı Yoga Pozu Tespiti
        </h1>
        
        <p className="text-gray-600 text-lg mb-8">
          Kameranızı kullanarak gerçek zamanlı yoga pozu tespiti yapın. 
          Kamera karşısında bir yoga pozu alın ve sistem pozunuzu otomatik olarak tespit edecektir.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative h-96 bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              
              {!cameraActive && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <h3 className="text-2xl font-semibold mb-4">
                    Kamera kapalı
                  </h3>
                  <p className="text-gray-300 mb-6 text-center">
                    Yoga pozu tespiti için kameranızı başlatın
                  </p>
                  <button 
                    onClick={toggleCamera}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Kamerayı Başlat
                  </button>
                </div>
              )}
              
              <video 
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                playsInline
              />
              
              <canvas 
                ref={canvasRef} 
                className="hidden"
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              {cameraActive ? (
                <button 
                  onClick={toggleCamera}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Kamerayı Kapat
                </button>
              ) : (
                <div></div>
              )}
              
              <button 
                onClick={() => setHelpOpen(true)}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <InformationCircleIcon className="w-5 h-5 mr-2" />
                Nasıl Kullanılır
              </button>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Session Control Panel */}
            <div className="bg-white border rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-orange-500" />
                Yoga Seansı
              </h2>
              
              {!sessionActive ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Yoga seansını başlatarak pozlarınızı takip edin!
                  </p>
                  <button
                    onClick={startSession}
                    disabled={!cameraActive}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      cameraActive 
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Seansı Başlat
                  </button>
                  {!cameraActive && (
                    <p className="text-sm text-gray-500 mt-2">
                      Önce kamerayı başlatın
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-gray-600">Seans Süresi</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">
                        {Object.keys(sessionStats.poses).length}
                      </div>
                      <div className="text-sm text-blue-600">Farklı Poz</div>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-orange-600">
                        {sessionStats.totalPoses}
                      </div>
                      <div className="text-sm text-orange-600">Toplam Tespit</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={stopSession}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <StopIcon className="w-5 h-5 mr-2" />
                    Seansı Bitir
                  </button>
                </div>
              )}
            </div>

            {/* Pose Timer */}
            {sessionActive && Object.keys(sessionStats.poses).length > 0 && (
              <PoseTimer poseSession={sessionStats.poses} currentPose={currentPose} />
            )}

            {/* Prediction Results */}
            <div className="bg-white border rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Tespit Sonuçları
              </h2>
              
              {!cameraActive ? (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <p className="text-center">
                    Yoga pozu tespiti için kameranızı başlatın
                  </p>
                </div>
              ) : !prediction ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <PredictionDisplay predictions={prediction} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Yoga pozu bilgileri */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Tespit Edilebilen Yoga Pozları
        </h2>
        
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {YOGA_POSES.map((pose: string) => (
                      <div key={pose} className="bg-white border rounded-xl shadow-md overflow-hidden">
                          <div
                              className="h-32 flex items-center justify-center text-blue-800 text-xl font-semibold"
                              style={{ backgroundColor: '#E0F2FE' }}
                          >
                              {pose}
                          </div>
                          <div className="p-4">
                              <p className="text-gray-600 text-sm">
                                  {getDescriptionForPose(pose)}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>

      </div>
      
      {/* Session Summary Modal */}
      {showSummary && (
        <SessionSummary
          sessionStats={sessionStats}
          onSaveSession={saveSession}
          onStartNewSession={() => {
            setShowSummary(false);
            resetSession();
          }}
        />
      )}

      {/* Yardım modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Yoga Pozu Tespit Yardımı</h3>
                <button 
                  onClick={() => setHelpOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Nasıl Kullanılır:</h4>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>1. 'Kamerayı Başlat' butonuna tıklayın</li>
                    <li>2. Kameraya erişim izni verin</li>
                    <li>3. Kamera karşısında yoga pozunu alın</li>
                    <li>4. Sistem pozunuzu otomatik olarak tespit edecektir</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">En doğru sonuçlar için:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• İyi aydınlatılmış bir ortamda olun</li>
                    <li>• Kameraya dönük olarak durun</li>
                    <li>• Pozunuzu sabit bir şekilde tutun</li>
                    <li>• Tüm vücudunuzun görünür olduğundan emin olun</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Algılanabilen Pozlar:</h4>
                  <div className="flex flex-wrap gap-2">
                    {YOGA_POSES.map(pose => (
                      <span key={pose} className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        {pose}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Poz türlerine göre açıklamalar
function getDescriptionForPose(pose: string): string {
  switch (pose) {
    case 'downdog':
      return 'Aşağı Bakan Köpek (Downward Dog) pozu, tüm vücudu çalıştıran ve esneten temel bir duruştur. Omurgayı uzatır, omuzları ve bacakları güçlendirir.';
    case 'goddess':
      return 'Tanrıça (Goddess) pozu, kalçaları açan ve bacakları güçlendiren güçlü bir duruştur. Enerji akışını dengelemeye yardımcı olur.';
    case 'plank':
      return 'Plank pozu, tüm vücut gücünü geliştiren ve merkez dengeyi artıran temel bir güç duruşudur. Karın, sırt ve kol kaslarını çalıştırır.';
    case 'tree':
      return 'Ağaç (Tree) pozu, denge ve odaklanmayı geliştiren tek ayak üzerinde durulan bir duruştur. Konsantrasyonu artırır ve iç huzuru destekler.';
    case 'warrior2':
      return 'Savaşçı II (Warrior 2) pozu, bacak gücünü artıran ve kalçaları açan dinamik bir duruştur. İç güç ve dayanıklılık geliştirir.';
    default:
      return 'Bu yoga pozu hakkında ayrıntılı bilgi yakında eklenecektir.';
  }
}

export default LiveDetection;
