import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import {
  validateEmail,
  validatePhone,
  validateName,
  validatePassword,
} from '../utils/authUtils';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
}

interface InputFieldProps {
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  label,
}) => (
  <div className="space-y-2">
    <Label htmlFor={label.toLowerCase()} className="text-gray-300">
      {label}
    </Label>
    <div className="relative">
      <Icon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
        size={20}
      />
      <Input
        id={label.toLowerCase()}
        type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 ${
          showPasswordToggle ? 'pr-12' : 'pr-4'
        } bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder-gray-400 focus:ring-blue-500 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
      />
      {showPasswordToggle && (
        <Button
          type="button"
          onClick={onTogglePassword}
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 h-8 w-8 p-0"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      )}
    </div>
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
);

const Auth: React.FC = () => {
  const { login, register, isLoading, error, clearError, isAuthenticated } =
    useAuthContext();
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [isLoginView, clearError]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isLoginView) {
      const nameValidation = validateName(formData.name);
      if (!nameValidation.isValid) {
        errors.name = nameValidation.message;
      }

      if (!formData.phone) {
        errors.phone = 'Phone is required';
      } else if (!validatePhone(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isLoginView) {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } else {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
    }
  };

  const toggleView = () => {
    setIsLoginView((prev) => !prev);
    setFormData({ email: '', password: '', name: '', phone: '' });
    setFormErrors({});
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1F1F1F] rounded-2xl shadow-2xl border border-[#333] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLoginView ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400">
              {isLoginView
                ? 'Sign in to your account'
                : 'Sign up to get started'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginView && (
              <InputField
                icon={User}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={formErrors.name}
                label="Full Name"
              />
            )}

            <InputField
              icon={Mail}
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={formErrors.email}
              label="Email"
            />

            {!isLoginView && (
              <InputField
                icon={Phone}
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                error={formErrors.phone}
                label="Phone Number"
              />
            )}

            <InputField
              icon={Lock}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={formErrors.password}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={handleTogglePassword}
              label="Password"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLoginView ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLoginView
                ? "Don't have an account?"
                : 'Already have an account?'}
              <button
                type="button"
                onClick={toggleView}
                className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                {isLoginView ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
