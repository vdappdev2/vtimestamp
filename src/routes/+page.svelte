<script lang="ts">
	// Landing page - vtimestamp MVP
</script>

<svelte:head>
	<title>vtimestamp — Decentralized Document Timestamping on Verus</title>
	<meta name="description" content="Prove your documents existed at a specific moment in time. Free, decentralized, privacy-first timestamps on the Verus blockchain. Your files never leave your device." />
	<link rel="canonical" href="https://vtimestamp.com/" />
	<meta property="og:title" content="vtimestamp — Decentralized Document Timestamping" />
	<meta property="og:description" content="Prove your documents existed at a specific moment in time. Free, decentralized, privacy-first timestamps on the Verus blockchain." />
	<meta property="og:url" content="https://vtimestamp.com/" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://vtimestamp.com/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://vtimestamp.com/og-image.png" />
	<meta name="twitter:title" content="vtimestamp — Decentralized Document Timestamping" />
	<meta name="twitter:description" content="Prove your documents existed at a specific moment in time. Free, decentralized, privacy-first timestamps on the Verus blockchain." />
	{@html `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "vtimestamp",
  "description": "Decentralized document timestamping on Verus blockchain. Prove any document existed at a specific point in time without uploading it. Privacy-first — your files never leave your device.",
  "applicationCategory": "BlockchainApplication",
  "operatingSystem": "Web",
  "url": "https://vtimestamp.com",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "vdappdev2"
  },
  "license": "https://opensource.org/licenses/MIT"
}
</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-16">
	<!-- Hero Section -->
	<section class="text-center mb-16">
		<h1 class="text-4xl md:text-5xl font-bold mb-6 text-primary">
			Prove your ideas existed<br />at a specific moment in time
		</h1>
		<p class="text-xl text-secondary max-w-2xl mx-auto">
			Create immutable, decentralized timestamps for your documents, inventions, and creative works.
			Powered by Verus blockchain.
		</p>
	</section>

	<!-- Use Cases -->
	<section class="mb-16">
		<h2 class="text-2xl font-semibold text-center mb-8">What can you timestamp?</h2>
		<div class="grid md:grid-cols-3 gap-6">
			<div class="card text-center">
				<div class="mb-3 flex justify-center">
					<svg viewBox="0 0 24 24" class="w-9 h-9" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.6 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
						<path d="M9 18h6"/>
						<path d="M10 22h4"/>
					</svg>
				</div>
				<h3 class="font-semibold mb-2">Inventions</h3>
				<p class="text-secondary text-sm">Timestamp your ideas before filing patents</p>
			</div>
			<div class="card text-center">
				<div class="mb-3 flex justify-center">
					<svg viewBox="0 0 24 24" class="w-9 h-9" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
						<path d="M15 5l4 4"/>
					</svg>
				</div>
				<h3 class="font-semibold mb-2">Creative Works</h3>
				<p class="text-secondary text-sm">Prove when your art, music, or writing existed</p>
			</div>
			<div class="card text-center">
				<div class="mb-3 flex justify-center">
					<svg viewBox="0 0 24 24" class="w-9 h-9" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
						<polyline points="14 2 14 8 20 8"/>
						<line x1="8" y1="13" x2="16" y2="13"/>
						<line x1="8" y1="17" x2="16" y2="17"/>
					</svg>
				</div>
				<h3 class="font-semibold mb-2">Documents</h3>
				<p class="text-secondary text-sm">Certify contracts, agreements, and records</p>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="mb-16">
		<h2 class="text-2xl font-semibold text-center mb-8">How it works</h2>
		<div class="grid md:grid-cols-4 gap-4">
			<div class="text-center">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">1</div>
				<p class="text-sm">Login with your VerusID</p>
			</div>
			<div class="text-center">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">2</div>
				<p class="text-sm">Upload file or paste text</p>
			</div>
			<div class="text-center">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">3</div>
				<p class="text-sm">Review hash & approve</p>
			</div>
			<div class="text-center">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">4</div>
				<p class="text-sm">Proof stored on blockchain</p>
			</div>
		</div>
	</section>

	<!-- Key Features -->
	<section>
		<h2 class="text-2xl font-semibold text-center mb-8">Why vtimestamp?</h2>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="card">
				<h3 class="font-semibold mb-2">Decentralized</h3>
				<p class="text-secondary text-sm">Your proofs are stored on the Verus blockchain, not our servers. Verify anytime, anywhere.</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-2">Privacy-First</h3>
				<p class="text-secondary text-sm">Only the hash is stored. Your documents never leave your device.</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-2">Self-Sovereign</h3>
				<p class="text-secondary text-sm">Timestamps are stored on YOUR VerusID. You own your data.</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-2">Permissionless</h3>
				<p class="text-secondary text-sm">Anyone can verify proofs using the blockchain. No gatekeepers.</p>
			</div>
		</div>
	</section>
</div>

<!-- Legal Disclaimer -->
<div class="bg-surface border-t border-theme py-4 mt-8">
	<div class="max-w-4xl mx-auto px-4">
		<p class="text-xs text-secondary text-center">
			<strong>Disclaimer:</strong> vtimestamp provides cryptographic proof of document existence at a point in time.
			This is not legal registration. Admissibility varies by jurisdiction. Consult legal counsel for important matters.
		</p>
	</div>
</div>
