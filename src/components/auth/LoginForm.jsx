import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import AuthService from "./AuthService";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await AuthService.login(email, password);
      onLoginSuccess(response);
    } catch (err) {
      setError(err.message || 'Error desconocido. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 dark:bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 dark:bg-yellow-400 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 dark:bg-green-400 rounded-full filter blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-white border-4 border-black neo-card flex items-center justify-center p-2 mx-auto mb-6 shadow-2xl"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b819a7cae_Emblema-azul-fondo-transparente.png" 
              alt="Kovac Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex';
                }
              }}
            />
            <LogIn className="w-8 h-8 text-blue-600 hidden" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-black text-white uppercase mb-2 tracking-wide">
              KOVAC C.A.
            </h1>
            <p className="text-white/80 font-bold uppercase tracking-wider text-sm">
              Autoescuela y Gestoría
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-yellow-500 mx-auto mt-4 rounded-full"></div>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm neo-card border-4 border-black dark:border-white p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-black dark:text-white uppercase">Iniciar Sesión</h2>
            <p className="text-gray-600 dark:text-gray-300 font-bold text-sm mt-1">Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-black uppercase text-black dark:text-white text-sm">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neo-input h-12 font-bold text-lg transition-all duration-200 focus:scale-[1.02]"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-black uppercase text-black dark:text-white text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="neo-input h-12 font-bold text-lg pr-12 transition-all duration-200 focus:scale-[1.02]"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-300 p-4 neo-card flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full neo-button bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-lg font-black uppercase tracking-wide transition-all duration-200 hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent animate-spin mr-3 rounded-full"></div>
                  INGRESANDO...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-3" />
                  INGRESAR
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
              Sistema de Gestión Administrativa
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">
              © 2024 Kovac C.A.
            </p>
          </div>
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className="text-white/60 text-xs font-bold uppercase">
            Autoescuela certificada INTT • Chacaíto, Caracas
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}