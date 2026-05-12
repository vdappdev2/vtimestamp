<svelte:head>
	<title>Developer Documentation — vtimestamp API & VDXF Reference | vtimestamp</title>
	<meta name="description" content="Technical documentation for vtimestamp: VDXF key reference, on-chain data structure, CLI verification commands, and MCP server integration for AI agents." />
	<link rel="canonical" href="https://vtimestamp.com/developers" />
	<meta property="og:title" content="Developer Documentation — vtimestamp API & VDXF Reference | vtimestamp" />
	<meta property="og:description" content="Technical documentation for vtimestamp: VDXF key reference, on-chain data structure, CLI verification commands, and MCP server integration for AI agents." />
	<meta property="og:url" content="https://vtimestamp.com/developers" />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="https://vtimestamp.com/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://vtimestamp.com/og-image.png" />
	<meta name="twitter:title" content="Developer Documentation — vtimestamp API & VDXF Reference" />
	<meta name="twitter:description" content="Technical documentation for vtimestamp: VDXF key reference, on-chain data structure, CLI verification commands, and MCP server integration." />
	{@html `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Developer Documentation — vtimestamp API & VDXF Reference",
  "description": "Technical documentation for vtimestamp: VDXF key reference, on-chain data structure, CLI verification commands, and MCP server integration for AI agents.",
  "url": "https://vtimestamp.com/developers",
  "image": "https://vtimestamp.com/og-image.png",
  "author": { "@type": "Person", "name": "vdappdev2", "url": "https://github.com/vdappdev2" },
  "publisher": { "@type": "Organization", "name": "vtimestamp", "url": "https://vtimestamp.com" },
  "datePublished": "2026-03-03T00:00:00+00:00",
  "dateModified": "2026-03-03T00:00:00+00:00"
}
</script>`}
</svelte:head>

