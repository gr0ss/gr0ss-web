document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initializeCarousel() {
	const carousel = document.querySelector('[data-carousel]');
	if (!carousel) return;

	const slides = [...carousel.querySelectorAll('[data-slide]')];
	const previousButton = carousel.querySelector('[data-carousel-prev]');
	const nextButton = carousel.querySelector('[data-carousel-next]');
	const dotsContainer = carousel.querySelector('[data-carousel-dots]');
	const count = carousel.querySelector('[data-carousel-count]');
	const status = carousel.querySelector('[data-carousel-status]');
	const liveRegion = carousel.querySelector('[data-carousel-live]');
	const autoDelay = 5600;
	let activeIndex = 0;
	let autoTimer = null;
	let manualControl = reducedMotion.matches;
	let pointerStartX = null;

	const dots = slides.map((slide, index) => {
		const title = slide.querySelector('figcaption strong')?.textContent || `Screenshot ${index + 1}`;
		const dot = document.createElement('button');
		dot.className = 'carouselDot';
		dot.type = 'button';
		dot.setAttribute('aria-label', `Show ${title}`);
		dot.addEventListener('click', () => {
			stopAutoplay();
			showSlide(index, true);
		});
		dotsContainer.append(dot);
		return dot;
	});

	function normalizedIndex(index) {
		return (index + slides.length) % slides.length;
	}

	function showSlide(index, announce = false) {
		activeIndex = normalizedIndex(index);
		const previousIndex = normalizedIndex(activeIndex - 1);
		const nextIndex = normalizedIndex(activeIndex + 1);

		slides.forEach((slide, slideIndex) => {
			slide.classList.toggle('is-active', slideIndex === activeIndex);
			slide.classList.toggle('is-prev', slideIndex === previousIndex);
			slide.classList.toggle('is-next', slideIndex === nextIndex);
			slide.setAttribute('aria-hidden', slideIndex === activeIndex ? 'false' : 'true');
		});

		dots.forEach((dot, dotIndex) => {
			dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
		});

		count.textContent = `${activeIndex + 1} / ${slides.length}`;
		if (announce) {
			const caption = slides[activeIndex].querySelector('figcaption')?.textContent.trim();
			liveRegion.textContent = `Screenshot ${activeIndex + 1} of ${slides.length}: ${caption}`;
		}
	}

	function scheduleAutoplay() {
		window.clearTimeout(autoTimer);
		if (manualControl || document.hidden || reducedMotion.matches) return;
		autoTimer = window.setTimeout(() => {
			showSlide(activeIndex + 1);
			scheduleAutoplay();
		}, autoDelay);
	}

	function stopAutoplay() {
		manualControl = true;
		window.clearTimeout(autoTimer);
		status.textContent = 'Manual control';
		carousel.dataset.autoplay = 'off';
	}

	previousButton.addEventListener('click', () => {
		stopAutoplay();
		showSlide(activeIndex - 1, true);
	});

	nextButton.addEventListener('click', () => {
		stopAutoplay();
		showSlide(activeIndex + 1, true);
	});

	carousel.addEventListener('keydown', (event) => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		stopAutoplay();
		showSlide(activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
	});

	carousel.addEventListener('pointerdown', (event) => {
		pointerStartX = event.clientX;
	});

	carousel.addEventListener('pointerup', (event) => {
		if (pointerStartX === null) return;
		const travel = event.clientX - pointerStartX;
		pointerStartX = null;
		if (Math.abs(travel) < 45) return;
		stopAutoplay();
		showSlide(activeIndex + (travel < 0 ? 1 : -1), true);
	});

	carousel.addEventListener('pointercancel', () => {
		pointerStartX = null;
	});

	carousel.addEventListener('mouseenter', () => window.clearTimeout(autoTimer));
	carousel.addEventListener('mouseleave', scheduleAutoplay);
	carousel.addEventListener('focusin', () => window.clearTimeout(autoTimer));
	carousel.addEventListener('focusout', scheduleAutoplay);

	document.addEventListener('visibilitychange', scheduleAutoplay);
	reducedMotion.addEventListener('change', () => {
		if (reducedMotion.matches) stopAutoplay();
	});

	showSlide(0);
	if (manualControl) {
		status.textContent = 'Manual control';
		carousel.dataset.autoplay = 'off';
	} else {
		scheduleAutoplay();
	}
}

