<svelte:head>
	<title>About vtimestamp — Decentralized Document Timestamping | vtimestamp</title>
	<meta name="description" content="vtimestamp is an open-source, decentralized document timestamping service built on the Verus blockchain. Privacy-first, identity-bound, and permanently verifiable." />
	<link rel="canonical" href="https://vtimestamp.com/about" />
	<meta property="og:title" content="About vtimestamp — Decentralized Document Timestamping | vtimestamp" />
	<meta property="og:description" content="vtimestamp is an open-source, decentralized document timestamping service built on the Verus blockchain. Privacy-first, identity-bound, and permanently verifiable." />
	<meta property="og:url" content="https://vtimestamp.com/about" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="About vtimestamp — Decentralized Document Timestamping" />
	<meta name="twitter:description" content="vtimestamp is an open-source, decentralized document timestamping service built on the Verus blockchain." />
	{@html `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "About vtimestamp — Decentralized Document Timestamping",
  "description": "vtimestamp is an open-source, decentralized document timestamping service built on the Verus blockchain. Privacy-first, identity-bound, and permanently verifiable.",
  "url": "https://vtimestamp.com/about",
  "author": { "@type": "Person", "name": "vdappdev2" },
  "publisher": { "@type": "Organization", "name": "vtimestamp", "url": "https://vtimestamp.com" },
  "datePublished": "2026-03-03",
  "dateModified": "2026-03-03"
}
</script>`}
</svelte:head>

<div class="content-page">
	<!-- Hero -->
	<section class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold mb-4 text-primary">
			About vtimestamp
		</h1>
		<p class="text-lg text-secondary max-w-2xl mx-auto">
			Prove your documents existed. No uploads. No middlemen. No expiration.
		</p>
	</section>

	<!-- What vtimestamp is -->
	<section class="content-section">
		<h2>What vtimestamp Is</h2>
		<p>
			vtimestamp is a free service that creates cryptographic proof your documents existed at a specific moment in time. The proof is stored permanently on the Verus blockchain, tied to your self-sovereign VerusID.
		</p>
		<p>
			Your documents never leave your device — only a SHA-256 hash is published. Anyone can verify your timestamps without needing an account, trusting a company, or relying on any centralized service.
		</p>
		<p>
			The mission is simple: make document timestamping accessible, private, and permanent. No subscriptions, no gatekeepers, no databases that can disappear.
		</p>
		<p>
			vtimestamp runs on Verus mainnet for production use, and is also available on testnet for trying it out.
		</p>
	</section>

	<!-- Built on Verus -->
	<section class="content-section">
		<h2>Built on Verus</h2>
		<p>
			vtimestamp is built on the <a href="https://verus.io" class="text-primary hover:underline" target="_blank" rel="noopener">Verus blockchain</a> — a public, open-source, community-driven network with unique features that make it ideal for timestamping:
		</p>
		<div class="grid md:grid-cols-2 gap-4 mt-4">
			<div class="card">
				<h3 class="font-semibold mb-1 text-sm">Native Identity (VerusID)</h3>
				<p class="text-secondary text-xs">Self-sovereign identities built into the protocol. Your timestamps are tied to a human-readable name you own — not a hex address.</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-1 text-sm">VDXF Data Format</h3>
				<p class="text-secondary text-xs">Structured, typed data storage with namespaced keys. Timestamps are stored in a standardized, discoverable format — not raw hex blobs.</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-1 text-sm">Low Cost</h3>
				<p class="text-secondary text-xs">Transaction fees are approximately 0.0001 VRSC per timestamp. Costs are stable and predictable — no volatile gas markets.</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-1 text-sm">Permissionless</h3>
				<p class="text-secondary text-xs">Anyone can run a Verus node and verify timestamps directly. No company, council, or authority gates access to the data.</p>
			</div>
		</div>
	</section>

	<!-- Open Source -->
	<section class="content-section">
		<h2>Open Source</h2>
		<p>
			vtimestamp is open-source software released under the MIT license, developed by vdappdev2 as a contribution to the Verus ecosystem. The code is publicly available, auditable, and open to community contributions.
		</p>
		<p>
			Donations are welcome at <code class="hash">vdappdev.bitcoins@</code>
		</p>
		<div class="flex flex-wrap gap-3 mt-4">
			<a href="https://github.com/vdappdev2/vtimestamp" class="btn btn-primary text-sm" target="_blank" rel="noopener">
				View on GitHub
			</a>
		</div>
	</section>

	<!-- MCP Integration -->
	<section class="content-section">
		<h2>MCP Integration</h2>
		<p>
			vtimestamp is accessible to AI agents through Model Context Protocol (MCP) servers. This means tools like Claude and ChatGPT can verify and create timestamps on your behalf — no manual steps required.
		</p>
		<div class="grid md:grid-cols-2 gap-4 mt-4">
			<div class="card">
				<h3 class="font-semibold mb-1 text-sm">vtimestamp-mcp</h3>
				<p class="text-secondary text-xs mb-2">Read-only MCP server for verifying timestamps and querying identity history.</p>
				<a href="https://www.npmjs.com/package/vtimestamp-mcp" class="text-primary text-xs hover:underline" target="_blank" rel="noopener">npm: vtimestamp-mcp</a>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-1 text-sm">vtimestamp-mcp-write</h3>
				<p class="text-secondary text-xs mb-2">Read-write MCP server for creating timestamps programmatically (requires wallet).</p>
				<a href="https://www.npmjs.com/package/vtimestamp-mcp-write" class="text-primary text-xs hover:underline" target="_blank" rel="noopener">npm: vtimestamp-mcp-write</a>
			</div>
		</div>
	</section>

	<!-- Cross-links -->
	<div class="cross-links">
		<h3>Learn more</h3>
		<div class="flex flex-wrap gap-3">
			<a href="/how-it-works">How It Works &rarr;</a>
			<a href="/compare">Compare &rarr;</a>
			<a href="https://github.com/vdappdev2/vtimestamp" target="_blank" rel="noopener">GitHub &rarr;</a>
		</div>
	</div>
</div>
