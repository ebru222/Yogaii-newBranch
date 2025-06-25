import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    UserIcon, 
    LockClosedIcon, 
    EnvelopeIcon,
    CheckCircleIcon 
} from '@heroicons/react/24/outline';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Form validasyonu
        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler uyuşmuyor');
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setIsLoading(true);

        try {
            await register(formData.username, formData.email, formData.password);
            setIsSuccess(true);
            // 2 saniye sonra login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            setError(error.message || 'Kayıt olurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-blue-700 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 text-center max-w-md w-full">
                    <CheckCircleIcon className="w-20 h-20 text-green-300 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Kayıt Başarılı!</h2>
                    <p className="text-white/80 mb-6">
                        Hoş geldiniz! Hesabınız başarıyla oluşturuldu. 
                        Giriş sayfasına yönlendiriliyorsunuz...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br
                from-gray-100 via-blue-100 to-blue-200
                flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-300 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-pink-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg">
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
                    <h2 className="text-black/90 text-xl">Yoga yolculuğunuza başlayın</h2>
                </div>

                {/* Registration Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h2 className="text-3xl font-bold text-black text-center mb-8">Hesap Oluşturun</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div className="relative">
                            <label className="block text-black/90 font-medium text-base mb-2">
                                Kullanıcı Adı
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-black placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Kullanıcı adınızı girin"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                            <label className="block text-black/90 font-medium text-base mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Email adresinizi girin"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label className="block text-black/90 font-medium text-base mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Şifrenizi girin (min 6 karakter)"
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

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <label className="block text-black/90 font-medium text-base mb-2">
                                Şifre Tekrarı
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Şifrenizi tekrar girin"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                                >
                                    {showConfirmPassword ? (
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

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-base rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Hesap Oluşturuluyor...
                                </div>
                            ) : (
                                'Hesap Oluştur'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <div className="h-px bg-white/20"></div>
                        <p className="text-black/80">
                            Zaten hesabınız var mı?{' '}
                            <Link 
                                to="/login" 
                                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-300"
                            >
                                Giriş yapın
                            </Link>
                        </p>
                        <p className="text-black/60 text-sm">
                            AI destekli yoga deneyimine hoş geldiniz 🌸
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
