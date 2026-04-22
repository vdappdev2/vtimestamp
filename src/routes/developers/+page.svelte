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
			Timestamps are stored on each user's VerusID <code class="hash">contentmultimap</code> under the <code class="hash">proof.basic</code> VDXF key. Each timestamp is an array of DataDescriptor entries:
		</p>

		<div class="code-block" style="max-width: 56rem;">
			{@html `<pre>contentmultimap: {
  "proof.basic": [
    // Timestamp entry
    { dataDescriptor: { label: ".sha256",      objectdata: "a7f3b2c1d4e5..." } },
    { dataDescriptor: { label: ".title",       objectdata: "Q4 Financial Report" } },
    { dataDescriptor: { label: ".description", objectdata: "Final approved version" } },
    { dataDescriptor: { label: ".filename",    objectdata: "quarterly-report.pdf" } },
    { dataDescriptor: { label: ".filesize",    objectdata: "2097152" } }
  ]
}</pre>`}
		</div>

		<p>
			The outer key (<code class="hash">proof.basic</code>) is a VDXF key — a deterministic i-address derived from the namespace. On testnet this is <code class="hash">testidx.vrsctest::proof.basic</code>, on mainnet <code class="hash">vtimestamp.vrsc::proof.basic</code>. The labels shown above (<code class="hash">.sha256</code>, <code class="hash">.title</code>, etc.) are shorthand — on-chain, these are represented as i-addresses listed in the VDXF Key Reference table below.
		</p>
		<p>
			Each DataDescriptor also includes a <code class="hash">mimetype</code> field set to <code class="hash">text/plain</code> for all fields, and a <code class="hash">version</code> field. These are part of the standard DataDescriptor format.
		</p>

		<div class="grid md:grid-cols-2 gap-4 mt-4" style="max-width: 56rem;">
			<div class="card">
				<h3 class="font-semibold mb-2 text-sm">Fields</h3>
				<ul class="text-secondary text-xs space-y-1">
					<li><code class="hash">.sha256</code> — SHA-256 hash (required, 64 hex chars)</li>
					<li><code class="hash">.title</code> — Human-readable title (required)</li>
					<li><code class="hash">.description</code> — Optional description</li>
					<li><code class="hash">.filename</code> — Original filename (optional)</li>
					<li><code class="hash">.filesize</code> — File size in bytes as string (optional)</li>
				</ul>
			</div>
			<div class="card">
				<h3 class="font-semibold mb-2 text-sm">Timestamp Derivation</h3>
				<p class="text-secondary text-xs">
					The timestamp itself is not stored — it's derived from the block that contains the transaction. Use <code class="hash">getblock</code> with the block hash from <code class="hash">getidentityhistory</code> to get the block time (Unix timestamp) and height.
				</p>
			</div>
		</div>
	</section>

	<!-- VDXF Key Reference -->
	<section class="content-section">
		<h2>VDXF Key Reference</h2>
		<p>All keys are deterministic i-addresses derived from their namespaced names.</p>

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
						<td>Container for all timestamp data</td>
					</tr>
					<tr>
						<td><code class="hash">DataDescriptor</code> (wrapper)</td>
						<td colspan="2" style="text-align: center;"><code class="hash" style="font-size: 0.75rem;">i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv</code></td>
						<td>DataDescriptor wrapper key</td>
					</tr>
					<tr>
						<td><code class="hash">.sha256</code> label</td>
						<td><code class="hash" style="font-size: 0.75rem;">iBCkvv7KC18xd3P164Cvw1pxpLo5FyGEtm</code></td>
						<td><code class="hash" style="font-size: 0.75rem;">iPRekBwQwFxNHf6mE68n8i2iXEnVdk1hw8</code></td>
						<td>Document SHA-256 hash</td>
					</tr>
					<tr>
						<td><code class="hash">.title</code> label</td>
						<td><code class="hash" style="font-size: 0.75rem;">iHXGu1nW4jQoeooBHPGE58qQGf9wMakEtj</code></td>
						<td><code class="hash" style="font-size: 0.75rem;">iJx4aJf4SRByyNAi4Z93FC7QNaysyU5mdP</code></td>
						<td>Timestamp title</td>
					</tr>
					<tr>
						<td><code class="hash">.description</code> label</td>
						<td><code class="hash" style="font-size: 0.75rem;">iP1PCTTHPpktP26xTEu1BuwENWMHQaia4D</code></td>
						<td><code class="hash" style="font-size: 0.75rem;">iS8HnXSHWPL7GLkxYS4SpC7QW2Bnyp93T2</code></td>
						<td>Optional description</td>
					</tr>
					<tr>
						<td><code class="hash">.filename</code> label</td>
						<td><code class="hash" style="font-size: 0.75rem;">i4xgBqX9btMX8tnAjsyVFrgSLnigxPwBw5</code></td>
						<td><code class="hash" style="font-size: 0.75rem;">iBTcwxUDgvqGXGMC26U52522HrsXC8ggoC</code></td>
						<td>Original filename</td>
					</tr>
					<tr>
						<td><code class="hash">.filesize</code> label</td>
						<td><code class="hash" style="font-size: 0.75rem;">iRz2tyZZEwmrxRPSrwN8UTAC8g5KyVkBiE</code></td>
						<td><code class="hash" style="font-size: 0.75rem;">iHBnDKDyKbXeizg322cxLUps7Uodc1udF4</code></td>
						<td>File size in bytes</td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="text-secondary text-sm mt-4">
			Testnet keys use the <code class="hash">testidx.vrsctest::</code> namespace. Mainnet keys use the <code class="hash">vtimestamp.vrsc::</code> namespace. The DataDescriptor wrapper key is the same on both networks.
		</p>
	</section>

	<!-- Verifying Programmatically -->
	<section class="content-section" style="max-width: 56rem;">
		<h2>Verifying Programmatically</h2>
		<p>You can verify timestamps using the Verus CLI without the vtimestamp website. The primary call is <code class="hash">getidentityhistory</code>, which gives you per-update block info needed to prove <em>when</em> a timestamp was recorded. A related call, <code class="hash">getidentitycontent</code>, is useful for a different purpose — see the alternative section below.</p>

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
            "flags": 96,
            "mimetype": "text/plain",
            "label": "iPRekBwQwFxNHf6mE68n8i2iXEnVdk1hw8",
            "objectdata": {
              "message": "a7f3b2c1d4e5f6a7b8c9d0e1..."
            }
          }
        },
        ...
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
			Parse each DataDescriptor in the array. Important: the field value lives at <code class="hash">objectdata.message</code>, not at <code class="hash">objectdata</code> directly. Match each descriptor's <code class="hash">label</code> against the known i-addresses above (<code class="hash">.sha256</code>, <code class="hash">.title</code>, etc.) and compare the hash case-insensitively.
		</p>

		<h3 class="mt-6">Step 3: Get Block Time</h3>
		<p class="text-secondary text-sm">Once you find a matching entry, fetch the block to get the timestamp:</p>
		<div class="code-block">
