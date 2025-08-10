// import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Clock, Mail, RefreshCw } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// interface OTPVerificationProps {
//   email: string;
//   onVerificationSuccess: () => void;
//   onBack: () => void;
// }

// export default function OTPVerification({ email, onVerificationSuccess, onBack }: OTPVerificationProps) {
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [timer, setTimer] = useState(300); // 5 minutes countdown
//   const [canResend, setCanResend] = useState(false);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
//   const { login } = useAuth();

//   // Timer countdown
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleInputChange = (index: number, value: string) => {
//     if (value.length > 1) return;
    
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Auto-focus next input
//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       toast.error('Please enter the complete verification code');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-otp`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, otp: otpString }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         toast.success(data.message);
        
//         // Store token and user data
//         localStorage.setItem('token', data.token);
        
//         onVerificationSuccess();
//       } else {
//         toast.error(data.message);
//         // Clear OTP inputs if invalid
//         if (data.message.includes('Invalid') || data.message.includes('expired')) {
//           setOtp(['', '', '', '', '', '']);
//           inputRefs.current[0]?.focus();
//         }
//       }
//     } catch (error) {
//       toast.error('Verification failed. Please try again.');
//     }
    
//     setLoading(false);
//   };

//   const handleResendOTP = async () => {
//     if (!canResend || resending) return;
    
//     setResending(true);
    
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/resend-otp`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         toast.success('New verification code sent to your email');
//         setTimer(300); // Reset timer
//         setCanResend(false);
//         setOtp(['', '', '', '', '', '']); // Clear inputs
//         inputRefs.current[0]?.focus();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error('Failed to resend code. Please try again.');
//     }
    
//     setResending(false);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className="max-w-md mx-auto"
//     >
//       <div className="bg-white rounded-2xl shadow-xl p-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <motion.div
//             className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.2, type: "spring" }}
//           >
//             <Mail className="w-8 h-8 text-purple-600" />
//           </motion.div>
          
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Check your email
//           </h2>
//           <p className="text-gray-600">
//             We sent a 6-digit verification code to
//           </p>
//           <p className="text-purple-600 font-semibold">{email}</p>
//         </div>

//         {/* OTP Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="flex justify-center space-x-3">
//             {otp.map((digit, index) => (
//               <motion.input
//                 key={index}
//                 ref={(el) => (inputRefs.current[index] = el)}
//                 type="text"
//                 inputMode="numeric"
//                 pattern="[0-9]"
//                 maxLength={1}
//                 value={digit}
//                 onChange={(e) => handleInputChange(index, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(index, e)}
//                 className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ delay: index * 0.1 }}
//                 autoComplete="off"
//               />
//             ))}
//           </div>

//           {/* Timer */}
//           <div className="text-center">
//             {timer > 0 ? (
//               <p className="text-gray-500 flex items-center justify-center space-x-2">
//                 <Clock className="w-4 h-4" />
//                 <span>Code expires in {formatTime(timer)}</span>
//               </p>
//             ) : (
//               <p className="text-red-500 font-medium">Verification code has expired</p>
//             )}
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading || otp.join('').length !== 6}
//             className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Verifying...' : 'Verify Email'}
//           </button>
//         </form>

//         {/* Resend Button */}
//         <div className="mt-6 text-center">
//           <p className="text-gray-600 mb-3">
//             Didn't receive the code?
//           </p>
//           <button
//             onClick={handleResendOTP}
//             disabled={!canResend || resending}
//             className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//               canResend && !resending
//                 ? 'text-purple-600 hover:bg-purple-50'
//                 : 'text-gray-400 cursor-not-allowed'
//             }`}
//           >
//             <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
//             <span>{resending ? 'Sending...' : 'Resend Code'}</span>
//           </button>
//         </div>

//         {/* Back Button */}
//         <div className="mt-4 text-center">
//           <button
//             onClick={onBack}
//             className="text-gray-500 hover:text-gray-700 font-medium"
//           >
//             ← Back to Registration
//           </button>
//         </div>

//         {/* Email Tips */}
//         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//           <h4 className="font-semibold text-blue-900 mb-2">Can't find the email?</h4>
//           <ul className="text-sm text-blue-800 space-y-1">
//             <li>• Check your spam or junk folder</li>
//             <li>• Make sure you entered the correct email</li>
//             <li>• Wait a few minutes for delivery</li>
//             <li>• Check your email filters</li>
//           </ul>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
