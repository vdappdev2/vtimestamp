<script lang="ts">
	import '../app.css';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { isLoggedIn } from '$lib/stores/session';
	import { CURRENT_NETWORK, SWITCH_NETWORK_URL } from '$lib/config';

	let { children } = $props();

	const isTestnet = CURRENT_NETWORK === 'testnet';
	const switchLabel = isTestnet ? 'Switch to Mainnet' : 'Switch to Testnet';
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
				<a href="/" class="text-xl font-semibold text-primary">
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
	<footer class="bg-surface border-t border-theme py-6">
		<div class="max-w-6xl mx-auto px-4 text-center text-secondary text-sm">
			<p>vtimestamp - Decentralized timestamps on <a href="https://verus.io" class="text-primary hover:underline" target="_blank" rel="noopener">Verus</a></p>
			<p class="mt-2 text-xs">Proofs are stored on your VerusID. This service does not store your documents.</p>
			{#if SWITCH_NETWORK_URL}
				<p class="mt-3">
					<a href={SWITCH_NETWORK_URL} class="network-switch-link">
						{switchLabel} &rarr;
					</a>
				</p>
			{/if}
		</div>
	</footer>
</div>
