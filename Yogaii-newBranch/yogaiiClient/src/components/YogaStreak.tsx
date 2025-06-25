import React, { useState, useEffect } from 'react';
import {
    FireIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import {
    FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import streakService, { StreakData, DailyActivity } from '../services/StreakService';
import { useAuth } from '../contexts/AuthContext';

const availablePoses = [
    { name: 'downdog', label: 'Down Dog' },
    { name: 'plank', label: 'Plank' },
    { name: 'tree', label: 'Tree' },
    { name: 'goddess', label: 'Goddess' },
    { name: 'warrior2', label: 'Warrior 2' }
];

function YogaStreak() {
    const { user } = useAuth();
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [weeklyCalendar, setWeeklyCalendar] = useState<DailyActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeries, setSelectedSeries] = useState<{ pose: string; duration: number }[]>([]);
    const [durations, setDurations] = useState<{ [key: string]: string }>({});
    const [editingPose, setEditingPose] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [currentPoseIndex, setCurrentPoseIndex] = useState(0);

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) {
            setError('Kullanıcı bilgisi bulunamadı');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const [streakResult, activitiesResult] = await Promise.all([
                streakService.getUserStreak(user.id),
                streakService.getWeeklyActivities(user.id)
            ]);

            setStreakData(streakResult);
            setWeeklyCalendar(activitiesResult);
        } catch (err) {
            console.error('Veri yüklenirken hata:', err);
            setError('Veriler yüklenirken bir hata oluştu. Yerel veriler kullanılıyor.');

            try {
                const [streakResult, activitiesResult] = await Promise.all([
                    Promise.resolve(streakService.getMockStreakData(user.id)),
                    Promise.resolve(streakService.getMockWeeklyActivities(user.id))
                ]);

                setStreakData(streakResult);
                setWeeklyCalendar(activitiesResult);
            } catch (mockError) {
                console.error('Mock data yüklenirken hata:', mockError);
                setError('Veriler yüklenemedi. Lütfen sayfayı yenileyin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPose = (pose: string) => {
        const value = parseInt(durations[pose], 10);
        if (!value || value <= 0) return;
        if (selectedSeries.some(p => p.pose === pose)) return;
        setSelectedSeries([...selectedSeries, { pose, duration: value }]);
        setDurations(prev => ({ ...prev, [pose]: '' }));
    };

    const handleRemovePose = (pose: string) => {
        setSelectedSeries(prev => prev.filter(p => p.pose !== pose));
        setEditingPose(null);
    };

    const handleEditPose = (pose: string) => {
        const current = selectedSeries.find(p => p.pose === pose);
        if (current) setDurations(prev => ({ ...prev, [pose]: current.duration.toString() }));
        setEditingPose(pose);
    };

    const handleSaveEdit = (pose: string) => {
        const value = parseInt(durations[pose], 10);
        if (!value || value <= 0) return;
        setSelectedSeries(prev => prev.map(p => p.pose === pose ? { ...p, duration: value } : p));
        setEditingPose(null);
    };

    const handleStartSeries = () => {
        setIsRunning(true);
        setCurrentPoseIndex(0);
    };

    useEffect(() => {
        if (isRunning && currentPoseIndex < selectedSeries.length) {
            const current = selectedSeries[currentPoseIndex];
            const timer = setTimeout(() => {
                setCurrentPoseIndex(prev => prev + 1);
            }, current.duration * 1000); // saniyede değişim için *1000, dk için *60000

            return () => clearTimeout(timer);
        }
    }, [isRunning, currentPoseIndex]);

    const renderWeeklyCalendar = () => {
        const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

        return (
            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CalendarDaysIcon className="w-6 h-6" />
                    Bu Hafta
                </h3>
                <div className="grid grid-cols-7 gap-2">
                    {weeklyCalendar.map((day, index) => (
                        <div
                            key={day.date}
                            className={`p-3 text-center rounded-xl transition-all duration-300 cursor-pointer
                                hover:transform hover:scale-105 hover:shadow-xl
                                ${day.practiced ? 'bg-gradient-to-br from-purple-200 to-blue-200 text-gray-900 font-semibold shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                        >
                            <div className="text-sm font-medium mb-1">
                                {weekDays[index]}
                            </div>
                            <div className="mb-1">
                                {day.practiced ? (
                                    <CheckCircleIcon className="w-5 h-5 mx-auto text-green-500" />
                                ) : (
                                    <div className="w-5 h-5 mx-auto border-2 border-dashed border-gray-400 rounded-full"></div>
                                )}
                            </div>
                            <div className="text-xs">
                                {day.practiced ? `${day.duration}dk` : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4 text-center">
                <h4 className="text-2xl font-semibold mb-4">Yükleniyor...</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <XMarkIcon className="w-5 h-5 text-yellow-400 mr-2" />
                        <p className="text-yellow-800">{error}</p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!streakData) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">Streak verisi bulunamadı.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4 text-gray-900">
                    Yoga Serisi Takibi
                </h1>
                <p className="text-xl text-gray-600">
                    Günlük pratiğinizi sürdürün ve hedefinize ulaşın! 🧘‍♀️
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Hoş geldin, {user?.username}!
                </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-xl border border-purple-100 mb-8">
                <FireIconSolid className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                <div className="text-6xl font-bold text-purple-600 mb-2">{streakData?.currentStreak}</div>
                <div className="text-2xl mb-2 text-gray-700">Günlük Seri</div>
                <div className="text-lg text-gray-500">En uzun seriniz: {streakData?.longestStreak} gün</div>
            </div>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pozları Ekle</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {availablePoses.map(({ name, label }) => (
                        <div key={name} className="bg-sky-100 p-4 rounded-xl shadow flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-700 mb-2">{label}</h3>
                            <input
                                type="number"
                                min="1"
                                placeholder="Süre (dk)"
                                value={durations[name] || ''}
                                onChange={(e) => setDurations(prev => ({ ...prev, [name]: e.target.value }))}
                                className="mb-2 px-3 py-1 rounded-lg border border-gray-300 w-full text-center"
                                disabled={selectedSeries.some(p => p.pose === name) && editingPose !== name}
                            />
                            {editingPose === name ? (
                                <button onClick={() => handleSaveEdit(name)} className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full hover:bg-purple-700">
                                    Kaydet
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAddPose(name)}
                                    className="bg-white text-sm text-gray-700 px-3 py-1 rounded-full border hover:bg-gray-100"
                                    disabled={selectedSeries.some(p => p.pose === name)}
                                >
                                    <PlusIcon className="w-4 h-4 inline mr-1" /> Ekle
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selectedSeries.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Seçilen Pozlar</h3>
                    <ul className="space-y-2 mb-4">
                        {selectedSeries.map(({ pose, duration }, idx) => (
                            <li key={pose} className={`p-3 rounded-lg flex justify-between items-center ${idx === currentPoseIndex && isRunning ? 'bg-green-100' : 'bg-purple-50'}`}>
                                <span className="capitalize">{pose} - {duration} dk</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditPose(pose)} className="text-blue-500 hover:text-blue-700">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleRemovePose(pose)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {!isRunning && (
                        <button onClick={handleStartSeries} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                            Günlük Seriyi Başlat
                        </button>
                    )}
                </div>
            )}

            {renderWeeklyCalendar()}
        </div>
    );
}

export default YogaStreak;