function initializeOutfits() {
	const choices = [...document.querySelectorAll('.outfitChoice')];
	const rail = document.querySelector('.outfitRail');
	const showcase = document.querySelector('.outfitShowcase');
	const stage = document.querySelector('[data-outfit-stage]');
	const previousButton = document.querySelector('[data-outfit-prev]');
	const nextButton = document.querySelector('[data-outfit-next]');
	const stagePreviousButton = document.querySelector('[data-outfit-stage-prev]');
	const stageNextButton = document.querySelector('[data-outfit-stage-next]');
	const previousImage = document.querySelector('[data-outfit-previous-image]');
	const currentImage = document.querySelector('[data-outfit-current-image]');
	const nextImage = document.querySelector('[data-outfit-next-image]');
	const previousName = document.querySelector('[data-outfit-previous-name]');
	const currentName = document.querySelector('[data-outfit-current-name]');
	const nextName = document.querySelector('[data-outfit-next-name]');
	const spotlightName = document.querySelector('[data-outfit-name]:not(.outfitChoice)');
	const spotlightDescription = document.querySelector('[data-outfit-description]:not(.outfitChoice)');
	if (!choices.length || !rail || !showcase || !stage || !previousImage || !currentImage || !nextImage || !previousName || !currentName || !nextName || !spotlightName || !spotlightDescription) return;

	const cycleOrder = [0, 10, 12, 13, 14, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
	const selectedIndex = choices.findIndex((choice) => choice.classList.contains('is-selected'));
	let cyclePosition = Math.max(0, cycleOrder.indexOf(selectedIndex));
	let transitionId = 0;
	let autoTimer = null;
	let isVisible = false;
	let manualControl = reducedMotion.matches;
	const autoDelay = 5200;

	function centerChoiceInRail(choice, instant = false) {
		const target = choice.offsetLeft - (rail.clientWidth - choice.offsetWidth) / 2;
		const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
		rail.scrollTo({
			left: Math.max(0, Math.min(target, maximum)),
			behavior: instant || reducedMotion.matches ? 'auto' : 'smooth',
		});
	}

	function choiceAt(offset = 0) {
		const position = (cyclePosition + offset + cycleOrder.length) % cycleOrder.length;
		return choices[cycleOrder[position]];
	}

	function updateStageImage(image, label, choice) {
		image.src = choice.dataset.outfitArt;
		image.alt = `Rexy wearing the ${choice.dataset.outfitName} outfit`;
		label.textContent = choice.dataset.outfitName;
	}

	function stopAutoplay() {
		manualControl = true;
		window.clearTimeout(autoTimer);
		autoTimer = null;
		showcase.dataset.autoplay = 'off';
	}

	function scheduleAutoplay() {
		window.clearTimeout(autoTimer);
		if (manualControl || !isVisible || document.hidden) return;
		autoTimer = window.setTimeout(() => {
			selectCyclePosition(cyclePosition + 1, true, false);
			scheduleAutoplay();
		}, autoDelay);
	}

	function selectCyclePosition(position, moveRail = true, userInitiated = true) {
		if (userInitiated) stopAutoplay();
		cyclePosition = (position + cycleOrder.length) % cycleOrder.length;
		const activeIndex = cycleOrder[cyclePosition];
		const choice = choices[activeIndex];
		const previousChoice = choiceAt(-1);
		const nextChoice = choiceAt(1);

		choices.forEach((item, itemIndex) => {
			const selected = itemIndex === activeIndex;
			item.classList.toggle('is-selected', selected);
			item.setAttribute('aria-pressed', selected ? 'true' : 'false');
		});

		const currentTransition = ++transitionId;
		stage.classList.add('is-changing');
		window.setTimeout(() => {
			if (currentTransition !== transitionId) return;
			updateStageImage(previousImage, previousName, previousChoice);
			updateStageImage(currentImage, currentName, choice);
			updateStageImage(nextImage, nextName, nextChoice);
			spotlightName.textContent = choice.dataset.outfitName;
			spotlightDescription.textContent = choice.dataset.outfitDescription;
			stage.classList.remove('is-changing');
		}, 120);

		if (moveRail) centerChoiceInRail(choice);
	}

	function selectChoiceIndex(index) {
		const nextPosition = cycleOrder.indexOf(index);
		if (nextPosition >= 0) selectCyclePosition(nextPosition, true, true);
	}

	choices.forEach((choice, index) => {
		choice.addEventListener('click', () => selectChoiceIndex(index));
	});

	previousButton?.addEventListener('click', () => selectCyclePosition(cyclePosition - 1));
	nextButton?.addEventListener('click', () => selectCyclePosition(cyclePosition + 1));
	stagePreviousButton?.addEventListener('click', () => selectCyclePosition(cyclePosition - 1));
	stageNextButton?.addEventListener('click', () => selectCyclePosition(cyclePosition + 1));

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(([entry]) => {
			isVisible = entry.isIntersecting;
			if (isVisible) scheduleAutoplay();
			else window.clearTimeout(autoTimer);
		}, { threshold: 0.42 });
		observer.observe(showcase);
	} else {
		isVisible = true;
		scheduleAutoplay();
	}

	document.addEventListener('visibilitychange', scheduleAutoplay);
	selectCyclePosition(cyclePosition, false, false);
	// The page opens on a mid-list outfit; snap the rail to it without a scroll animation.
	centerChoiceInRail(choiceAt(0), true);
}

