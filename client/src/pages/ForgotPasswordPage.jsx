import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { isLoading, forgotPassword, error } = useAuthStore();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await forgotPassword(email);
			setIsSubmitted(true);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="flex items-center justify-center gap-2 mb-8">
					<img src="/trek sathi logo.png" alt="Trek Sathi" className="h-9 w-auto object-contain" />
					<span className="font-extrabold text-xl text-[#111c14]">Trek Sathi</span>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-[#ddd8cc] p-8">
					<div className="text-center mb-7">
						<h1 className="text-2xl font-extrabold text-[#111c14] mb-1">Forgot password?</h1>
						{!isSubmitted && <p className="text-[#5a6455] text-sm">Enter your email and we'll send a reset link.</p>}
					</div>

					{!isSubmitted ? (
						<form onSubmit={handleSubmit} className="space-y-5">
							{error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 rounded-xl px-4 py-2 border border-red-100">{error}</p>}
							<Input
								icon={<Mail className="w-5 h-5" />}
								type='email'
								placeholder='Email Address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								label="Email Address"
								required
							/>
							<button
								type='submit'
								disabled={isLoading}
								className='w-full py-3 px-4 bg-[#1a472a] hover:bg-[#15391f] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50'
							>
								{isLoading ? <Loader className='animate-spin' size={20} /> : "Send Reset Link"}
							</button>
						</form>
					) : (
						<div className='text-center'>
							<div className='w-16 h-16 bg-[#d8f3dc] rounded-full flex items-center justify-center mx-auto mb-4'>
								<Mail className='h-8 w-8 text-[#1a472a]' />
							</div>
							<p className='text-[#5a6455] text-sm mb-6'>
								If an account exists for{' '}
								<span className="font-semibold text-[#111c14]">{email}</span>
								, you will receive a password reset link shortly.
							</p>
						</div>
					)}

					<div className='text-center pt-4 border-t border-[#ddd8cc] mt-6'>
						<Link to={"/login"} className='text-sm text-[#1a472a] hover:text-[#15391f] flex items-center justify-center font-medium gap-1'>
							<ArrowLeft className='h-4 w-4' /> Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ForgotPasswordPage;
