import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { Lock, Mountain } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword, error, isLoading, message } = useAuthStore();

	const { token } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}
		try {
			await resetPassword(token, password);

			toast.success("Password reset successfully, redirecting to login page...");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error) {
			console.error(error);
			toast.error(error.message || "Error resetting password");
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
						<h1 className="text-2xl font-extrabold text-[#111c14] mb-1">Reset password</h1>
						<p className="text-[#5a6455] text-sm">Enter your new password below.</p>
					</div>
					{error && <p className='text-red-600 text-sm mb-4 bg-red-50 rounded-xl px-4 py-2 border border-red-100 text-center'>{error}</p>}
					{message && <p className='text-[#1a472a] text-sm mb-4 bg-[#d8f3dc] rounded-xl px-4 py-2 border border-[#b7e4c7] text-center'>{message}</p>}

					<form onSubmit={handleSubmit} className="space-y-5">
						<Input
							icon={<Lock className="w-5 h-5" />}
							type='password'
							placeholder='New Password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							label="New Password"
							required
						/>

						<Input
							icon={<Lock className="w-5 h-5" />}
							type='password'
							placeholder='Confirm New Password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							label="Confirm Password"
							required
						/>

						<button
						type='submit'
						disabled={isLoading}
						className='w-full py-3 px-4 bg-[#1a472a] hover:bg-[#15391f] text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50'
					>
						{isLoading ? "Resetting..." : "Set New Password"}
					</button>
					</form>
				</div>
			</div>
		</div>
	);
};
export default ResetPasswordPage;
