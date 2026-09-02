import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Mountain, Mail } from "lucide-react";

const EmailVerificationPage = () => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();

	const { error, isLoading, verifyEmail } = useAuthStore();

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			navigate("/preferences");
			toast.success("Email verified successfully");
		} catch (error) {
			console.log(error);
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

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
						<div className="w-14 h-14 bg-[#d8f3dc] rounded-full flex items-center justify-center mx-auto mb-4">
							<Mail className="w-6 h-6 text-[#1a472a]" />
						</div>
						<h1 className="text-2xl font-extrabold text-[#111c14] mb-1">Verify your email</h1>
						<p className="text-[#5a6455] text-sm">Enter the 6-digit code sent to your email address.</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='flex justify-between gap-2'>
							{code.map((digit, index) => (
								<input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type='text'
									maxLength='6'
									value={digit}
									onChange={(e) => handleChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									className='w-12 h-12 text-center text-2xl font-bold bg-gray-100 text-gray-900 border-2 border-gray-400 rounded-xl focus:border-primary focus:outline-none transition-all'
								/>
							))}
						</div>
						{error && <p className='text-red-600 font-medium mt-2 text-center text-sm'>{error}</p>}
						<button
							type='submit'
							disabled={isLoading || code.some((digit) => !digit)}
							className='w-full bg-[#1a472a] hover:bg-[#15391f] text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? "Verifying..." : "Verify Email"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};
export default EmailVerificationPage;
