import React, { useState } from 'react';

// Tip tanımları
interface Pose {
    name: string;
    color: string;
}

interface SeriesItem {
    pose: string;
    duration: string | number;
}

interface Durations {
    [key: string]: string;
}

const poses: Pose[] = [
    { name: "downdog", color: "linear-gradient(135deg, #cad3e0 0%, #a6c1ee 100%)" },
    { name: "plank", color: "linear-gradient(135deg, #a6c1ee 0%, #cad3e0 100%)" },
    { name: "warrior", color: "linear-gradient(135deg, #cad3e0 0%, #a6c1ee 100%)" },
    { name: "tree", color: "linear-gradient(135deg, #a6c1ee 0%, #cad3e0 100%)" },
    { name: "goddess", color: "linear-gradient(135deg, #cad3e0 0%, #a6c1ee 100%)" }
];

export default function SeriesBuilder() {
    const [durations, setDurations] = useState<Durations>({});
    const [selectedSeries, setSelectedSeries] = useState<SeriesItem[]>([]);
    const [editingPose, setEditingPose] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const handleDurationChange = (pose: string, value: string) => {
        setDurations({ ...durations, [pose]: value });
    };

    const handleAddPose = (pose: string) => {
        const duration = durations[pose];
        if (!duration || Number(duration) <= 0) {
            alert("Lütfen geçerli bir süre girin.");
            return;
        }
        if (selectedSeries.some(item => item.pose === pose)) {
            alert("Bu poz zaten seriye eklendi.");
            setDurations(prev => ({ ...prev, [pose]: "" }));
            return;
        }
        setSelectedSeries([...selectedSeries, { pose, duration }]);
        setDurations(prev => ({ ...prev, [pose]: "" }));
    };

    const handleRemovePose = (pose: string) => {
        const updatedSeries = selectedSeries.filter(item => item.pose !== pose);
        setSelectedSeries(updatedSeries);
    };

    const handleStartSeries = () => {
        if (selectedSeries.length === 0) {
            alert("Seri oluşturmak için en az 1 poz ekleyin.");
            return;
        }
        console.log("Seri Başlıyor:", selectedSeries);
    };

    const handleEditPose = (pose: string, currentDuration: string | number) => {
        setEditingPose(pose);
        setEditValue(String(currentDuration));
    };

    const handleSaveEdit = () => {
        const updatedSeries = selectedSeries.map(item =>
            item.pose === editingPose ? { ...item, duration: editValue } : item
        );
        setSelectedSeries(updatedSeries);
        setEditingPose(null);
        setEditValue("");
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#ffffff',
            padding: '50px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                background: '#5a189a',
                color: '#fff',
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px' }}>YOGAII</div>
                <div style={{
                    fontSize: '20px',
                    cursor: 'pointer',
                    transition: 'color 0.3s'
                }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.color = '#ffdf00'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.color = '#fff'}
                >
                    Ana Sayfa
                </div>
            </div>

            <h1 style={{
                textAlign: 'center',
                fontSize: '40px',
                color: '#5a189a',
                marginBottom: '50px',
                textShadow: '1px 1px 4px rgba(0,0,0,0.2)'
            }}>
                Yoga Serisi Oluştur
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '50px' }}>
                {poses.map(({ name, color }) => (
                    <div key={name} style={{
                        background: color,
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        padding: '30px',
                        width: '200px',
                        textAlign: 'center',
                        transition: 'transform 0.3s',
                        cursor: 'pointer'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px', textTransform: 'capitalize' }}>{name}</h2>
                        <input
                            type="number"
                            placeholder="Süre (dk)"
                            value={durations[name] || ""}
                            onChange={(e) => handleDurationChange(name, e.target.value)}
                            style={{
                                width: '80%',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #ccc',
                                marginBottom: '20px'
                            }}
                        />
                        <button onClick={() => handleAddPose(name)} style={{
                            padding: '10px 20px',
                            borderRadius: '50px',
                            border: 'none',
                            background: '#fff',
                            color: '#333',
                            fontWeight: 'bold',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}>
                            ➕ Ekle
                        </button>
                    </div>
                ))}
            </div>

            <div style={{
                background: '#f5f5f5',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                padding: '30px',
                margin: 'auto',
                width: '70%',
                marginBottom: '50px'
            }}>
                <h3 style={{ fontSize: '28px', marginBottom: '20px', color: '#5a189a' }}>📝 Seçilen Pozlar</h3>
                {selectedSeries.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#aaa' }}>Henüz poz seçilmedi.</p>
                ) : (
                    <ul style={{ fontSize: '20px', color: '#333' }}>
                        {selectedSeries.map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                {editingPose === item.pose ? (
                                    <>
                                        <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            style={{ width: '80px', marginRight: '10px' }}
                                        />
                                        <button onClick={handleSaveEdit} style={{
                                            background: '#5a189a',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '5px 10px',
                                            marginRight: '10px',
                                            cursor: 'pointer'
                                        }}>Kaydet</button>
                                    </>
                                ) : (
                                    <>
                                        <span>{item.pose} - {item.duration} dk</span>
                                        <div>
                                            <button onClick={() => handleEditPose(item.pose, item.duration)} style={{
                                                background: '#a1c4fd',
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                padding: '5px 10px',
                                                marginRight: '10px',
                                                cursor: 'pointer'
                                            }}>Düzenle</button>
                                            <button onClick={() => handleRemovePose(item.pose)} style={{
                                                background: '#ff4d4d',
                                                border: 'none',
                                                borderRadius: '50%',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                width: '35px',
                                                height: '35px',
                                                cursor: 'pointer',
                                                boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
                                            }}>X</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ textAlign: 'center' }}>
                <button onClick={handleStartSeries} style={{
                    padding: '20px 60px',
                    borderRadius: '60px',
                    background: 'linear-gradient(135deg, #5a189a, #8fd3f4)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s'
                }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}>Seriye Başla</button>
            </div>
        </div>
    );
}