<div class="content-page-wide">
	<!-- Hero -->
	<section class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold mb-4 text-primary">
			Developer Documentation
		</h1>
		<p class="text-lg text-secondary max-w-2xl mx-auto">
			Technical reference for the vtimestamp on-chain data format, VDXF keys, CLI verification, and MCP server integration.
		</p>
	</section>

	<!-- On-Chain Data Structure -->
	<section class="content-section">
		<h2>On-Chain Data Structure</h2>
		<p>
			Each timestamp is one entry on the user's VerusID <code class="hash">contentmultimap</code> under the <code class="hash">proof.basic</code> VDXF key. The entry is a single <code class="hash">DataDescriptor</code> in <strong>public-encrypted mode</strong> (<code class="hash">flags: 13</code>): the daemon encrypts the payload with an ephemeral key and publishes the incoming viewing key (<code class="hash">ivk</code>) on-chain, so anyone can decrypt it without the original writer's keys.
		</p>

		<div class="code-block" style="max-width: 56rem;">
			{@html `<pre>contentmultimap: {
  "proof.basic": [
    {
      "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
        "version": 1,
        "flags": 13,
        "objectdata": "&lt;ciphertext, hex&gt;",
        "epk":        "&lt;ephemeral pubkey, hex&gt;",
        "ivk":        "&lt;on-chain incoming viewing key, hex&gt;"
      }
    }
  ]
}</pre>`}
		</div>

		<p>
			The outer key (<code class="hash">proof.basic</code>) is a VDXF key — a deterministic i-address derived from the namespace. On testnet this is <code class="hash">testidx.vrsctest::proof.basic</code>, on mainnet <code class="hash">vtimestamp.vrsc::proof.basic</code>. The wrapper key <code class="hash">i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv</code> is the DataDescriptor VDXF key and is the same on both networks.
		</p>

		<h3 class="mt-6">Decrypted Payload</h3>
		<p>
			A single <code class="hash">decryptdata</code> call recovers a JSON object containing every metadata field for the timestamp:
		</p>
		<div class="code-block" style="max-width: 56rem;">
			{@html `<pre>{
  "sha256":      "a7f3b2c1d4e5f6a7b8c9d0e1...",
  "title":       "Q4 Financial Report",
  "description": "Final approved version",
  "filename":    "quarterly-report.pdf",
  "filesize":    2097152
}</pre>`}
		</div>

		<div class="grid md:grid-cols-2 gap-4 mt-4" style="max-width: 56rem;">
			<div class="card">
				<h3 class="font-semibold mb-2 text-sm">Payload Fields</h3>
				<ul class="text-secondary text-xs space-y-1">
					<li><code class="hash">sha256</code> — SHA-256 hash (required, 64 hex chars)</li>
					<li><code class="hash">title</code> — Human-readable title (required)</li>
					<li><code class="hash">description</code> — Optional description</li>
					<li><code class="hash">filename</code> — Original filename (optional)</li>
					<li><code class="hash">filesize</code> — File size in bytes, number (optional)</li>
				</ul>
				<p class="text-secondary text-xs mt-2">
					Optional fields are simply omitted from the JSON object when not present. New fields can be added without breaking existing readers.
				</p>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-2 text-sm">Timestamp Derivation</h3>
				<p class="text-secondary text-xs">
					The timestamp itself is not stored — it's derived from the block that contains the transaction. Use <code class="hash">getblock</code> with the block hash from <code class="hash">getidentityhistory</code> to get the block time (Unix timestamp) and height.
				</p>
			</div>
		</div>

		<p class="text-secondary text-sm mt-4">
			<strong class="text-primary">Why public-encrypted?</strong> The Verus convention for application data on a VerusID is to encrypt the payload at rest with an on-chain viewing key. Encryption is the storage envelope here, not a privacy mechanism — anyone running a Verus node with <code class="hash">decryptdata</code> available recovers the exact same JSON. Consumers all go through one uniform code path (<code class="hash">decryptdata</code> + <code class="hash">JSON.parse</code>) regardless of which app wrote the entry.
		</p>
	</section>

	<!-- VDXF Key Reference -->
	<section class="content-section">
		<h2>VDXF Key Reference</h2>
		<p>All keys are deterministic i-addresses derived from their namespaced names. With the single-leaf JSON payload, only two VDXF keys appear on-chain — the outer container and the DataDescriptor wrapper.</p>

		<div class="comparison-table-wrap">
			<table class="comparison-table">
				<thead>
					<tr>
						<th>Key</th>
						<th>Testnet I-Address</th>
						<th>Mainnet I-Address</th>
						<th>Purpose</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code class="hash">proof.basic</code> (outer)</td>
						<td><code class="hash" style="font-size: 0.75rem;">i6UD4js3jqyjz9Mttmbk2Sh4eCuwLKPLyQ</code></td>
						<td><code class="hash" style="font-size: 0.75rem;">iJvkQ3uTKmRoFiE3rtP8YJxryLBKu8enmX</code></td>
						<td>Container for the timestamp entry on the identity</td>
					</tr>
					<tr>
						<td><code class="hash">DataDescriptor</code> (wrapper)</td>
						<td colspan="2" style="text-align: center;"><code class="hash" style="font-size: 0.75rem;">i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv</code></td>
						<td>DataDescriptor wrapper key (same on every chain)</td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="text-secondary text-sm mt-4">
			Testnet keys use the <code class="hash">testidx.vrsctest::</code> namespace. Mainnet keys use the <code class="hash">vtimestamp.vrsc::</code> namespace. Per-field labels (<code class="hash">.sha256</code>, <code class="hash">.title</code>, …) are <em>not</em> minted as separate VDXF keys — field names live inside the decrypted JSON object instead, which keeps the schema extensible without registering new keys.
		</p>
	</section>

	<!-- Verifying Programmatically -->
	<section class="content-section" style="max-width: 56rem;">
		<h2>Verifying Programmatically</h2>
		<p>You can verify timestamps using the Verus CLI without the vtimestamp website. The primary call is <code class="hash">getidentityhistory</code>, which gives you per-update block info needed to prove <em>when</em> a timestamp was recorded. Each entry's payload is decrypted with <code class="hash">decryptdata</code>. A related call, <code class="hash">getidentitycontent</code>, is useful for a different purpose — see the alternative section below.</p>

		<h3 class="mt-6">Step 1: Get Identity History</h3>
		<p class="text-secondary text-sm">Retrieve every update ever made to a VerusID:</p>
		<div class="code-block">
