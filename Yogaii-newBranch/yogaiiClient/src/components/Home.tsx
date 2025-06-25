import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Ana sayfadaki model seleksiyonu
const YOGA_POSES = ['downdog', 'goddess', 'plank', 'tree', 'warrior2'];

const IMAGE_LIST = [
    '/images/pngegg (7).png',
    '/images/pngegg (10).png',
    '/images/pngegg (11).png',
    '/images/pngegg (12).png',
    '/images/pngegg (13).png'
];

// Her yoga pozu için renk tanımları
const POSE_COLORS: { [key: string]: string } = {
  downdog: '#8e44ad',
  goddess: '#9b59b6',
  plank: '#3498db',
  tree: '#2ecc71',
  warrior2: '#e74c3c'
};

// Aşağı Bakan Köpek (Downward Dog) pozu modeli
function DownDogModel({ color }: { color: string }) {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Vücut */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 4, 0, 0]}>
        <capsuleGeometry args={[0.5, 2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Kollar */}
      <mesh position={[-0.7, 0.3, -0.5]} rotation={[Math.PI / 3, 0, -Math.PI / 12]}>
        <capsuleGeometry args={[0.2, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.7, 0.3, -0.5]} rotation={[Math.PI / 3, 0, Math.PI / 12]}>
        <capsuleGeometry args={[0.2, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Bacaklar */}
      <mesh position={[-0.4, -0.7, 0.8]} rotation={[Math.PI / 6, 0, 0]}>
        <capsuleGeometry args={[0.2, 1.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.4, -0.7, 0.8]} rotation={[Math.PI / 6, 0, 0]}>
        <capsuleGeometry args={[0.2, 1.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Baş */}
      <mesh position={[0, 1.1, -0.9]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Tanrıça (Goddess) pozu modeli
function GoddessModel({ color }: { color: string }) {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Gövde */}
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Bacaklar - geniş duruş */}
      <mesh position={[-0.8, -0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.2, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.8, -0.6, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.2, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Kollar - dirsekler 90 derece */}
      <mesh position={[-0.7, 1.0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.7, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Baş */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Plank pozu modeli
function PlankModel({ color }: { color: string }) {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Vücut - düz bir çizgi halinde */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.4, 2.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Kollar - omuzlar altında */}
      <mesh position={[-1.2, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1.2, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Bacaklar - vücutla aynı düzlemde */}
      <mesh position={[0, 0.3, -1.5]}>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Baş */}
      <mesh position={[1.7, 0.3, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Ağaç (Tree) pozu modeli
function TreeModel({ color }: { color: string }) {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Gövde - dik duruş */}
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.3, 1.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Bacaklar - biri yere bastırıyor, diğeri katlı */}
      <mesh position={[0, -0.8, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.2, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Kollar - yukarıda birleşmiş */}
      <mesh position={[-0.2, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[0.15, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 1.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[0.15, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Baş */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Savaşçı II (Warrior 2) pozu modeli
function Warrior2Model({ color }: { color: string }) {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Gövde */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Bacaklar - ön ve arka bacak, geniş duruş */}
      <mesh position={[-0.8, -0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[0.2, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.8, -0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.2, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Kollar - yanlara açılmış, düz bir çizgide */}
      <mesh position={[-1.2, 0.9, 0]} rotation={[0, 0, Math.PI/2]}>
        <capsuleGeometry args={[0.15, 1.0, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1.2, 0.9, 0]} rotation={[0, 0, Math.PI/2]}>
        <capsuleGeometry args={[0.15, 1.0, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Baş - gövdeyle aynı hizada */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Pozu renderleyen bileşen
function YogaPoseModel({ poseName }: { poseName: string }) {
    const color = POSE_COLORS[poseName] || '#FDC9BA';
  
  switch(poseName) {
    case 'downdog':
      return <DownDogModel color={color} />;
    case 'goddess':
      return <GoddessModel color={color} />;
    case 'plank':
      return <PlankModel color={color} />;
    case 'tree':
      return <TreeModel color={color} />;
    case 'warrior2':
      return <Warrior2Model color={color} />;
    default:
      // Varsayılan model
      return (
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.5, 3, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
}

// Ana sayfa bileşeni
function Home() {
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const autoRotateRef = useRef(true);
  
  // Her 5 saniyede bir poz değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPoseIndex((prev) => (prev + 1) % YOGA_POSES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const currentPose = YOGA_POSES[currentPoseIndex];
  const currentImage = IMAGE_LIST[currentPoseIndex];
  
  return (
    <div className="min-h-screen py-4 bg-gradient-to-br from-purple-50 to-gray-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-16 text-center">
                  <h1 className="text-6xl font-bold mb-4 text-gray-900">
                      Yoga Pozu Tespiti
                  </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            TensorFlow ile güçlendirilmiş yapay zeka destekli yoga pozu tespit uygulaması
          </p>
                  <Link
                      to="/live-detection"
                      className="inline-block py-3 px-8 bg-gradient-to-r from-purple-600 to-blue-400 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                      Canlı Tespit Başlat
                  </Link>

        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-semibold mb-6 text-gray-800">
              Yoga Pozunuzu Anında Tespit Edin
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Web kameranızı kullanarak gerçek zamanlı yoga pozu tespiti yapabilirsiniz. 
              Uygulamamız, TensorFlow ile eğitilmiş yapay zeka modeli sayesinde 
              pozunuzu analiz eder ve doğru formu yakalamanıza yardımcı olur.
            </p>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Tespit Edilen Pozlar:
              </h3>
              <div className="flex flex-wrap gap-2">
                {YOGA_POSES.map((pose, index) => (
                  <button 
                    key={pose} 
                    onClick={() => setCurrentPoseIndex(index)}
                    className="px-4 py-2 bg-pink-50 border border-pink-200 text-purple-700 font-bold text-sm rounded-full hover:bg-pink-100 transition-colors"
                  >
                    {pose}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl">
              <div className="space-y-2 text-gray-600">
                <p>✨ TensorFlow modeliyle güçlendirilmiş yapay zeka asistanı</p>
                <p>✨ 5 farklı yoga pozu tespiti (downdog, goddess, plank, tree, warrior2)</p>
                <p>✨ 3D modellerle doğru formun görselleştirmesi</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl shadow-lg overflow-hidden relative">
              <img
                src={currentImage}
                alt="Yoga Pozu"
                className="max-h-full max-w-full object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).src = '/images/default.png';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
