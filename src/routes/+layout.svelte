<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { isLoggedIn } from '$lib/stores/session';
	import { CURRENT_NETWORK, SWITCH_NETWORK_URL } from '$lib/config';

	let { children } = $props();

	const isTestnet = CURRENT_NETWORK === 'testnet';
	const switchLabel = isTestnet ? 'Switch to Mainnet' : 'Switch to Testnet';

	function addCopyButtons() {
		document.querySelectorAll('.code-block').forEach((block) => {
			if (block.querySelector('.copy-btn')) return;
			const wrapper = block as HTMLElement;
			wrapper.style.position = 'relative';
			const btn = document.createElement('button');
			btn.className = 'copy-btn';
			btn.textContent = 'Copy';
			btn.addEventListener('click', async () => {
				const pre = block.querySelector('pre');
				const text = (pre || block).textContent || '';
				await navigator.clipboard.writeText(text.trim());
				btn.textContent = 'Copied!';
				setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
			});
			wrapper.appendChild(btn);
		});
	}

	afterNavigate(() => {
		// Small delay to ensure DOM is rendered
		setTimeout(addCopyButtons, 50);
	});
</script>

<svelte:head>
	<title>vtimestamp - Decentralized Timestamp Service</title>
	<meta name="description" content="Prove your documents existed at a specific moment in time. Decentralized, immutable timestamps on Verus blockchain." />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="bg-surface border-b border-theme">
		<nav class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
			<!-- Logo + Network Badge -->
			<div class="flex items-center gap-2">
				<a href="/" class="flex items-center gap-2 text-xl font-semibold text-primary no-underline">
					<svg viewBox="0 0 100 100" class="w-8 h-8" aria-hidden="true">
						<circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-primary)" stroke-width="2.5"/>
						<line x1="50" y1="9" x2="50" y2="17" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
						<line x1="91" y1="50" x2="83" y2="50" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
						<line x1="50" y1="91" x2="50" y2="83" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
						<line x1="9" y1="50" x2="17" y2="50" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
						<line x1="72" y1="13.4" x2="69.2" y2="18.2" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="86.6" y1="28" x2="81.8" y2="30.8" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="86.6" y1="72" x2="81.8" y2="69.2" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="72" y1="86.6" x2="69.2" y2="81.8" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="28" y1="86.6" x2="30.8" y2="81.8" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="13.4" y1="72" x2="18.2" y2="69.2" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="13.4" y1="28" x2="18.2" y2="30.8" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="28" y1="13.4" x2="30.8" y2="18.2" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round"/>
						<line x1="50" y1="50" x2="35" y2="24" stroke="var(--color-text-primary)" stroke-width="4" stroke-linecap="round"/>
						<line x1="50" y1="50" x2="65" y2="24" stroke="var(--color-text-primary)" stroke-width="3" stroke-linecap="round"/>
						<circle cx="50" cy="50" r="3.5" fill="var(--color-primary)"/>
					</svg>
					vtimestamp
				</a>
				<span class="network-badge" class:network-badge-testnet={isTestnet} class:network-badge-mainnet={!isTestnet}>
					{CURRENT_NETWORK}
				</span>
			</div>

			<!-- Center: Main navigation -->
			<div class="flex items-center gap-2">
				<a
					href="/verify"
					class="nav-btn"
				>
					Verify
				</a>
				{#if $isLoggedIn}
					<a
						href="/dashboard"
						class="nav-btn"
					>
						Dashboard
					</a>
					<a
						href="/create"
						class="nav-btn"
					>
						Create
					</a>
				{/if}
			</div>

			<!-- Right: Theme toggle + User -->
			<div class="flex items-center gap-3">
				<ThemeToggle />
				<LoginButton />
			</div>
		</nav>
	</header>

	<!-- Main content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-surface border-t border-theme py-10">
		<div class="max-w-6xl mx-auto px-4">
			<!-- Footer heading -->
			<p class="text-secondary text-sm mb-6">vtimestamp — Decentralized timestamps on <a href="https://verus.io" class="text-primary hover:underline" target="_blank" rel="noopener">Verus</a></p>

			<!-- Footer link columns -->
			<div class="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
				<!-- Learn -->
				<div>
					<h4 class="text-xs font-semibold uppercase tracking-wider text-secondary mb-3">Learn</h4>
					<ul class="space-y-2">
						<li><a href="/how-it-works" class="text-sm footer-link">How It Works</a></li>
						<li><a href="/compare" class="text-sm footer-link">Compare</a></li>
						<li><a href="/use-cases" class="text-sm footer-link">Use Cases</a></li>
						<li><a href="/faq" class="text-sm footer-link">FAQ</a></li>
					</ul>
				</div>

				<!-- Use -->
				<div>
					<h4 class="text-xs font-semibold uppercase tracking-wider text-secondary mb-3">Use</h4>
					<ul class="space-y-2">
						<li><a href="/verify" class="text-sm footer-link">Verify</a></li>
						<li><a href="/create" class="text-sm footer-link">Create</a></li>
						<li><a href="/dashboard" class="text-sm footer-link">Dashboard</a></li>
					</ul>
				</div>

				<!-- Build -->
				<div>
					<h4 class="text-xs font-semibold uppercase tracking-wider text-secondary mb-3">Build</h4>
					<ul class="space-y-2">
						<li><a href="https://github.com/vdappdev2/vtimestamp" class="text-sm footer-link" target="_blank" rel="noopener">GitHub</a></li>
						<li><a href="/developers" class="text-sm footer-link">Developers</a></li>
						<li><a href="https://www.npmjs.com/package/vtimestamp-mcp" class="text-sm footer-link" target="_blank" rel="noopener">MCP Server (npm)</a></li>
					</ul>
				</div>
			</div>

			<!-- Bottom row -->
			<div class="border-t border-theme pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div class="flex flex-wrap items-center gap-3 text-xs">
					<a href="/about" class="footer-link">About</a>
					<span class="text-secondary">&middot;</span>
					<span class="text-secondary">MIT License</span>
					<span class="text-secondary">&middot;</span>
					<a href="https://verus.io" class="footer-link" target="_blank" rel="noopener">Verus.io</a>
				</div>
				{#if SWITCH_NETWORK_URL}
					<a href={SWITCH_NETWORK_URL} class="network-switch-link">
						{switchLabel} &rarr;
					</a>
				{/if}
			</div>

			<p class="mt-4 text-xs text-secondary">Proofs are stored on your VerusID. This service does not store your documents.</p>
		</div>
	</footer>
</div>