<pre>verus getblock "blockhash_from_history"</pre>
		</div>
		<p class="text-secondary text-sm">
			The <code class="hash">time</code> field in the block response is the Unix timestamp — the consensus-verified moment when that block was mined and your timestamp was recorded. Note: neither <code class="hash">getidentityhistory</code> nor <code class="hash">getidentitycontent</code> returns block time directly. It has to come from the block itself via <code class="hash">getblock</code> (or <code class="hash">getblockheader</code>).
		</p>

		<h3 class="mt-6">Alternative: Using getidentitycontent</h3>
		<p class="text-secondary text-sm">
			<code class="hash">getidentitycontent</code> returns the <em>accumulated</em> contentmultimap for an identity and supports filtering by VDXF key. It's more ergonomic when you just want to list an identity's current timestamps — no need to iterate history entries:
		</p>
		<div class="code-block">
<pre>verus getidentitycontent "alice@" 0 0 false 0 "vtimestamp.vrsc::proof.basic"</pre>
		</div>
		<p class="text-secondary text-sm">
			The trailing argument filters results to just <code class="hash">proof.basic</code> entries, so you get only the timestamp data. Use <code class="hash">testidx.vrsctest::proof.basic</code> on testnet.
		</p>
		<p class="text-secondary text-sm">
			<strong class="text-primary">Important caveat:</strong> <code class="hash">getidentitycontent</code>'s top-level <code class="hash">blockheight</code> and <code class="hash">txid</code> refer only to the identity's <em>latest</em> update — not to any specific entry inside the contentmultimap. If you want to know <em>when a particular hash was recorded</em>, you must use <code class="hash">getidentityhistory</code> to find the exact updateidentity transaction that added it, then call <code class="hash">getblock</code> against that entry's <code class="hash">blockhash</code>.
		</p>
		<p class="text-secondary text-sm">
			<strong class="text-primary">When to use which:</strong> use <code class="hash">getidentitycontent</code> for "show me this identity's current timestamps." Use <code class="hash">getidentityhistory</code> when you need per-timestamp recording times — which is the core of timestamp verification and what vtimestamp's own verify page does.
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
