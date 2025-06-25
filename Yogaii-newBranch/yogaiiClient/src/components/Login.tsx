import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (error: any) {
            setError(error.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br
                from-gray-100 via-blue-100 to-blue-200
                flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <img
                            src="/images/lotus (1).png"
                            alt="Lotus Icon"
                            className="w-16 h-16 mr-3 drop-shadow-lg"
                        />
                        <div className="text-black">
                            <h1 className="text-4xl font-bold font-poppins">YogaAII</h1>
                            <p className="text-sm opacity-90">AI Destekli Yoga Asistanı</p>
                        </div>
                    </div>
                    <p className="text-black/80 text-lg">Yoga yolculuğunuza devam edin</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h2 className="text-3xl font-bold text-black text-center mb-8">Hoş Geldiniz</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="relative">
                            <label className="block text-black/90 font-medium text-lg mb-2">
                                Kullanıcı Adı
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Kullanıcı adınızı girin"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label className="block text-black/90 font-medium text-lg mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Şifrenizi girin"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                    Giriş Yapılıyor...
                                </div>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <div className="h-px bg-white/20"></div>
                        <p className="text-black/80">
                            Hesabınız yok mu?{' '}
                            <Link 
                                to="/" 
                                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-300"
                            >
                                Hemen kayıt olun
                            </Link> 
                        </p>
                        <p className="text-black/60 text-sm">
                            Yoga pratiğinizi AI ile geliştirin 🧘‍♀️
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;