function initializeModes() {
	const tabs = [...document.querySelectorAll('.modeTabs [role="tab"]')];
	const title = document.querySelector('[data-mode-title]');
	const copy = document.querySelector('[data-mode-copy]:not([role="tab"])');
	const image = document.querySelector('[data-mode-image]:not([role="tab"])');
	if (!tabs.length || !title || !copy || !image) return;

	function selectTab(tab) {
		tabs.forEach((item) => item.setAttribute('aria-selected', item === tab ? 'true' : 'false'));
		title.textContent = tab.dataset.modeName;
		copy.textContent = tab.dataset.modeCopy;

		if (image.getAttribute('src') === tab.dataset.modeImage) return;
		const nextImage = new Image();
		nextImage.onload = () => {
			image.classList.add('is-changing');
			window.setTimeout(() => {
				image.src = tab.dataset.modeImage;
				image.width = Number(tab.dataset.modeWidth);
				image.height = Number(tab.dataset.modeHeight);
				image.alt = tab.dataset.modeAlt;
				image.classList.remove('is-changing');
			}, 130);
		};
		nextImage.src = tab.dataset.modeImage;
	}

	tabs.forEach((tab, index) => {
		tab.addEventListener('click', () => selectTab(tab));
		tab.addEventListener('keydown', (event) => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
			event.preventDefault();
			const nextIndex = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
			tabs[nextIndex].focus();
			selectTab(tabs[nextIndex]);
		});
	});
}

function initializeReveals() {
	const elements = [...document.querySelectorAll('[data-reveal]')];
	if (!elements.length || reducedMotion.matches || !('IntersectionObserver' in window)) {
		elements.forEach((element) => element.classList.add('is-visible'));
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('is-visible');
			observer.unobserve(entry.target);
		});
	}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

	elements.forEach((element) => observer.observe(element));
}

function initializeHeroParallax() {
	const stage = document.querySelector('[data-parallax-stage]');
	const art = stage?.querySelector('.arcadeHero__art');
	const copy = stage?.querySelector('[data-parallax-copy]');
	if (!stage || !art || !copy || reducedMotion.matches || !window.matchMedia('(pointer: fine)').matches) return;

	stage.addEventListener('pointermove', (event) => {
		const bounds = stage.getBoundingClientRect();
		const x = (event.clientX - bounds.left) / bounds.width - 0.5;
		const y = (event.clientY - bounds.top) / bounds.height - 0.5;
		art.style.transform = `scale(1.025) translate(${x * -8}px, ${y * -8}px)`;
		copy.style.transform = `translate(${x * 5}px, ${y * 5}px)`;
	});

	stage.addEventListener('pointerleave', () => {
		art.style.transform = '';
		copy.style.transform = '';
	});
}

initializeCarousel();
initializeOutfits();
initializeModes();
initializeReveals();
initializeHeroParallax();
