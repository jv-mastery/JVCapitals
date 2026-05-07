import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import apiService from "./services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fmt(v) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number(v) || 0);
}

// User Creation Form Component
function CreateUserForm({ onUserCreated }) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		adminCode: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await delay(200);
			const response = await apiService.adminCreateUser(formData);
			setSuccess("User created successfully!");
			setFormData({ name: "", email: "", password: "", adminCode: "" });
			if (onUserCreated) {
				onUserCreated(response.user);
			}
		} catch (err) {
			setError(err.message || "Failed to create user");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6">
			<h2 className="text-2xl font-bold mb-4 text-white">Create New User</h2>

			{error && (
				<div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded text-red-400">
					{error}
				</div>
			)}

			{success && (
				<div className="mb-4 p-3 bg-green-600/20 border border-green-600 rounded text-green-400">
					{success}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-white/80 mb-1">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full p-2 bg-[#0b0f18] rounded border border-white/5 text-white focus:border-red-500 focus:outline-none"
							placeholder="Enter user name"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-white/80 mb-1">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full p-2 bg-[#0b0f18] rounded border border-white/5 text-white focus:border-red-500 focus:outline-none"
							placeholder="Enter email address"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-white/80 mb-1">
							Password
						</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
							minLength="6"
							className="w-full p-2 bg-[#0b0f18] rounded border border-white/5 text-white focus:border-red-500 focus:outline-none"
							placeholder="Enter password (min 6 chars)"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-white/80 mb-1">
							Admin Code (optional - required for admin users)
						</label>
						<input
							type="text"
							name="adminCode"
							value={formData.adminCode}
							onChange={handleChange}
							className="w-full p-2 bg-[#0b0f18] rounded border border-white/5 text-white focus:border-red-500 focus:outline-none"
							placeholder="Enter admin code to create admin user"
						/>
						<p className="text-xs text-white/50 mt-1">
							Leave empty to create regular user
						</p>
					</div>
				</div>

				<div className="flex gap-4">
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-medium text-white transition"
					>
						{loading ? "Creating..." : "Create User"}
					</button>
					<button
						type="button"
						onClick={() => {
							setFormData({ name: "", email: "", password: "", adminCode: "" });
							setError("");
							setSuccess("");
						}}
						className="px-6 py-2 border border-white/10 rounded font-medium text-white hover:bg-white/10 transition"
					>
						Clear
					</button>
				</div>
			</form>
		</div>
	);
}

function UserCard({ u, canEdit, onSave, saving }) {
	const [showPassword, setShowPassword] = useState(false);
	const [editing, setEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState(() => {
		const totalBalance = u?.total_balance || 0;
		const initialBalance = u?.initial_balance || totalBalance;
		const interestEarned = u?.interest_earned || 0;

		return {
			name: u?.name || "",
			email: u?.email || "",
			isAdmin: u?.is_admin || false,
			isActive: u?.is_active !== false,
			initialBalance,
			interestEarned,
			totalBalance,
		};
	});

	// Use useLayoutEffect to update form synchronously during the commit phase
	// This avoids the warning and prevents cascading renders
	useLayoutEffect(() => {
		if (!editing) {
			const totalBalance = u?.total_balance || 0;
			const initialBalance = u?.initial_balance || totalBalance;
			const interestEarned = u?.interest_earned || 0;

			setForm({
				name: u?.name || "",
				email: u?.email || "",
				isAdmin: u?.is_admin || false,
				isActive: u?.is_active !== false,
				initialBalance,
				interestEarned,
				totalBalance,
			});
		}
	}, [u, editing]);

	const created = u?.created_at
		? new Date(u.created_at).toLocaleString()
		: "---";

	const save = async () => {
		setIsSaving(true);
		try {
			const updated = {
				...u,
				name: form.name,
				email: form.email,
				is_admin: form.isAdmin,
				is_active: form.isActive,
				initial_balance: Number(form.initialBalance) || 0,
				interest_earned: Number(form.interestEarned) || 0,
				total_balance: Number(form.totalBalance) || 0,
			};
			await onSave(updated);
			// Only close edit form after successful save
			setEditing(false);
		} catch (error) {
			console.error("Failed to save user:", error);
			// Keep edit form open on error so user can retry
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="bg-[#070a11]/80 border border-white/5 rounded-lg p-4 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
					<h3 className="text-lg font-semibold text-white">
						{u?.name || "---"}
					</h3>
					<p className="text-sm text-white/60">{u?.email || "---"}</p>
				</div>
				<div className="text-right ">
					<span
						className={`px-2 py-1 text-xs rounded ${u?.isAdmin || u?.is_admin ? "bg-red-600 text-white" : "bg-white/5 text-white/70"}`}
					>
						{u?.isAdmin || u?.is_admin ? "Admin" : "User"}
					</span>
				</div>
			</div>

			<div className="mt-3 grid grid-cols-1 gap-2 text-sm">
				<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
					<span className="font-medium text-white/80">Password:</span>{" "}
					<span className="text-white/60">
						{showPassword ? u?.password || "—" : "••••••••"}
					</span>
					<button
						type="button"
						onClick={() => setShowPassword((s) => !s)}
						className="ml-3 text-xs text-red-400"
					>
						{showPassword ? "Hide" : "Show"}
					</button>
				</div>

				<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
					<span className="font-medium text-white/80">Created:</span>{" "}
					<span className="text-white/60">{created}</span>
				</div>

				<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
					<span className="font-medium text-white/80">ID:</span>{" "}
					<span className="text-white/50 break-all text-xs">{u?.id}</span>
				</div>

				<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
					<span className="font-medium text-white/80">
						Words ({u?.words?.length || 0}):
					</span>
					{Array.isArray(u?.words) && u.words.length > 0 ? (
						<ol className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 list-decimal list-inside">
							{u.words.map((w, i) => (
								<li
									key={w.id || i}
									className="text-white/60 bg-white/5 px-2 py-1 rounded text-xs"
								>
									{w.content}
								</li>
							))}
						</ol>
					) : (
						<div className="text-white/50 mt-1">No words</div>
					)}
				</div>

				{/* Wallets Section */}
				{Array.isArray(u?.wallets) && u.wallets.length > 0 && (
					<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
						<span className="font-medium text-white/80">Wallets:</span>
						<div className="mt-2 space-y-2">
							{u.wallets.map((wallet, i) => (
								<div
									key={wallet.id || i}
									className="bg-white/5 px-2 py-1 rounded text-xs"
								>
									<div className="text-white/80">{wallet.wallet_type}</div>
									<div className="text-white/60">{wallet.wallet_address}</div>
									<div className="text-white font-medium">
										{fmt(wallet.balance)}
									</div>
									{wallet.assets && wallet.assets.length > 0 && (
										<div className="text-white/50 mt-1">
											Assets: {wallet.assets.length}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Assets Section */}
				{Array.isArray(u?.assets) && u.assets.length > 0 && (
					<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
						<span className="font-medium text-white/80">
							Assets ({u.assets.length}):
						</span>
						<div className="mt-2 grid grid-cols-1 gap-1">
							{u.assets.map((asset, i) => (
								<div
									key={asset.id || i}
									className="bg-white/5 px-2 py-1 rounded text-xs"
								>
									<div className="text-white/80">
										{asset.name} ({asset.symbol})
									</div>
									<div className="text-white/60">
										{asset.quantity} × {fmt(asset.current_price)} ={" "}
										{fmt(asset.value)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="border border-gray-500/30 rounded-2xl p-2 w-full">
					<h4 className="text-sm font-medium text-white/80 mb-2">
						Asset Balances
					</h4>

					{!editing ? (
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-white/60">Initial:</span>
								<span className="text-white font-medium">
									{fmt(u?.initial_balance || u?.total_balance || 0)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-white/60">Interest:</span>
								<span className="text-white font-medium">
									{fmt(u?.interest_earned || 0)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-white/60">Total:</span>
								<span className="text-white font-medium">
									{fmt(u?.total_balance || 0)}
								</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-3 pt-3 border-t border-white/10">
								{u?.wallets && u.wallets.length > 0 && (
									<div className="text-white/60">
										Wallets:{" "}
										<span className="text-white font-medium">
											{u.wallets.length}
										</span>
									</div>
								)}
								{u?.assets && u.assets.length > 0 && (
									<div className="text-white/60">
										Assets:{" "}
										<span className="text-white font-medium">
											{u.assets.length}
										</span>
									</div>
								)}
								{canEdit && (
									<button
										onClick={() => {
											setForm({
												name: u?.name || "",
												email: u?.email || "",
												isAdmin: u?.is_admin || false,
												isActive: u?.is_active !== false,
												initialBalance:
													u?.initial_balance || u?.total_balance || 0,
												interestEarned: u?.interest_earned || 0,
												totalBalance: u?.total_balance || 0,
											});
											setEditing(true);
										}}
										className="ml-auto px-3 py-1 bg-red-600 rounded mt-2 sm:mt-0"
									>
										Edit
									</button>
								)}
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-2">
							<label className="flex flex-col">
								<span className="text-sm text-white/70 mb-1">Name</span>
								<input
									className="p-2 bg-[#0b0f18] rounded border border-white/5"
									type="text"
									value={form.name}
									onChange={(e) =>
										setForm({
											...form,
											name: e.target.value,
										})
									}
								/>
							</label>
							<label className="flex flex-col">
								<span className="text-sm text-white/70 mb-1">Email</span>
								<input
									className="p-2 bg-[#0b0f18] rounded border border-white/5"
									type="email"
									value={form.email}
									onChange={(e) =>
										setForm({
											...form,
											email: e.target.value,
										})
									}
								/>
							</label>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={form.isActive}
									onChange={(e) =>
										setForm({
											...form,
											isActive: e.target.checked,
										})
									}
									className="mr-2"
								/>
								<span className="text-sm text-white/70">Account Active</span>
							</label>
							<label className="flex flex-col">
								<span className="text-sm text-white/70 mb-1">
									Initial Balance
								</span>
								<input
									className="p-2 bg-[#0b0f18] rounded border border-white/5"
									type="number"
									value={form.initialBalance}
									onChange={(e) =>
										setForm({
											...form,
											initialBalance: e.target.value,
										})
									}
								/>
							</label>
							<label className="flex flex-col">
								<span className="text-sm text-white/70 mb-1">
									Interest Earned
								</span>
								<input
									className="p-2 bg-[#0b0f18] rounded border border-white/5"
									type="number"
									value={form.interestEarned}
									onChange={(e) =>
										setForm({
											...form,
											interestEarned: e.target.value,
										})
									}
								/>
							</label>
							<label className="flex flex-col">
								<span className="text-sm text-white/70 mb-1">
									Total Balance
								</span>
								<input
									className="p-2 bg-[#0b0f18] rounded border border-white/5"
									type="number"
									value={form.totalBalance}
									onChange={(e) =>
										setForm({
											...form,
											totalBalance: e.target.value,
										})
									}
								/>
							</label>

							<div className="flex gap-2">
								<button
									onClick={save}
									disabled={isSaving}
									className="px-3 py-1 bg-green-600 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{isSaving ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Saving...
										</>
									) : (
										"Save"
									)}
								</button>
								<button
									onClick={() => {
										setEditing(false);
										setForm({
											initialBalance:
												u?.initial_balance || u?.total_balance || 0,
											interestEarned: u?.interest_earned || 0,
											totalBalance: u?.total_balance || 0,
										});
									}}
									className="px-3 py-1 border border-white/10 rounded"
								>
									Cancel
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Wallet Balance Management Component
function WalletBalanceManager() {
	const queryClient = useQueryClient();
	const [selectedWallet, setSelectedWallet] = useState(null);
	const [newBalance, setNewBalance] = useState("");
	const [newInitialBalance, setNewInitialBalance] = useState("");

	// Get current ETH price for USD conversion
	const { data: priceData } = useQuery({
		queryKey: ["ethereumPrice"],
		queryFn: async () => {
			const { priceService } = await import("./services/priceService");
			const price = await priceService.getEthereumPrice();
			return price;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});

	const ethPrice = priceData || 3500; // Fallback price

	// Calculate USD value
	const calculateUSD = (ethAmount) => {
		return (parseFloat(ethAmount || 0) * ethPrice).toLocaleString("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	// Fetch all wallets
	const {
		data: wallets = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["adminWallets"],
		queryFn: async () => {
			await delay(200);
			const response = await apiService.getAllUsers();
			const allWallets = [];

			(response.users || []).forEach((user) => {
				if (user.wallets && user.wallets.length > 0) {
					user.wallets.forEach((wallet) => {
						allWallets.push({
							id: wallet.id,
							address: wallet.wallet_address,
							type: wallet.wallet_type,
							balance: wallet.balance,
							userEmail: user.email,
							userName: user.name,
							userId: user.id,
						});
					});
				}
			});

			return allWallets;
		},
	});

	// Update wallet balance mutation
	const updateBalanceMutation = useMutation({
		mutationFn: async ({ walletId, newBalance }) => {
			// Use the same authentication pattern as apiService
			const API_BASE_URL =
				import.meta.env.VITE_API_URL || "http://localhost:3000/api";
			const token = localStorage.getItem("jwt_token");

			if (!token) {
				throw new Error("Authentication token required");
			}

			await delay(200);
			const response = await fetch(
				`${API_BASE_URL}/seed-phrase/admin/update-wallet-balance`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ walletId, newBalance }),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update wallet balance");
			}

			return response.json();
		},
		onSuccess: (data) => {
			if (process.env.NODE_ENV !== "production") {
				console.log("Wallet balance updated:", data);
			}
			queryClient.invalidateQueries(["adminWallets"]);
			queryClient.invalidateQueries(["adminUsers"]);
			setSelectedWallet(null);
			setNewBalance("");
			alert(`Wallet balance updated successfully by ${data.updatedBy}`);
		},
		onError: (error) => {
			console.error("Failed to update wallet balance:", error);
			alert(`Error: ${error.message}`);
		},
	});

	const handleUpdateBalance = () => {
		if (!selectedWallet || !newBalance) {
			alert("Please select a wallet and enter a new balance");
			return;
		}

		const balance = parseFloat(newBalance);
		if (isNaN(balance) || balance < 0) {
			alert("Please enter a valid non-negative balance");
			return;
		}

		// Update wallet balance
		updateBalanceMutation.mutate({
			walletId: selectedWallet.id,
			newBalance: balance,
		});

		// If initial balance is also provided, update it
		if (newInitialBalance) {
			const initialBalance = parseFloat(newInitialBalance);
			if (!isNaN(initialBalance) && initialBalance >= 0) {
				updateUserInitialBalance(selectedWallet.userId, initialBalance);
			}
		}
	};

	// Update user's initial_balance
	const updateUserInitialBalance = async (userId, initialBalance) => {
		try {
			await delay(200);
			await apiService.updateUserBalance(userId, {
				initial_balance: initialBalance,
				interest_earned: 0, // Keep existing interest earned
				total_balance: initialBalance, // This will be recalculated by trigger
			});

			// Refresh data
			queryClient.invalidateQueries(["adminUsers"]);
			if (process.env.NODE_ENV !== "production") {
				console.log(
					`Updated user ${userId} initial_balance to $${initialBalance}`,
				);
			}
		} catch (error) {
			console.error("Failed to update initial balance:", error);
			alert(`Error updating initial balance: ${error.message}`);
		}
	};

	if (isLoading) {
		return (
			<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-bold mb-4 text-white">
					Wallet Balance Manager
				</h2>
				<p className="text-white/60">Loading wallets...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-bold mb-4 text-white">
					Wallet Balance Manager
				</h2>
				<p className="text-red-400">Error loading wallets: {error.message}</p>
			</div>
		);
	}

	return (
		<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6">
			<h2 className="text-2xl font-bold mb-4 text-white">
				Wallet Balance Manager
			</h2>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Wallet List */}
				<div>
					<h3 className="text-lg font-semibold text-white mb-3">All Wallets</h3>
					<div className="space-y-2 max-h-64 overflow-y-auto">
						{wallets.length === 0 ? (
							<p className="text-white/60">No wallets found</p>
						) : (
							wallets.map((wallet) => (
								<div
									key={wallet.id}
									className={`p-3 border rounded-lg cursor-pointer transition-colors ${
										selectedWallet?.id === wallet.id
											? "border-blue-500 bg-blue-500/10"
											: "border-white/10 hover:border-white/20 bg-white/5"
									}`}
									onClick={() => {
										setSelectedWallet(wallet);
										setNewBalance(wallet.balance.toString());
									}}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<p className="text-white font-medium text-sm">
												{wallet.userEmail}
											</p>
											<p className="text-white/60 text-xs">{wallet.userName}</p>
											<p className="text-white/80 text-xs font-mono truncate">
												{wallet.address}
											</p>
											<p className="text-white/60 text-xs">{wallet.type}</p>
										</div>
										<div className="text-right">
											<p className="text-green-400 font-medium text-sm">
												{wallet.balance} ETH
											</p>
											<p className="text-white/60 text-xs">
												{calculateUSD(wallet.balance)}
											</p>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Balance Update Form */}
				<div>
					<h3 className="text-lg font-semibold text-white mb-3">
						Update Balance
					</h3>

					{selectedWallet ? (
						<div className="space-y-4">
							<div className="bg-white/5 border border-white/10 rounded-lg p-3">
								<p className="text-white/60 text-xs mb-1">Selected Wallet</p>
								<p className="text-white font-medium text-sm">
									{selectedWallet.userEmail}
								</p>
								<p className="text-white/80 text-xs font-mono truncate">
									{selectedWallet.address}
								</p>
								<p className="text-green-400 text-sm">
									Current: {selectedWallet.balance} ETH (
									{calculateUSD(selectedWallet.balance)})
								</p>
								{newBalance && (
									<p className="text-blue-400 text-sm">
										New: {newBalance} ETH ({calculateUSD(newBalance)})
									</p>
								)}
							</div>

							<div>
								<label className="block text-white/60 text-sm mb-2">
									New Balance (ETH)
								</label>
								<input
									type="number"
									step="0.000001"
									min="0"
									value={newBalance}
									onChange={(e) => setNewBalance(e.target.value)}
									className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
									placeholder="Enter new balance"
								/>
								{newBalance && (
									<p className="text-white/50 text-xs mt-1">
										USD Value: {calculateUSD(newBalance)}
									</p>
								)}
							</div>

							{/* Manual Initial Balance Update */}
							<div className="border-t border-white/10 pt-4">
								<h4 className="text-white font-medium text-sm mb-3">
									Manual Initial Balance Update
								</h4>
								<div>
									<label className="block text-white/60 text-sm mb-2">
										Initial Balance (USD)
									</label>
									<input
										type="number"
										step="0.01"
										min="0"
										value={newInitialBalance}
										onChange={(e) => setNewInitialBalance(e.target.value)}
										className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
										placeholder="Enter initial balance in USD"
									/>
								</div>
							</div>

							<div className="flex gap-2">
								<button
									onClick={handleUpdateBalance}
									disabled={updateBalanceMutation.isPending}
									className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
								>
									{updateBalanceMutation.isPending
										? "Updating..."
										: "Update Balance"}
								</button>
								<button
									onClick={() => {
										setSelectedWallet(null);
										setNewBalance("");
										setNewInitialBalance("");
									}}
									className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-white/60 text-sm">
								Select a wallet from the list to update its balance
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Statistics */}
			<div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white/5 border border-white/10 rounded-lg p-3">
					<p className="text-white/60 text-xs">Total Wallets</p>
					<p className="text-lg font-bold text-white">{wallets.length}</p>
				</div>
				<div className="bg-white/5 border border-white/10 rounded-lg p-3">
					<p className="text-white/60 text-xs">Total ETH Balance</p>
					<p className="text-lg font-bold text-green-400">
						{wallets
							.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0)
							.toFixed(6)}{" "}
						ETH
					</p>
				</div>
				<div className="bg-white/5 border border-white/10 rounded-lg p-3">
					<p className="text-white/60 text-xs">Total USD Value</p>
					<p className="text-lg font-bold text-blue-400">
						{calculateUSD(
							wallets.reduce(
								(sum, wallet) => sum + parseFloat(wallet.balance || 0),
								0,
							),
						)}
					</p>
				</div>
				<div className="bg-white/5 border border-white/10 rounded-lg p-3">
					<p className="text-white/60 text-xs">Unique Users</p>
					<p className="text-lg font-bold text-white">
						{new Set(wallets.map((w) => w.userEmail)).size}
					</p>
				</div>
			</div>
		</div>
	);
}

export default function AdminPanel() {
	const { user } = useContext(AuthContext);
	const canEdit = !!user?.isAdmin;
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [stats, setStats] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		perPage: 50,
		totalPages: 1,
		totalItems: 0,
	});

	const fetchUsers = async (page = 1, perPage = 50) => {
		try {
			setLoading(true);
			await delay(200);
			const response = await apiService.getAllUsers({
				page,
				limit: perPage,
			});
			setUsers(response.users || []);
			setStats(response.stats || null);
			setPagination((prev) => ({
				...prev,
				currentPage: page,
				perPage: perPage,
				totalPages: response.pagination?.total_pages || 1,
				totalItems: response.pagination?.total_items || 0,
			}));
		} catch (err) {
			console.error("Failed to fetch users:", err);
			setError(err.message || "Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!user?.isAdmin) {
			setError("Access denied. Admin privileges required.");
			setLoading(false);
			return;
		}

		fetchUsers(pagination.currentPage, pagination.perPage);
	}, [user]);

	const saveUser = async (updated) => {
		try {
			setSaving(true);
			setError(null);

			// Update local state immediately for responsiveness
			const next = users.map((u) => (u.id === updated.id ? updated : u));
			setUsers(next);

			// Update user details
			await delay(200);
			await apiService.updateUserDetails(updated.id, {
				name: updated.name,
				email: updated.email,
				is_admin: updated.is_admin,
				is_active: updated.is_active,
			});

			// Update balance
			await delay(200);
			await apiService.updateUserBalance(updated.id, {
				initial_balance: updated.initial_balance,
				interest_earned: updated.interest_earned,
				total_balance: updated.total_balance,
			});

			if (process.env.NODE_ENV !== "production") {
				console.log("User updated successfully:", updated);
			}
			// Refresh data to get latest from database
			fetchUsers();

			// Return success for UserCard to handle
			return { success: true };
		} catch (err) {
			console.error("Failed to save user:", err);
			setError(err.message || "Failed to save user");
			// Revert local state on error
			fetchUsers();
			// Return error for UserCard to handle
			throw err;
		} finally {
			setSaving(false);
		}
	};

	const handleUserCreated = (newUser) => {
		// Add the new user to the local state
		setUsers((prevUsers) => [newUser, ...prevUsers]);
		// Refresh the entire user list to get complete data
		fetchUsers();
	};

	return (
		<div className="pt-24 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold mb-6 text-center">Admin Panel</h1>

				<p className="text-white/60 !mb-6 text-center">
					List of users and details. Admins can edit per-user asset balances and
					create new user accounts here.
				</p>

				{/* User Creation Form */}
				<CreateUserForm onUserCreated={handleUserCreated} />

				{/* Wallet Balance Manager */}
				<WalletBalanceManager />

				{/* Stats Section */}
				{stats && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-4 text-center">
							<div className="text-2xl font-bold text-white">
								{stats.total_users}
							</div>
							<div className="text-sm text-white/60">Total Users</div>
						</div>
						<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-4 text-center">
							<div className="text-2xl font-bold text-white">
								{stats.admin_users}
							</div>
							<div className="text-sm text-white/60">Admin Users</div>
						</div>
						<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-4 text-center">
							<div className="text-2xl font-bold text-white">
								{fmt(stats.total_balance)}
							</div>
							<div className="text-sm text-white/60">Total Balance</div>
						</div>
						<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-4 text-center">
							<div className="text-2xl font-bold text-white">
								{stats.total_assets}
							</div>
							<div className="text-sm text-white/60">Total Assets</div>
						</div>
					</div>
				)}

				<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
					{error ? (
						<p className="text-red-400">{error}</p>
					) : loading ? (
						<p className="text-white/60">Loading...</p>
					) : users.length === 0 ? (
						<p className="text-white/60">No users found.</p>
					) : (
						<>
							{/* Pagination Controls */}
							{pagination.totalPages > 1 && (
								<div className="flex justify-between items-center mb-6 bg-white/5 rounded-lg p-4">
									<div className="text-white/60">
										Showing{" "}
										{(pagination.currentPage - 1) * pagination.perPage + 1}-
										{Math.min(
											pagination.currentPage * pagination.perPage,
											pagination.totalItems,
										)}{" "}
										of {pagination.totalItems} users
									</div>
									<div className="flex gap-2">
										<button
											onClick={() =>
												fetchUsers(
													Math.max(1, pagination.currentPage - 1),
													pagination.perPage,
												)
											}
											disabled={pagination.currentPage === 1}
											className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors text-sm"
										>
											Previous
										</button>
										<div className="flex gap-1">
											{Array.from({ length: pagination.totalPages }, (_, i) => (
												<button
													key={i + 1}
													onClick={() => fetchUsers(i + 1, pagination.perPage)}
													className={`px-3 py-1 rounded transition-colors text-sm ${
														i + 1 === pagination.currentPage
															? "bg-blue-600 text-white"
															: "bg-white/10 text-white hover:bg-white/20"
													}`}
												>
													{i + 1}
												</button>
											))}
										</div>
										<button
											onClick={() =>
												fetchUsers(
													Math.min(
														pagination.totalPages,
														pagination.currentPage + 1,
													),
													pagination.perPage,
												)
											}
											disabled={
												pagination.currentPage === pagination.totalPages
											}
											className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors text-sm"
										>
											Next
										</button>
									</div>
								</div>
							)}

							{/* User Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{users.map((u) => (
									<UserCard
										key={u.id}
										u={u}
										canEdit={canEdit}
										onSave={saveUser}
										saving={saving}
									/>
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
