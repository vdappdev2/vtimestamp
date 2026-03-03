<svelte:head>
	<title>FAQ — Document Timestamping Questions Answered | vtimestamp</title>
	<meta name="description" content="Common questions about vtimestamp: privacy, cost, verification, VerusID, SHA-256 hashing, and how blockchain timestamping works. Everything you need to know." />
	<link rel="canonical" href="https://vtimestamp.com/faq" />
	<meta property="og:title" content="FAQ — Document Timestamping Questions Answered | vtimestamp" />
	<meta property="og:description" content="Common questions about vtimestamp: privacy, cost, verification, VerusID, SHA-256 hashing, and how blockchain timestamping works." />
	<meta property="og:url" content="https://vtimestamp.com/faq" />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="FAQ — Document Timestamping Questions Answered | vtimestamp" />
	<meta name="twitter:description" content="Common questions about vtimestamp: privacy, cost, verification, VerusID, SHA-256 hashing, and how blockchain timestamping works." />
	{@html `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is document timestamping?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Document timestamping is the process of creating cryptographic proof that a specific piece of data existed at a specific point in time. The proof is a SHA-256 hash of your document, recorded on a blockchain with a consensus-verified timestamp."
      }
    },
    {
      "@type": "Question",
      "name": "What is vtimestamp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "vtimestamp is a free, open-source, decentralized timestamping service built on the Verus blockchain. It lets you prove that a document, file, or piece of text existed at a specific moment in time. Your documents never leave your device — only a hash is published."
      }
    },
    {
      "@type": "Question",
      "name": "Are my documents uploaded to the blockchain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Your documents never leave your device. vtimestamp computes a SHA-256 hash of your file or text entirely in your browser using the Web Crypto API. Only this hash (a 64-character string) is stored on the blockchain."
      }
    },
    {
      "@type": "Question",
      "name": "Can a timestamp be faked or backdated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The block time is set by blockchain consensus — you can't insert data into a past block. Each identity update is a separate, immutable transaction. SHA-256 is collision-resistant, so no one can produce a different document with the same hash."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "vtimestamp itself is free. The only cost is the Verus blockchain transaction fee of approximately 0.0001 VRSC per timestamp, paid from your wallet when you approve the transaction."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if vtimestamp shuts down?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your timestamps survive. They're stored on the Verus blockchain, not on vtimestamp's servers. Anyone can verify them using a Verus node and the getidentityhistory RPC command."
      }
    },
    {
      "@type": "Question",
      "name": "What is a VerusID?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A VerusID is a self-sovereign identity on the Verus blockchain. It's a human-readable name (like alice@) that you own and control — no company or government manages it for you. Your VerusID is used to sign timestamps."
      }
    },
    {
      "@type": "Question",
      "name": "Can I verify without the vtimestamp website?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can use the Verus CLI to query any identity's history directly. Run verus getidentityhistory to see all updates, then look for entries with the proof.basic VDXF key."
      }
    }
  ]
}
</script>`}
</svelte:head>