<pre>verus getidentityhistory "alice@"</pre>
		</div>
		<p class="text-secondary text-sm">
			Returns every <code class="hash">updateidentity</code> transaction for that identity. Each history entry includes <code class="hash">height</code>, <code class="hash">blockhash</code>, the full identity state at that point (including <code class="hash">contentmultimap</code>), and <code class="hash">output.txid</code>. Optional trailing arguments can narrow the height range; omitting them returns the full history.
		</p>

		<h3 class="mt-6">Step 2: Find Timestamp Entries</h3>
		<p class="text-secondary text-sm">
			Look for entries where <code class="hash">identity.contentmultimap</code> contains the <code class="hash">proof.basic</code> key (use the appropriate i-address for your network). A single history entry looks like this:
		</p>
		<div class="code-block">
			{@html `<pre>{
  "identity": {
    "contentmultimap": {
      "iJvkQ3uTKmRoFiE3rtP8YJxryLBKu8enmX": [
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 13,
            "objectdata": "317d12c4...",
            "epk":        "dfb49b14...",
            "ivk":        "068aa715..."
          }
        }
      ]
    }
  },
  "blockhash": "000000000003a1b2c3d4e5f6...",
  "height": 4523891,
  "output": {
    "txid": "a1b2c3d4e5f6a7b8c9d0e1f2...",
    "voutnum": 1
  }
}</pre>`}
		</div>
		<p class="text-secondary text-sm">
			Each entry under the outer key is a <code class="hash">DataDescriptor</code> in public-encrypted mode (<code class="hash">flags: 13</code>, with <code class="hash">epk</code> and on-chain <code class="hash">ivk</code>). The payload lives in <code class="hash">objectdata</code> as a hex-encoded ciphertext — you'll decrypt it in the next step.
		</p>

		<h3 class="mt-6">Step 3: Decrypt the Payload</h3>
		<p class="text-secondary text-sm">
			Call <code class="hash">decryptdata</code> with the full descriptor object plus the anchoring txid, asking the daemon to retrieve and decrypt:
		</p>
		<div class="code-block">
{@html `<pre>verus decryptdata '{
  "version":    1,
  "flags":      13,
  "objectdata": "317d12c4...",
  "epk":        "dfb49b14...",
  "ivk":        "068aa715...",
  "txid":       "a1b2c3d4e5f6...",
  "retrieve":   true
}'</pre>`}
		</div>
		<p class="text-secondary text-sm">
			The result is a descriptor whose <code class="hash">objectdata</code> field contains the hex-encoded utf-8 bytes of a JSON string. Convert to text and parse:
		</p>
		<div class="code-block">
{@html `<pre>Buffer.from(result[0].objectdata, 'hex').toString('utf8')
// → '{"sha256":"a7f3b2c1...","title":"Q4 Financial Report",...}'

JSON.parse(...)
// → { sha256, title, description?, filename?, filesize? }</pre>`}
		</div>
		<p class="text-secondary text-sm">
			Compare the parsed <code class="hash">sha256</code> to the hash of the document you're verifying (case-insensitive). A match confirms that this identity recorded that exact data in this transaction.
		</p>
		<p class="text-secondary text-sm">
			<strong class="text-primary">RPC requirement:</strong> <code class="hash">decryptdata</code> must be available on whichever Verus RPC endpoint you use. A local Verus daemon always works; some public endpoints whitelist it, others don't.
		</p>

		<h3 class="mt-6">Step 4: Get Block Time</h3>
		<p class="text-secondary text-sm">Once a payload's <code class="hash">sha256</code> matches your document, fetch the entry's block to get the actual timestamp:</p>
		<div class="code-block">
