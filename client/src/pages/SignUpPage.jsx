import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User, Mountain, Phone, Calendar, MapPin, ChevronDown, UserCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";
import { nepalData } from "../data/nepalData";

const getTodayDateValue = () => new Date().toISOString().slice(0, 10);
const getAgeFromDob = (dobValue) => {
	const birthDate = new Date(dobValue);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age -= 1;
	}
	return age;
};

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [dob, setDob] = useState("");
	const [phone, setPhone] = useState("");
	const [province, setProvince] = useState("");
	const [district, setDistrict] = useState("");
	const [gender, setGender] = useState("");
	const [formErrors, setFormErrors] = useState({});
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	const validateForm = () => {
		const errors = {};
		const today = getTodayDateValue();
		if (!name.trim()) errors.name = "Full Name is required";
		if (!dob) errors.dob = "Date of Birth is required";
		else if (dob > today) errors.dob = "Date of Birth cannot be in the future";
		else if (getAgeFromDob(dob) < 14) errors.dob = "You must be at least 14 years old to sign up";
		if (!gender) errors.gender = "Gender is required";
		if (!phone.trim()) errors.phone = "Phone number is required";
		if (!province) errors.province = "Province is required";
		if (!district) errors.district = "District is required";
		if (!email.trim()) errors.email = "Email is required";
		if (!password) errors.password = "Password is required";
		return errors;
	};

	const handleSignUp = async (e) => {
		e.preventDefault();
		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}
		setFormErrors({});

		try {
			await signup(email, password, name, dob, phone, province, district, gender);
			navigate("/verify-email");
		} catch (error) {
			console.log(error);
		}
	};

	const selectErrorClass = "border-destructive focus:border-destructive focus:ring-destructive/20";
	const selectNormalClass = "border-input focus:ring-primary/20 focus:border-ring";

	return (
		<div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-2xl">
				{/* Logo */}
				<div className="flex items-center justify-center gap-2 mb-8">
					<img src="/trek sathi logo.png" alt="Trek Sathi" className="h-9 w-auto object-contain" />
					<span className="font-extrabold text-xl text-[#111c14]">Trek Sathi</span>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-[#ddd8cc] p-8">
					<div className="text-center mb-7">
						<h1 className="text-2xl font-extrabold text-[#111c14] mb-1">Create your account</h1>
						<p className="text-[#5a6455] text-sm">Join the Nepal trekking community.</p>
					</div>

					<form onSubmit={handleSignUp} className="space-y-5">

						{/* Name and DOB Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<Input
								icon={<User className="w-5 h-5" />}
								type='text'
								placeholder='Full Name'
								value={name}
								onChange={(e) => setName(e.target.value)}
								label="Full Name"
								error={formErrors.name}
							/>
							<Input
								icon={<Calendar className="w-5 h-5" />}
								type='date'
								placeholder='Date of Birth'
								value={dob}
								onChange={(e) => setDob(e.target.value)}
								max={getTodayDateValue()}
								label="Date of Birth"
								required
								error={formErrors.dob}
							/>
							<p className="-mt-3 text-xs text-[#5a6455] md:col-start-2">
								You must be at least 14 years old to sign up.
							</p>
						</div>

						{/* Gender and Phone Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{/* Custom Select for Gender */}
							<div className="w-full">
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Gender
								</label>
								<div className="relative">
									<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
										<UserCheck className="w-5 h-5" />
									</div>
									<select
										value={gender}
										onChange={(e) => setGender(e.target.value)}
										className={`w-full bg-input-background border text-foreground text-sm rounded-xl focus:ring-2 block p-3 pl-10 appearance-none outline-none transition-all duration-200 ${formErrors.gender ? selectErrorClass : selectNormalClass}`}
									>
										<option value="" disabled>Select Gender</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
									</select>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
								{formErrors.gender && <p className="mt-1.5 text-sm text-destructive">{formErrors.gender}</p>}
							</div>

							<Input
								icon={<Phone className="w-5 h-5" />}
								type='tel'
								placeholder='Phone Number'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								label="Phone Number"
								error={formErrors.phone}
							/>
						</div>

						{/* Province and District Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{/* Custom Select for Province */}
							<div className="w-full">
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Province
								</label>
								<div className="relative">
									<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
										<MapPin className="w-5 h-5" />
									</div>
									<select
										value={province}
										onChange={(e) => {
											setProvince(e.target.value);
											setDistrict(""); // Reset district when province changes
										}}
										className={`w-full bg-input-background border text-foreground text-sm rounded-xl focus:ring-2 block p-3 pl-10 appearance-none outline-none transition-all duration-200 ${formErrors.province ? selectErrorClass : selectNormalClass}`}
									>
										<option value="" disabled>Select Province</option>
										{Object.keys(nepalData).map((prov) => (
											<option key={prov} value={prov}>{prov}</option>
										))}
									</select>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
								{formErrors.province && <p className="mt-1.5 text-sm text-destructive">{formErrors.province}</p>}
							</div>

							{/* Custom Select for District */}
							<div className="w-full">
								<label className="block text-sm font-medium text-foreground mb-1.5">
									District
								</label>
								<div className="relative">
									<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
										<MapPin className="w-5 h-5" />
									</div>
									<select
										value={district}
										onChange={(e) => setDistrict(e.target.value)}
										className={`w-full bg-input-background border text-foreground text-sm rounded-xl focus:ring-2 block p-3 pl-10 appearance-none outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.district ? selectErrorClass : selectNormalClass}`}
										disabled={!province}
									>
										<option value="" disabled>Select District</option>
										{province && nepalData[province]?.map((dist) => (
											<option key={dist} value={dist}>{dist}</option>
										))}
									</select>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
								{formErrors.district && <p className="mt-1.5 text-sm text-destructive">{formErrors.district}</p>}
							</div>
						</div>

						<Input
							icon={<Mail className="w-5 h-5" />}
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							label="Email Address"
							error={formErrors.email}
						/>

						<Input
							icon={<Lock className="w-5 h-5" />}
							type='password'
							placeholder='Password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							label="Password"
							error={formErrors.password}
						/>
						{error && <p className='text-destructive text-sm font-semibold mt-2'>{error}</p>}

						<PasswordStrengthMeter password={password} />

						<motion.button
							className='mt-5 w-full py-3 px-4 bg-primary text-white 
						font-bold rounded-xl shadow-lg hover:bg-primary/90
						transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-xl'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className='animate-spin' size={20} /> : "Create Trek Sathi account"}
						</motion.button>
					</form>
					<div className='text-center pt-4 border-t border-[#ddd8cc] mt-6'>
						<p className='text-[#5a6455] text-sm'>
							Already have an account?{" "}
							<Link to={"/login"} className='text-[#1a472a] font-semibold hover:underline'>
								Log in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;