<div class="content-page">
	<!-- Hero -->
	<section class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold mb-4 text-primary">
			Frequently Asked Questions
		</h1>
		<p class="text-lg text-secondary max-w-2xl mx-auto">
			Everything you need to know about vtimestamp, blockchain timestamping, and proof of existence.
		</p>
	</section>

	<!-- General -->
	<section class="content-section">
		<h2>General</h2>

		<div class="space-y-6">
			<div class="card">
				<h3 class="font-semibold mb-2">What is document timestamping?</h3>
				<p class="text-secondary text-sm">
					Document timestamping is the process of creating cryptographic proof that a specific piece of data existed at a specific point in time. The proof is a SHA-256 hash of your document, recorded on a blockchain with a consensus-verified timestamp. This hash acts as a unique fingerprint — if the document changes by even a single byte, the hash is completely different.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">What is vtimestamp?</h3>
				<p class="text-secondary text-sm">
					vtimestamp is a free, open-source, decentralized timestamping service built on the Verus blockchain. It lets you prove that a document, file, or piece of text existed at a specific moment in time. Your documents never leave your device — only a hash is published. The proof is stored permanently on-chain, tied to your VerusID, and can be verified by anyone without needing an account or trusting any service.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">How is this different from a notary?</h3>
				<p class="text-secondary text-sm">
					A traditional notary is a state-appointed official who verifies identity, confirms willingness, and witnesses signing. Blockchain timestamping proves something different: that a specific document existed at a specific time, possessed by a specific identity. It does not verify the signer's legal identity or mental state. Timestamping complements notarization but does not replace it where legally required. Consult legal counsel for important matters.
				</p>
			</div>
		</div>
	</section>

	<!-- Privacy & Security -->
	<section class="content-section">
		<h2>Privacy & Security</h2>

		<div class="space-y-6">
			<div class="card">
				<h3 class="font-semibold mb-2">Are my documents uploaded to the blockchain?</h3>
				<p class="text-secondary text-sm">
					No. Your documents never leave your device. vtimestamp computes a SHA-256 hash of your file or text entirely in your browser using the Web Crypto API. Only this hash (a 64-character string) is stored on the blockchain. No one can reconstruct your document from the hash — it's a one-way function.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">What information is public?</h3>
				<p class="text-secondary text-sm">
					The SHA-256 hash, the title you chose, any description you wrote, the filename and file size (if provided), the block time and height, and your VerusID name are all public on the blockchain. The actual document contents remain private — only you have the original file. You control how much metadata to include.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">Can a timestamp be faked or backdated?</h3>
				<p class="text-secondary text-sm">
					No. The block time is set by blockchain consensus — you can't insert data into a past block. Each identity update is a separate, immutable transaction. SHA-256 is collision-resistant, so no one can produce a different document with the same hash. And anyone can independently verify against the public blockchain, so there's no single authority to compromise.
				</p>
			</div>
		</div>
	</section>

	<!-- Using vtimestamp -->
	<section class="content-section">
		<h2>Using vtimestamp</h2>

		<div class="space-y-6">
			<div class="card">
				<h3 class="font-semibold mb-2">What is a VerusID?</h3>
				<p class="text-secondary text-sm">
					A VerusID is a self-sovereign identity on the Verus blockchain. It's a human-readable name (like <code class="hash">alice@</code>) that you own and control — no company or government manages it for you. Your VerusID is used to sign timestamps, proving that you are the one who created the proof. You manage your VerusID through Verus Mobile or the Verus Desktop wallet.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">How do I get a VerusID?</h3>
				<p class="text-secondary text-sm">
					You can register a VerusID through the Verus Desktop wallet or through an ID provisioning service. A root-level VerusID costs 100 VRSC (which is locked in your identity, not spent). SubIDs — identities registered under a parent currency — work just as well for timestamping and can vary in price, with the lowest costing less than one cent. Once registered, your VerusID is yours permanently — it's controlled by your private keys and can't be taken away. Visit <a href="https://verus.io" class="text-primary hover:underline" target="_blank" rel="noopener">verus.io</a> to get started.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">Can I timestamp any file type?</h3>
				<p class="text-secondary text-sm">
					Yes. vtimestamp hashes the raw bytes of any file — PDFs, images, audio, video, code, archives, or any other format. You can also paste text directly. The hash is computed entirely in your browser, so there's no file size limit imposed by the service (though very large files may take longer to hash).
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">How much does it cost?</h3>
				<p class="text-secondary text-sm">
					vtimestamp itself is free. The only cost is the Verus blockchain transaction fee of approximately 0.0001 VRSC per timestamp, paid from your wallet when you approve the transaction. You'll need a small amount of VRSC in your Verus wallet to cover this fee. There are no subscriptions, no per-stamp fees, and no hidden costs.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">How do I verify a timestamp?</h3>
				<p class="text-secondary text-sm">
					Go to the <a href="/verify" class="text-primary hover:underline">Verify page</a>, enter the VerusID name, and upload the same file (or paste the same text). The system computes the hash, searches the identity's blockchain history for a match, and shows you the timestamp details including block time, height, and transaction ID. No login required.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">What happens if vtimestamp shuts down?</h3>
				<p class="text-secondary text-sm">
					Your timestamps survive. They're stored on the Verus blockchain, not on vtimestamp's servers. Anyone can verify them using a Verus node and the <code class="hash">getidentityhistory</code> RPC command. The data is decentralized and permanent — the service is just a convenience layer on top of the blockchain.
				</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-2">What if I lose the original file?</h3>
				<p class="text-secondary text-sm">
					You won't be able to verify the timestamp. Verification works by hashing the original file and comparing it to the hash stored on the blockchain — if you no longer have the exact original file, there's no way to recompute the hash. vtimestamp stores only the hash, not your document. Keep your original files safe.
				</p>
			</div>
		</div>
	</section>

	<!-- Technical -->
	<section class="content-section">
		<h2>Technical</h2>

		<div class="space-y-6">
			<div class="card">
				<h3 class="font-semibold mb-2">What is a SHA-256 hash?</h3>
				<p class="text-secondary text-sm">
					SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic function that takes any input and produces a fixed 64-character hexadecimal string. It's a one-way function: you can't reverse it to get the original data. Even a tiny change to the input produces a completely different hash. SHA-256 is used widely in security, including Bitcoin and most blockchain systems.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">What is VDXF?</h3>
				<p class="text-secondary text-sm">
					VDXF (Verus Data Exchange Format) is a protocol-level system for structured, typed data on the Verus blockchain. It provides namespaced keys, DataDescriptors with typed labels, and a standardized way to store and retrieve structured data on identities. vtimestamp uses VDXF to store timestamp data in a consistent, discoverable format under the <code class="hash">proof.basic</code> key.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">Can I verify without the vtimestamp website?</h3>
				<p class="text-secondary text-sm">
					Yes. You can use the Verus CLI to query any identity's history directly. Run <code class="hash">verus getidentityhistory "identity@"</code> to see all updates, then look for entries with the <code class="hash">proof.basic</code> VDXF key. Each entry includes the block hash and height, which you can use with <code class="hash">verus getblock</code> to confirm the exact timestamp. See the <a href="/developers" class="text-primary hover:underline">Developer Documentation</a> for details.
				</p>
			</div>
		</div>
	</section>

	<!-- Cross-links -->
	<div class="cross-links">
		<h3>Learn more</h3>
		<div class="flex flex-wrap gap-3">
			<a href="/how-it-works">How It Works &rarr;</a>
			<a href="/compare">Compare &rarr;</a>
			<a href="/verify">Verify a Timestamp &rarr;</a>
		</div>
	</div>
</div>