<pre>verus getblock "blockhash_from_history"</pre>
		</div>
		<p class="text-secondary text-sm">
			The <code class="hash">time</code> field in the block response is the Unix timestamp — the consensus-verified moment when that block was mined and your timestamp was recorded. Neither <code class="hash">getidentityhistory</code> nor <code class="hash">getidentitycontent</code> returns block time directly; it must come from the block itself via <code class="hash">getblock</code> (or <code class="hash">getblockheader</code>).
		</p>

		<h3 class="mt-6">Alternative: Using getidentitycontent</h3>
		<p class="text-secondary text-sm">
			<code class="hash">getidentitycontent</code> returns the <em>accumulated</em> contentmultimap for an identity and supports filtering by VDXF key. It's more ergonomic when you just want to list an identity's current timestamps — no need to iterate history entries:
		</p>
		<div class="code-block">
<pre>verus getidentitycontent "alice@" 0 0 false 0 "vtimestamp.vrsc::proof.basic"</pre>
		</div>
		<p class="text-secondary text-sm">
			The trailing argument filters results to just <code class="hash">proof.basic</code> entries, so you get only the timestamp data. Use <code class="hash">testidx.vrsctest::proof.basic</code> on testnet. You'll still need <code class="hash">decryptdata</code> to read each entry's payload.
		</p>
		<p class="text-secondary text-sm">
			<strong class="text-primary">Important caveat:</strong> <code class="hash">getidentitycontent</code>'s top-level <code class="hash">blockheight</code> and <code class="hash">txid</code> refer only to the identity's <em>latest</em> update — not to any specific entry inside the contentmultimap. If you want to know <em>when a particular hash was recorded</em>, you must use <code class="hash">getidentityhistory</code> to find the exact updateidentity transaction that added it, then call <code class="hash">getblock</code> against that entry's <code class="hash">blockhash</code>.
		</p>
		<p class="text-secondary text-sm">
			<strong class="text-primary">When to use which:</strong> use <code class="hash">getidentitycontent</code> for "show me this identity's current timestamps." Use <code class="hash">getidentityhistory</code> when you need per-timestamp recording times — which is the core of timestamp verification and what vtimestamp's own verify page does.
		</p>
	</section>

	<!-- Writing from your own app -->
	<section class="content-section" style="max-width: 56rem;">
		<h2>Writing from Your Own App</h2>
		<p>
			If you're building a Verus dapp that wants the same on-chain shape (public-encrypted DataDescriptor under your own outer key), here are the two envelope forms — pick the one that matches your write path. Each ends up with an identical <code class="hash">flags: 13</code> entry on-chain.
		</p>

		<h3 class="mt-6">Direct daemon RPC (CLI tools, MCPs, server-side workers)</h3>
		<p class="text-secondary text-sm">
			Emit one entry per outer-key as an <strong>array</strong> with a <code class="hash">{"{ data: { message: ... } }"}</code> envelope inside. The daemon resolves this shorthand on <code class="hash">updateidentity</code> and stores a <code class="hash">flags: 13</code> DataDescriptor with <code class="hash">epk</code> + on-chain <code class="hash">ivk</code>:
		</p>
		<div class="code-block">
{@html `<pre>{
  "yourapp.chain::outer.key": [
    { "data": { "message": JSON.stringify(payload) } }
  ]
}</pre>`}
		</div>

		<h3 class="mt-6">Wallet writers (Verus Mobile via IdentityUpdateRequest)</h3>
		<p class="text-secondary text-sm">
			Emit a <strong>single object</strong> (not an array) with <code class="hash">messagehex</code>. The SDK's <code class="hash">IdentityUpdateRequestDetails.fromCLIJson</code> shortcut detects the <code class="hash">data</code> key on a single object and routes it through <code class="hash">PartialSignData</code> → signdata-style wallet processing, which the daemon resolves to <code class="hash">flags: 13</code>:
		</p>
		<div class="code-block">
{@html `<pre>{
  "yourapp.chain::outer.key": {
    "data": {
      "messagehex": Buffer.from(
        JSON.stringify(payload), 'utf-8'
      ).toString('hex')
    }
  }
}</pre>`}
		</div>
		<p class="text-secondary text-sm">
			<strong class="text-primary">Don't mix the two forms.</strong> Passing an array of <code class="hash">{"{ data: ... }"}</code> through the SDK throws <em>Unknown vdxfkey: [object Object]</em>; passing a single object through direct daemon RPC bypasses the array-form envelope shorthand. Use the FQN form (<code class="hash">name.chain::key</code>) for the outer key on writes — Verus Mobile rejects custom i-address outer keys.
		</p>

		<h3 class="mt-6">Reader recipe</h3>
		<p class="text-secondary text-sm">
			Iterate the array under your outer key. For any descriptor where the encrypted flag (<code class="hash">flags &amp; 0x2</code>) is set, call <code class="hash">decryptdata</code> with the full descriptor + txid + <code class="hash">retrieve: true</code>, then <code class="hash">Buffer.from(result[0].objectdata, 'hex').toString('utf8')</code> + <code class="hash">JSON.parse</code> to recover your payload. The wrapper key (<code class="hash">i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv</code>) is the same on every chain; the outer key normalizes to its i-address on storage — readers should accept both FQN and i-address forms because that normalization isn't contractually documented.
		</p>
	</section>

	<!-- MCP Server Integration -->
	<section class="content-section" style="max-width: 56rem;">
		<h2>MCP Server Integration</h2>
		<p>AI agents can interact with vtimestamp programmatically through Model Context Protocol (MCP) servers. These can be run directly via <code class="hash">npx</code> for testing, or configured in your AI tool's MCP settings file (e.g., Claude Desktop's <code class="hash">claude_desktop_config.json</code> or Cursor's MCP config).</p>

		<div class="space-y-4 mt-4">
			<div class="card">
				<h3 class="font-semibold mb-2">vtimestamp-mcp (Read-only)</h3>
				<p class="text-secondary text-sm mb-3">
					Allows AI agents to verify timestamps and query identity history. No wallet required.
				</p>
				<div class="code-block">
