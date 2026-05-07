import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import apiService from "./services/api";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Wallet() {
	const { user, isLoggedIn } = useContext(AuthContext);
	const [words, setWords] = useState(Array(12).fill(""));
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [savedWords, setSavedWords] = useState([]);

	useEffect(() => {
		// Load existing wallet words from the Word API
		const loadWalletWords = async () => {
			try {
				await delay(200);
				const response = await apiService.getUserWords({ category: "wallet" });
				const walletWords = response.words || [];
				setSavedWords(walletWords);

				// Populate the form with existing words
				const existing = Array.from(
					{ length: 12 },
					(_, i) => walletWords[i]?.content || "",
				);
				setWords(existing);
			} catch (error) {
				console.error("Failed to load wallet words:", error);
			}
		};

		if (isLoggedIn) {
			loadWalletWords();
		}
	}, [isLoggedIn]);

	useEffect(() => {
		if (!isLoggedIn || !user) {
			window.location.href = "#/login";
		}
	}, [isLoggedIn, user]);

	if (!isLoggedIn || !user) {
		return null;
	}

	const handleChange = (index, value) => {
		const next = [...words];
		next[index] = value;
		setWords(next);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setMessage("");

		try {
			// Get non-empty words
			const validWords = words.map((w) => (w || "").trim()).filter((w) => w);

			if (validWords.length === 0) {
				setMessage("Please enter at least one word");
				return;
			}

			// Delete existing wallet words first
			for (const savedWord of savedWords) {
				await delay(200);
				await apiService.deleteWord(savedWord.id);
			}

			// Save new words as individual Word entities
			for (let i = 0; i < validWords.length; i++) {
				await delay(200);
				await apiService.createWord({
					content: validWords[i],
					category: "wallet",
					tags: [`position-${i + 1}`],
					is_favorite: false,
				});
			}

			setMessage("Wallet words saved successfully!");

			// Reload the words to update the UI
			await delay(200);
			const response = await apiService.getUserWords({ category: "wallet" });
			setSavedWords(response.words || []);

			// Keep the words in the form for user to see
		} catch (err) {
			console.error("Failed to save words:", err);
			setMessage("Failed to save words. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="pt-24 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-4 max-md:text-lg w-full !text-red-500 text-center">
					Import Wallet (12-word phrase)
				</h1>
				<p className="text-white/60 mb-6 text-center !mb-5">
					Enter your 12 recovery words.
				</p>

				<form
					onSubmit={handleSave}
					className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6"
				>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-md:grid-cols-2">
						{words.map((w, i) => (
							<input
								required
								key={i}
								value={w}
								onChange={(e) => handleChange(i, e.target.value)}
								placeholder={`Word ${i + 1}`}
								className="px-4 py-2 border border-white/10 rounded-lg bg-transparent text-white"
							/>
						))}
					</div>

					<div className="mt-4 flex flex-col items-center gap-3">
						<button
							type="submit"
							disabled={saving}
							className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium max-md:w-full"
						>
							{saving ? "Saving..." : "Save Words"}
						</button>
						{message && (
							<span className="text-sm text-white/70">{message}</span>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
