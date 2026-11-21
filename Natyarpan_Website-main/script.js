 /* --- HAMBURGER MENU --- */
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navBar = document.querySelector('.nav-bar');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');

    function closeNav() {
        hamburgerBtn.classList.remove('active');
        navBar.classList.remove('open');
        mobileOverlay.classList.remove('show');
    }

    hamburgerBtn.onclick = () => {
        hamburgerBtn.classList.toggle('active');
        navBar.classList.toggle('open');
        mobileOverlay.classList.toggle('show');
    };

    mobileOverlay.onclick = closeNav;

    // Close nav when a link is clicked
    navBar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

    /* --- SCRATCH TICKET MODAL --- */
    const modal = document.getElementById('scratch-modal');
    const openBtn = document.getElementById('open-scratch');
    const closeBtn = document.querySelector('.close-modal');
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('download-btn');
    const ticketImg = document.getElementById('ticket-img');
    let isDrawing = false;

    openBtn.onclick = () => { modal.style.display = 'flex'; initCanvas(); };
    closeBtn.onclick = () => { modal.style.display = 'none'; };

    function initCanvas() {
        const container = document.querySelector('.scratch-container');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#777';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 7);
        ctx.globalCompositeOperation = 'destination-out';
    }

    function scratch(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        checkScratchPercentage();
    }

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; e.preventDefault(); });
    window.addEventListener('mousemove', scratch);
    window.addEventListener('touchmove', (e) => scratch(e), { passive: false });
    window.addEventListener('mouseup', () => isDrawing = false);
    window.addEventListener('touchend', () => isDrawing = false);

    function checkScratchPercentage() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let clearPixels = 0;
        for (let i = 3; i < pixels.length; i += 4) { if (pixels[i] === 0) clearPixels++; }
        const percentage = (clearPixels / (pixels.length / 4)) * 100;
        if (percentage > 50) {
            downloadBtn.style.display = 'inline-block';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = ticketImg.src;
        link.download = 'Natyarpan_Ticket.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* --- HISTORY HOVER POPUP --- */
    const popup = document.getElementById('hoverPopup');
    let hoverTimer;

    function showPopup(element, title, year, img, desc) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
            document.getElementById('pop-title').innerText = title;
            document.getElementById('pop-year').innerText = year;
            document.getElementById('pop-img').src = img;
            document.getElementById('pop-desc').innerText = desc;

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + (rect.width / 2);
            const centerY = rect.top + (rect.height / 2);

            let leftPos = centerX - 160; 
            let topPos = centerY + window.scrollY - 200; 

            if (leftPos < 20) leftPos = 20;
            if (leftPos + 320 > window.innerWidth) leftPos = window.innerWidth - 340;

            popup.style.left = `${leftPos}px`;
            popup.style.top = `${topPos}px`;
            popup.classList.add('visible');
        }, 400); 
    }

    function hidePopup() {
        clearTimeout(hoverTimer);
        popup.classList.remove('visible');
    }
   

/* --- TEAM CAROUSEL WITH VIEWPORT DETECTION --- */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.team-card');
    const stack = document.getElementById('cardStack');
    let currentIndex = 0;
    let autoSlideInterval;

    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
            if (index === currentIndex) {
                card.classList.add('active'); 
                card.style.opacity = "1"; 
                card.style.pointerEvents = "auto";
            } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
                card.classList.add('prev'); 
                card.style.opacity = "0.4"; 
                card.style.pointerEvents = "auto";
            } else if (index === (currentIndex + 1) % cards.length) {
                card.classList.add('next'); 
                card.style.opacity = "0.4"; 
                card.style.pointerEvents = "auto";
            }
        });
    }

    function moveNext() { 
        currentIndex = (currentIndex + 1) % cards.length; 
        updateCarousel(); 
    }
    
    function movePrev() { 
        currentIndex = (currentIndex - 1 + cards.length) % cards.length; 
        updateCarousel(); 
    }

    // Functions to manage the timer
    function startAutoSlide() { 
        stopAutoSlide(); // Safety clear
        autoSlideInterval = setInterval(moveNext, 2500); 
    }
    
    function stopAutoSlide() { 
        clearInterval(autoSlideInterval); 
    }

    /* Intersection Observer: Starts/Stops sliding based on visibility */
    const observerOptions = { threshold: 0.2 }; // Starts when 20% of the section is visible
    
    const teamObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoSlide();
            } else {
                stopAutoSlide();
            }
        });
    }, observerOptions);

    teamObserver.observe(stack);

    /* User Interaction Overrides */
    stack.addEventListener('mouseenter', stopAutoSlide);
    stack.addEventListener('mouseleave', () => {
        // Only restart if the user hasn't scrolled away
        startAutoSlide();
    });

    // Handle manual clicks on side cards
    cards.forEach((card) => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('next')) { 
                e.stopPropagation(); 
                moveNext(); 
            } else if (card.classList.contains('prev')) { 
                e.stopPropagation(); 
                movePrev(); 
            }
        });
    });

    // Touch support for mobile swiping
    let startX = 0;
    stack.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        stopAutoSlide();
    });
    
    stack.addEventListener('touchend', e => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) moveNext();
        if (endX - startX > 50) movePrev();
        startAutoSlide();
    });

    updateCarousel();
});

