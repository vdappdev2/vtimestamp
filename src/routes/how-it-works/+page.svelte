<svelte:head>
	<title>How Blockchain Timestamping Works | vtimestamp</title>
	<meta name="description" content="Learn how vtimestamp creates and verifies cryptographic proof that documents existed at a specific time. SHA-256 hashing, VerusID signing, and permissionless verification explained." />
	<link rel="canonical" href="https://vtimestamp.com/how-it-works" />
	<meta property="og:title" content="How Blockchain Timestamping Works | vtimestamp" />
	<meta property="og:description" content="Learn how vtimestamp creates and verifies cryptographic proof that documents existed at a specific time. SHA-256 hashing, VerusID signing, and permissionless verification explained." />
	<meta property="og:url" content="https://vtimestamp.com/how-it-works" />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="https://vtimestamp.com/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://vtimestamp.com/og-image.png" />
	<meta name="twitter:title" content="How Blockchain Timestamping Works | vtimestamp" />
	<meta name="twitter:description" content="Learn how vtimestamp creates and verifies cryptographic proof that documents existed at a specific time." />
	{@html `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How Blockchain Timestamping Works",
  "description": "Learn how vtimestamp creates and verifies cryptographic proof that documents existed at a specific time. SHA-256 hashing, VerusID signing, and permissionless verification explained.",
  "url": "https://vtimestamp.com/how-it-works",
  "image": "https://vtimestamp.com/og-image.png",
  "author": { "@type": "Person", "name": "vdappdev2", "url": "https://github.com/vdappdev2" },
  "publisher": { "@type": "Organization", "name": "vtimestamp", "url": "https://vtimestamp.com" },
  "datePublished": "2026-03-03T00:00:00+00:00",
  "dateModified": "2026-03-03T00:00:00+00:00"
}
</script>`}
</svelte:head>

