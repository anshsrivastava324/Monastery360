// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Slideshow functionality
let slideIndex = 1;
let slideTimer;

showSlides(slideIndex);
autoSlides();

function plusSlides(n) {
    clearTimeout(slideTimer);
    showSlides(slideIndex += n);
    autoSlides();
}

function currentSlide(n) {
    clearTimeout(slideTimer);
    showSlides(slideIndex = n);
    autoSlides();
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].classList.remove("active");
    }

    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    if (slides[slideIndex-1]) {
        slides[slideIndex-1].style.display = "block";
        slides[slideIndex-1].classList.add("active");
    }

    if (dots[slideIndex-1]) {
        dots[slideIndex-1].className += " active";
    }
}

function autoSlides() {
    slideTimer = setTimeout(function() {
        slideIndex++;
        showSlides(slideIndex);
        autoSlides();
    }, 5000); // Change slide every 5 seconds
}

// Intersection Observer for feature cards
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.transitionDelay = `${index * 0.15}s`;
                entry.target.classList.add('animate');
            }, 100);
        }
    });
}, observerOptions);

const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => observer.observe(card));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const mountains = document.querySelector('.mountains');
    const mandala = document.querySelector('.mandala-bg');

    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }

    if (mountains) {
        mountains.style.transform = `translateY(${scrolled * 0.2}px)`;
    }

    if (mandala) {
        mandala.style.opacity = Math.max(0, 1 - (scrolled / 500));
    }
});

// Create additional prayer flags dynamically
const prayerFlagsContainer = document.querySelector('.prayer-flags');
for (let i = 1; i <= 3; i++) {
    const flagContainer = document.createElement('div');
    flagContainer.className = 'flag-container';
    flagContainer.style.left = `${i * 25}%`;
    flagContainer.style.animationDelay = `${i * 0.5}s`;

    for (let j = 0; j < 5; j++) {
        const flag = document.createElement('div');
        flag.className = 'flag';
        flag.style.animationDelay = `${j * 0.2 + i * 0.5}s`;
        const colors = ['#0066cc', '#ffffff', '#cc0000', '#00cc00', '#ffcc00'];
        flag.style.background = colors[j];
        flagContainer.appendChild(flag);
    }

    prayerFlagsContainer.appendChild(flagContainer);
}