<pre>npx vtimestamp-mcp</pre>
				</div>
				<p class="text-secondary text-xs">
					Provides tools for verifying timestamps, looking up identities, and reading on-chain data. Install from <a href="https://www.npmjs.com/package/vtimestamp-mcp" class="text-primary hover:underline" target="_blank" rel="noopener">npm</a>.
				</p>
			</div>

			<div class="card">
				<h3 class="font-semibold mb-2">vtimestamp-mcp-write (Read-write)</h3>
				<p class="text-secondary text-sm mb-3">
					Allows AI agents to create timestamps programmatically. Requires a local Verus wallet for signing.
				</p>
				<div class="code-block">
<pre>npx vtimestamp-mcp-write</pre>
				</div>
				<p class="text-secondary text-xs">
					Provides all read tools plus timestamp creation. Install from <a href="https://www.npmjs.com/package/vtimestamp-mcp-write" class="text-primary hover:underline" target="_blank" rel="noopener">npm</a>.
				</p>
			</div>
		</div>
	</section>

	<!-- Using vtimestamp Data -->
	<section class="content-section" style="max-width: 56rem;">
		<h2>Using vtimestamp Data</h2>
		<p>
			All vtimestamp data is public on the Verus blockchain. You can read and verify timestamps from your own tools, build alternative verification interfaces, or use the codebase and VDXF key schema as a reference for your own Verus projects.
		</p>
		<ul class="text-secondary text-sm space-y-2 mt-4 ml-4 list-disc">
			<li>Query any VerusID's timestamps using the VDXF keys above — no API key or permission needed</li>
			<li>The VDXF key namespace (<code class="hash">vtimestamp.vrsc::</code>) is standardized and documented</li>
			<li>The source code is MIT licensed and available on <a href="https://github.com/vdappdev2/vtimestamp" class="text-primary hover:underline" target="_blank" rel="noopener">GitHub</a></li>
		</ul>
	</section>

	<!-- Cross-links -->
	<div class="cross-links" style="max-width: 56rem;">
		<h3>Learn more</h3>
		<div class="flex flex-wrap gap-3">
			<a href="/about">About &rarr;</a>
			<a href="/compare">Compare &rarr;</a>
			<a href="https://github.com/vdappdev2/vtimestamp" target="_blank" rel="noopener">GitHub &rarr;</a>
		</div>
	</div>
</div>
