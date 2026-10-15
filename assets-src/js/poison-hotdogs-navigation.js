const button = document.querySelector('.slimeMenu');
const navigation = document.querySelector('#phd-primary-nav');

if (button && navigation) {
	const phone = window.matchMedia('(max-width: 63.99em), (hover: none) and (pointer: coarse)');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let dripTimer;

	function drip() {
		if (reducedMotion.matches) return;
		window.clearTimeout(dripTimer);
		button.classList.remove('is-dripping');
		// Restart one short, interaction-triggered animation, never an idle loop.
		void button.offsetWidth;
		button.classList.add('is-dripping');
		dripTimer = window.setTimeout(() => button.classList.remove('is-dripping'), 950);
	}

	function setOpen(open, restoreFocus = false) {
		const expanded = phone.matches && open;
		button.setAttribute('aria-expanded', String(expanded));
		button.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
		document.body.classList.toggle('mobileMenuOpen', expanded);
		navigation.inert = phone.matches && !expanded;
		if (expanded) navigation.querySelector('a')?.focus();
		if (restoreFocus && phone.matches) button.focus();
	}

	function updateViewport() {
		button.hidden = !phone.matches;
		setOpen(false);
	}

	button.addEventListener('click', () => {
		drip();
		setOpen(button.getAttribute('aria-expanded') !== 'true');
	});
	button.addEventListener('pointerenter', drip);
	navigation.addEventListener('click', (event) => {
		if (event.target.closest('a')) setOpen(false);
	});
	document.addEventListener('click', (event) => {
		if (!button.contains(event.target) && !navigation.contains(event.target)) setOpen(false);
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
	});
	document.addEventListener('focusin', (event) => {
		if (!button.contains(event.target) && !navigation.contains(event.target)) setOpen(false);
	});
	phone.addEventListener('change', updateViewport);
	document.body.classList.add('mobileMenuReady');
	updateViewport();
}
