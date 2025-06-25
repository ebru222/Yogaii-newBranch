import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService, { YogaPose } from '../services/ApiService';

function PosesList() {
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // API'den yoga pozlarını getir
    const fetchPoses = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Backend'den pozları çek
        const backendPoses = await ApiService.getAllPoses();
        setPoses(backendPoses);
      } catch (error: any) {
        console.error('Yoga pozları yüklenirken hata oluştu:', error);
        setError('Backend\'den veri alınamadı, varsayılan veriler kullanılıyor.');
        
        // Backend'den veri gelmezse fallback olarak mock data kullan
        const simulatedData: YogaPose[] = [
          {
            id: 1,
            name: "Down Dog",
            description: "Aşağı Bakan Köpek (Down Dog) pozu, sırtı ve bacaların arkasını esnetir ve kol, omuz ve hamstringleri güçlendirir.",
            imageUrl: "/images/poses/downdog.jpg",
            modelUrl: "/models/poses/downdog.glb"
          },
          {
            id: 2,
            name: "Goddess",
            description: "Tanrıça (Goddess) pozu, kalçaları açar, bacakları ve çekirdek gücü güçlendirir.",
            imageUrl: "/images/poses/goddess.jpg",
            modelUrl: "/models/poses/goddess.glb"
          },
          {
            id: 3,
            name: "Plank",
            description: "Plank pozu, karın kaslarını, kolları ve bilekleri güçlendirir ve duruşu iyileştirir.",
            imageUrl: "/images/poses/plank.jpg",
            modelUrl: "/models/poses/plank.glb"
          },
          {
            id: 4,
            name: "Tree",
            description: "Ağaç (Tree) pozu, denge, konsantrasyon ve duruşu geliştirir.",
            imageUrl: "/images/poses/tree.jpg",
            modelUrl: "/models/poses/tree.glb"
          },
          {
            id: 5,
            name: "Warrior 2",
            description: "Savaşçı 2 (Warrior 2) pozu, bacakları güçlendirir, göğsü açar ve dayanıklılığı artırır.",
            imageUrl: "/images/poses/warrior2.jpg",
            modelUrl: "/models/poses/warrior2.glb"
          }
        ];
        
        setPoses(simulatedData);
      } finally {
        setLoading(false);
      }
    };

    fetchPoses();
  }, []);

  // Placeholder görüntüler için renk dizisi
  const placeholderColors = ['#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4'];

  return (
    <div className="py-12">
          <h1 className="text-5xl font-bold text-center mb-12 text-gray-900">
              Yoga Pozları
          </h1>

      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-7xl mx-auto">
          <p className="text-sm text-yellow-800 text-center">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {loading ? (
          // Yükleme iskeleti
          Array.from(new Array(5)).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div 
                className="h-48 animate-pulse"
                style={{ backgroundColor: placeholderColors[index % placeholderColors.length] + '20' }}
              ></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '80%' }}></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '90%' }}></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" style={{ width: '70%' }}></div>
                <div className="h-9 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
              </div>
            </div>
          ))
        ) : (
          // Gerçek veri
          poses.map((pose) => (
            <div 
              key={pose.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
              style={{
                boxShadow: '0px 10px 25px rgba(94, 53, 177, 0.1)'
              }}
            >
              <Link to={`/poses/${pose.name.toLowerCase().replace(' ', '')}`}>
                {/* Renk blokları */}
                      <div
                          className="h-48 flex items-center justify-center bg-sky-100"
                      >

                  <h3 className="text-4xl font-bold text-white drop-shadow-lg">
                    {pose.name}
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {pose.name}
                    </h2>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: placeholderColors[pose.id % placeholderColors.length] + '20',
                        color: placeholderColors[pose.id % placeholderColors.length]
                      }}
                    >
                      3D Model
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {pose.description.length > 100 
                      ? `${pose.description.substring(0, 100)}...` 
                      : pose.description}
                  </p>
                </div>
              </Link>
              <div className="px-6 pb-6">
                      <Link
                          to={`/poses/${pose.name.toLowerCase().replace(' ', '')}`}
                          className="inline-block bg-purple-200 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-300 transition-colors"
                      >
                          Detayları Gör
                      </Link>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PosesList;