<div class="content-page">
	<!-- Hero -->
	<section class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold mb-4 text-primary">
			How vtimestamp Works
		</h1>
		<p class="text-lg text-secondary max-w-2xl mx-auto">
			vtimestamp creates cryptographic proof that a document existed at a specific point in time. The proof is stored permanently on the Verus blockchain, tied to your VerusID. Your documents never leave your device.
		</p>
	</section>

	<!-- Creating a Timestamp -->
	<section class="content-section">
		<h2>Creating a Timestamp</h2>

		<div class="space-y-6">
			<!-- Step 1 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-semibold">1</div>
				<div>
					<h3 class="font-semibold mb-1">Hash Your Document</h3>
					<p class="text-secondary text-sm mb-2">
						Your browser computes a <strong>SHA-256 hash</strong> of your file or text using the Web Crypto API. This happens entirely on your device — the document is never uploaded, transmitted, or stored anywhere.
					</p>
					<div class="code-block">
						<span class="text-secondary">Document:</span> quarterly-report.pdf (2.1 MB)<br/>
						<span class="text-secondary">SHA-256:</span>&nbsp; a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
					</div>
					<p class="text-secondary text-sm">
						SHA-256 is a one-way function. Given the hash, no one can reconstruct your document. Given a different document, no one can produce the same hash. The hash is a unique fingerprint — nothing more.
					</p>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-semibold">2</div>
				<div>
					<h3 class="font-semibold mb-1">Add Metadata</h3>
					<p class="text-secondary text-sm mb-2">
						You provide a title (required) and optionally a description. If you uploaded a file, the filename and file size are captured automatically.
					</p>
					<div class="code-block">
						<span class="text-secondary">Title:</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Q4 Financial Report"<br/>
						<span class="text-secondary">Description:</span> "Final approved version"<br/>
						<span class="text-secondary">Filename:</span>&nbsp;&nbsp;&nbsp; quarterly-report.pdf<br/>
						<span class="text-secondary">File Size:</span>&nbsp;&nbsp; 2,097,152 bytes
					</div>
					<p class="text-secondary text-sm">
						The system also checks for duplicates — if you've already timestamped this exact hash on your identity, you'll see a warning before proceeding.
					</p>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-semibold">3</div>
				<div>
					<h3 class="font-semibold mb-1">Sign with Your VerusID</h3>
					<p class="text-secondary text-sm mb-2">
						vtimestamp constructs an identity update request containing your hash and metadata, packaged as VDXF data. The service identity signs this request — so your wallet knows it's a legitimate vtimestamp request — then presents it to you as a QR code (or deep link on mobile).
					</p>
					<p class="text-secondary text-sm">
						You approve the request in <strong>Verus Mobile</strong> or a compatible wallet app. This proves your identity — only you can sign for your VerusID — and broadcasts an <code class="hash">updateidentity</code> transaction to the Verus blockchain. The service never has control of your identity; it only constructs the request. You authorize it.
					</p>
				</div>
			</div>

			<!-- Step 4 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-semibold">4</div>
				<div>
					<h3 class="font-semibold mb-1">Blockchain Confirmation</h3>
					<p class="text-secondary text-sm mb-2">
						Once the transaction is included in a block, your timestamp is permanent. The block provides:
					</p>
					<ul class="text-secondary text-sm space-y-1 ml-4 list-disc">
						<li><strong>Block height</strong> — the position in the chain (e.g., block #4,523,891)</li>
						<li><strong>Block hash</strong> — the cryptographic fingerprint of the block itself</li>
						<li><strong>Block time</strong> — the consensus-verified timestamp of when the block was mined</li>
						<li><strong>Transaction ID</strong> — the unique identifier for your specific transaction</li>
					</ul>
					<p class="text-secondary text-sm mt-2">
						These values are immutable. No one can change them after the fact — not you, not the service, not anyone.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Verifying a Timestamp -->
	<section class="content-section">
		<h2>Verifying a Timestamp</h2>
		<p>Anyone can verify a timestamp. No login. No account. No special access. Just the document and the identity name.</p>

		<div class="space-y-6">
			<!-- Step 1 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-surface border-2 border-theme flex items-center justify-center shrink-0 font-semibold text-primary">1</div>
				<div>
					<h3 class="font-semibold mb-1">Hash the Document</h3>
					<p class="text-secondary text-sm">
						The verifier uploads the same file (or pastes the same text). The browser computes the SHA-256 hash locally — identical process to creation. If the document has been modified by even a single byte, the hash will be completely different.
					</p>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-surface border-2 border-theme flex items-center justify-center shrink-0 font-semibold text-primary">2</div>
				<div>
					<h3 class="font-semibold mb-1">Search the Identity's History</h3>
					<p class="text-secondary text-sm">
						The system queries the Verus blockchain using <code class="hash">getidentityhistory</code>, retrieving every update ever made to that VerusID. It scans each update for the <code class="hash">proof.basic</code> key and compares stored hashes against the computed hash.
					</p>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="card flex gap-4">
				<div class="w-10 h-10 rounded-full bg-surface border-2 border-theme flex items-center justify-center shrink-0 font-semibold text-primary">3</div>
				<div>
					<h3 class="font-semibold mb-1">Confirm the Block</h3>
					<p class="text-secondary text-sm mb-2">
						If a match is found, the system retrieves the block that contains the transaction. The block time is the proof — the consensus-agreed moment when that block was mined and your hash was inside it.
					</p>
					<div class="code-block">
						<span style="color: var(--color-success);">Verified: YES</span><br/>
						Identity: alice@<br/>
						Title:&nbsp;&nbsp;&nbsp; Q4 Financial Report<br/>
						Date:&nbsp;&nbsp;&nbsp;&nbsp; Feb 18, 2025, 10:30:45 AM<br/>
						Block:&nbsp;&nbsp;&nbsp; #4,523,891<br/>
						Tx:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; a1b2c3d4e5f6...
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Why This Can't Be Faked -->
	<section class="content-section">
		<h2>Why This Can't Be Faked</h2>
		<div class="comparison-table-wrap">
			<table class="comparison-table">
				<thead>
					<tr>
						<th>Attack</th>
						<th>Why It Fails</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Backdate a timestamp</td>
						<td>The block time is set by blockchain consensus. You can't insert data into a past block.</td>
					</tr>
					<tr>
						<td>Modify after creation</td>
						<td>Each identity update is a separate transaction. Previous entries are part of the chain's immutable history.</td>
					</tr>
					<tr>
						<td>Claim someone else's</td>
						<td>The timestamp is on a specific VerusID. Only the identity owner can sign <code class="hash">updateidentity</code> transactions.</td>
					</tr>
					<tr>
						<td>Forge a matching document</td>
						<td>SHA-256 is collision-resistant. No known method exists to produce two different documents with the same hash.</td>
					</tr>
					<tr>
						<td>Forge the verification</td>
						<td>Anyone can run their own verification against the public blockchain. There's no single authority to compromise.</td>
					</tr>
					<tr>
						<td>Delete a timestamp</td>
						<td>Blockchain data is append-only. Historical identity states are preserved in the chain's history forever.</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="text-secondary text-sm mt-4">
			The trust model is simple: the blockchain provides the time, cryptography provides the fingerprint, and your VerusID provides the ownership. No single party controls all three.
		</p>
	</section>

	<!-- Privacy by Design -->
	<section class="content-section">
		<h2>Privacy by Design</h2>
		<p>vtimestamp is built around a core privacy principle: <strong>your documents never leave your device</strong>.</p>

		<div class="grid md:grid-cols-2 gap-6 mt-4">
			<div class="card">
				<h3 class="font-semibold mb-3" style="color: var(--color-text-secondary);">What's Public</h3>
				<ul class="text-secondary text-sm space-y-2">
					<li>SHA-256 hash</li>
					<li>Title you chose</li>
					<li>Description you wrote</li>
					<li>Filename (if provided)</li>
					<li>File size (if provided)</li>
					<li>Block time and height</li>
					<li>Your VerusID name</li>
				</ul>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-3" style="color: var(--color-text-secondary);">What's Private</h3>
				<ul class="text-secondary text-sm space-y-2">
					<li>The actual document contents</li>
					<li>Any data not explicitly added as metadata</li>
					<li>Your device never transmits files or text to any server</li>
				</ul>
			</div>
		</div>

		<p class="text-secondary text-sm mt-4">
			The hash is a one-way function. Given the hash, no one can determine whether the original was a PDF, a photo, a text file, or a novel. They can only confirm: "this exact data existed when this block was mined."
		</p>
		<p class="text-secondary text-sm">
			You control how much metadata to include. Title is required (for your own organization), but description, filename, and file size are optional. If you want maximum privacy, use a generic title and skip the optional fields.
		</p>
	</section>

	<!-- Cross-links -->
	<div class="cross-links">
		<h3>Learn more</h3>
		<div class="flex flex-wrap gap-3">
			<a href="/compare">Compare &rarr;</a>
			<a href="/faq">FAQ &rarr;</a>
			<a href="/verify">Verify a Timestamp &rarr;</a>
		</div>
	</div>
</div>
