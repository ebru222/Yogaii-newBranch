import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HeartIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useGLTF } from '@react-three/drei';
import ApiService, { YogaPose } from '../services/ApiService';

function PoseDetail() {
    const { poseName } = useParams<{ poseName: string }>();
    const [pose, setPose] = useState<YogaPose | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const uniqueColor = useMemo(() => {
        const colors = ['#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#FDC9BA'];
        const nameSum = poseName?.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) || 0;
        return colors[nameSum % colors.length];
    }, [poseName]);

    useEffect(() => {
        const fetchPoseDetails = async () => {
            if (!poseName) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                
                // Backend'den pose detaylarını çek
                const poseData = await ApiService.getPoseByName(poseName);
                setPose(poseData);
            } catch (error: any) {
                console.error('Pose detayları alınırken hata:', error);
                
                // Backend'den veri gelmezse fallback olarak mock data kullan
                const mockPoseData: YogaPose = {
                    id: poseName === 'downdog' ? 1 : poseName === 'goddess' ? 2 : poseName === 'plank' ? 3 : poseName === 'tree' ? 4 : 5,
                    name: poseName === 'downdog' ? 'Down Dog' : poseName === 'goddess' ? 'Goddess' : poseName === 'plank' ? 'Plank' : poseName === 'tree' ? 'Tree' : 'Warrior 2',
                    description: poseName === 'downdog'
                        ? 'Aşağı Bakan Köpek pozu sırtı ve bacakları esnetir, omurganızı uzatır ve tüm vücudunuzu çalıştırır. Bu temel yoga pozunda ellerin ve ayakların yere bastığı ters V şeklinde bir duruş sergilenir.'
                        : poseName === 'goddess'
                            ? 'Tanrıça pozu kalçaları açar ve güçlendirir, bacak kaslarınızı çalıştırır ve iç gücünüzü artırır. Geniş duruş ile güç ve kararlılığı simgeler.'
                            : poseName === 'plank'
                                ? 'Plank pozu karın kaslarını güçlendirir, çekirdek stabilizasyonu sağlar ve vücut duruşunu iyileştirir. Tüm vücut gücünü geliştiren temel bir egzersizdir.'
                                : poseName === 'tree'
                                    ? 'Ağaç pozu dengeyi geliştirir, odaklanmayı artırır ve bacak kaslarını güçlendirir. Tek ayak üzerinde durulan bu poz iç huzuru destekler.'
                                    : 'Savaşçı 2 pozu bacak kaslarını güçlendirir, göğsü açar ve dayanıklılığı artırır. Güç ve kararlılığı temsil eden dinamik bir duruştur.',
                    imageUrl: `/images/poses/${poseName}.jpg`,
                    modelUrl: `/models/poses/${poseName}.glb`
                };
                
                setPose(mockPoseData);
                setError('Backend\'den veri alınamadı, yerel veriler kullanılıyor.');
            } finally {
                setLoading(false);
            }
        };

        fetchPoseDetails();
    }, [poseName]);

    const poseDetails = useMemo(() => {
        if (!poseName) return null;
        const details = {
            downdog: { 
                difficulty: 'Orta', 
                benefits: ['Omurga esnetir', 'Hamstring güçlendirir', 'Kan dolaşımını iyileştirir', 'Stresi azaltır'], 
                duration: '30-60 sn', 
                caution: 'Bilek problemleri olan kişiler dikkatli olmalı' 
            },
            goddess: { 
                difficulty: 'Orta', 
                benefits: ['Kalça açar', 'Bacak güçlendirir', 'İç güç artırır', 'Denge geliştirir'], 
                duration: '30-60 sn', 
                caution: 'Diz problemleri olan kişiler dikkatli olmalı' 
            },
            plank: { 
                difficulty: 'Zor', 
                benefits: ['Çekirdek güçlendirir', 'Duruş iyileştirir', 'Kol kas gücü artırır', 'Omurga stabilizasyonu'], 
                duration: '20-60 sn', 
                caution: 'Bilek ve omuz problemleri olan kişiler dikkatli olmalı' 
            },
            tree: { 
                difficulty: 'Orta', 
                benefits: ['Denge geliştirir', 'Bacak kasları güçlendirir', 'Odaklanma artırır', 'İç huzur sağlar'], 
                duration: '30-60 sn', 
                caution: 'Denge problemleri olan kişiler dikkatli olmalı' 
            },
            warrior2: { 
                difficulty: 'Orta', 
                benefits: ['Bacak güçlendirir', 'Göğüs açar', 'Dayanıklılık artırır', 'Güven geliştirir'], 
                duration: '30-60 sn', 
                caution: 'Diz problemleri olan kişiler dikkatli olmalı' 
            }
        };
        return details[poseName as keyof typeof details];
    }, [poseName]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                                <div className="space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center mb-8">
                            <Link 
                                to="/poses" 
                                className="flex items-center bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg mr-4 transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Tüm Pozlar
                            </Link>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent">
                                {pose?.name}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="h-96 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                    <img 
                                        src={`/gifs/${poseName}.gif`} 
                                        alt={pose?.name} 
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                            (e.target as HTMLImageElement).src = '/images/default.gif';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                                        Pozun Açıklaması
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {pose?.description}
                                    </p>
                                </div>

                                {poseDetails && (
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
                                                <p className="text-sm opacity-90 mb-1">Zorluk</p>
                                                <p className="text-xl font-semibold">{poseDetails.difficulty}</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl p-4 text-center">
                                                <p className="text-sm opacity-90 mb-1">Süre</p>
                                                <p className="text-xl font-semibold">{poseDetails.duration}</p>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Faydaları</h3>
                                        <ul className="space-y-3 mb-6">
                                            {poseDetails.benefits.map((benefit, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <HeartIcon className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                                                    <span className="text-gray-700">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Dikkat Edilmesi Gerekenler</h3>
                                        <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                            <ClockIcon className="w-5 h-5 mr-2" />
                                            <span className="text-sm font-medium">{poseDetails.caution}</span>
                                        </div>

                                        <Link 
                                            to="/live-detection" 
                                            className="block w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-center py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                                        >
                                            Bu Pozu Canlı Dene
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PoseDetail;

// GLB modelinin önden yüklenmesini sağlayalım
useGLTF.preload('/3d-models/tree-pose.glb');
