// Portfolio Website JavaScript

// ========== Theme Toggle (Cursor-style) ==========
const htmlElement = document.documentElement;
const themeSystem = document.getElementById('themeSystem');
const themeLight = document.getElementById('themeLight');
const themeDark = document.getElementById('themeDark');
const themeButtons = [themeSystem, themeLight, themeDark];

// Language selector
const langDropdown = document.getElementById('langDropdown');
const langMenu = document.getElementById('langMenu');
const langText = document.getElementById('langText');
const langOptions = document.querySelectorAll('.lang-option');
const languageDropdown = document.querySelector('.language-dropdown');

// Get saved theme preference or default to system
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
    const stored = localStorage.getItem('theme');
    return stored || 'system';
}

function applyTheme(theme) {
    let activeTheme = theme;
    
    if (theme === 'system') {
        activeTheme = getSystemTheme();
        // Apply the system theme by setting or removing data-theme attribute
        if (activeTheme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
        } else {
            htmlElement.removeAttribute('data-theme');
        }
    } else {
        htmlElement.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
    updateActiveButton(theme);
}

function updateActiveButton(theme) {
    themeButtons.forEach(btn => btn.classList.remove('active'));
    if (theme === 'system') themeSystem.classList.add('active');
    if (theme === 'light') themeLight.classList.add('active');
    if (theme === 'dark') themeDark.classList.add('active');
}

// Initialize theme
const savedTheme = getStoredTheme();
applyTheme(savedTheme);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getStoredTheme() === 'system') {
        applyTheme('system');
    }
});

// Theme button listeners
themeSystem.addEventListener('click', () => applyTheme('system'));
themeLight.addEventListener('click', () => applyTheme('light'));
themeDark.addEventListener('click', () => applyTheme('dark'));

// Language management
const languageNames = {
    'en': 'English'
};

const translations = {
    en: {
        nav: {
            home: 'Home',
            about: 'About',
            skills: 'Skills',
            projects: 'Projects',
            hobbies: 'Hobbies',
            contact: 'Contact'
        },
        hero: {
            title: "Hi, my name is Azhaf\nI'm a software developer",
            description: "I'm a software development student who loves turning ideas into code. I work with C#, Java, and Python to build web applications, APIs, and whatever interesting projects catch my attention. Currently learning and building while studying at Högskolan Kristianstad.",
            viewProjects: 'View Projects',
            github: 'GitHub'
        },
        about: {
            title: 'About',
            description: 'Software development student passionate about programming and problem-solving.',
            aboutMe: 'About me',
            text1: "I'm studying software development at Högskolan Kristianstad, working through my third semester. Most of what I know comes from actually building things - working on projects, making mistakes, and figuring out how to fix them. That's how I learn best.",
            text2: "I spend a lot of time coding, whether it's for school projects or stuff I'm curious about. I've built web apps with C# and Blazor, REST APIs with Java and Spring Boot, games in Python, and even tried my hand at AI integration. When something breaks, I debug it until it works. That persistence is probably my strongest skill.",
            technologies: 'Technologies',
            languages: 'Languages',
            linesOfCode: 'Lines of Code',
            education: 'Education',
            eduSchool: 'Högskolan Kristianstad',
            eduDegree: 'BA in Software Development | 2024-2027',
            eduDetails: 'Focus on programming, data structures, object-oriented design, databases, practical group projects, software architecture, and Agile/Scrum methodologies.'
        },
        skills: {
            title: 'Skills',
            description: 'Technologies and tools I work with to build amazing software.',
            languages: 'Languages',
            languagesDesc: 'Java, Python, C#, JavaScript, SQL',
            web: 'Web',
            webDesc: 'HTML, CSS, ASP.NET, Blazor',
            data: 'Data & APIs',
            dataDesc: 'MySQL, REST APIs, Firebase',
            cloud: 'Cloud & Tools',
            cloudDesc: 'Google Cloud, Firebase, Git, VS',
            methodologies: 'Methodologies',
            methodologiesDesc: 'Agile/Scrum, Jira, Testing, CI/CD'
        },
        projects: {
            title: 'Projects',
            description: 'A collection of projects showcasing my skills in software development.',
            clickForDetails: 'Click for more details',
            whatIBuilt: 'What I Built',
            technologies: 'Technologies & Architecture',
            keyFeatures: 'Key Features',
            viewGitHub: 'View on GitHub',
            close: 'Close'
        },
        contact: {
            title: 'Get In Touch',
            description: "Let's discuss opportunities, projects, or just say hello.",
            name: 'name',
            email: 'email',
            subject: 'subject',
            message: 'message',
            sendMessage: 'Send Message',
            sending: 'Sending...',
            success: 'Message sent successfully!',
            error: 'Failed to send message. Please try again.'
        },
        hobbies: {
            title: 'Hobbies',
            sectionTitle: 'Hobbies',
            sectionSubtitle: 'Jump into a world of adventure!'
        }
    }
};

function getStoredLanguage() {
    return localStorage.getItem('language') || 'en';
}

function applyLanguage(lang) {
    localStorage.setItem('language', lang);
    updateLanguageDisplay(lang);
    updateActiveLanguageOption(lang);
    translatePage(lang);
    // Close dropdown
    const languageDropdown = document.querySelector('.language-dropdown');
    if (languageDropdown) {
        languageDropdown.classList.remove('open');
    }
}

function updateLanguageDisplay(lang) {
    const langTextEl = document.getElementById('langText');
    if (langTextEl) {
        langTextEl.textContent = languageNames[lang];
    }
}

function updateActiveLanguageOption(lang) {
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        }
    });
}

function translatePage(lang) {
    const t = translations[lang];
    if (!t) {
        console.error('Translation not found for language:', lang);
        return;
    }

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const navKeys = ['home', 'about', 'skills', 'projects', 'hobbies', 'contact'];
    navLinks.forEach((link, index) => {
        if (navKeys[index] && t.nav[navKeys[index]]) {
            link.textContent = t.nav[navKeys[index]];
        }
    });
    
    // Hobbies section
    if (t.hobbies) {
        const hobbiesNavLink = Array.from(navLinks).find(link => link.getAttribute('href') === '#hobbies');
        if (hobbiesNavLink && t.hobbies.title) {
            hobbiesNavLink.textContent = t.hobbies.title;
        }
        const hobbiesTitle = document.querySelector('.hobbies-title');
        if (hobbiesTitle && t.hobbies.sectionTitle) {
            hobbiesTitle.textContent = t.hobbies.sectionTitle;
        }
        const hobbiesSubtitle = document.querySelector('.hobbies-subtitle');
        if (hobbiesSubtitle && t.hobbies.sectionSubtitle) {
            hobbiesSubtitle.textContent = t.hobbies.sectionSubtitle;
        }
    }

    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Handle newline in title
        const titleLines = t.hero.title.split('\n');
        if (titleLines.length > 1) {
            heroTitle.innerHTML = titleLines.join('<br>');
        } else {
            heroTitle.textContent = t.hero.title;
        }
    }
    const heroDesc = document.querySelector('.hero-description');
    if (heroDesc) {
        heroDesc.textContent = t.hero.description;
    }
    const btnPrimary = document.querySelector('.btn-primary');
    if (btnPrimary) {
        btnPrimary.textContent = t.hero.viewProjects;
    }
    const btnSecondary = document.querySelector('.btn-secondary');
    if (btnSecondary) {
        btnSecondary.textContent = t.hero.github;
    }

    // About section
    const aboutTitle = document.querySelector('#about .section-title');
    if (aboutTitle) {
        aboutTitle.textContent = t.about.title;
    }
    const aboutDesc = document.querySelector('#about .section-description');
    if (aboutDesc) {
        aboutDesc.textContent = t.about.description;
    }
    const aboutMe = document.querySelector('.about-text h3');
    if (aboutMe) {
        aboutMe.textContent = t.about.aboutMe;
    }
    const aboutTexts = document.querySelectorAll('.about-text p');
    if (aboutTexts.length >= 2) {
        aboutTexts[0].textContent = t.about.text1;
        aboutTexts[1].textContent = t.about.text2;
    }
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = t.about.technologies;
        statLabels[1].textContent = t.about.languages;
        statLabels[2].textContent = t.about.linesOfCode;
    }
    const eduH4 = document.querySelector('.education-info h4');
    if (eduH4) {
        eduH4.textContent = t.about.education;
    }
    const eduDetails = document.querySelector('.edu-details');
    if (eduDetails) {
        eduDetails.textContent = t.about.eduDetails;
    }

    // Skills section
    const skillsTitle = document.querySelector('#skills .section-title');
    if (skillsTitle) {
        skillsTitle.textContent = t.skills.title;
    }
    const skillsDesc = document.querySelector('#skills .section-description');
    if (skillsDesc) {
        skillsDesc.textContent = t.skills.description;
    }
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length >= 5) {
        skillCards[0].querySelector('h3').textContent = t.skills.languages;
        skillCards[0].querySelector('p').textContent = t.skills.languagesDesc;
        skillCards[1].querySelector('h3').textContent = t.skills.web;
        skillCards[1].querySelector('p').textContent = t.skills.webDesc;
        skillCards[2].querySelector('h3').textContent = t.skills.data;
        skillCards[2].querySelector('p').textContent = t.skills.dataDesc;
        skillCards[3].querySelector('h3').textContent = t.skills.cloud;
        skillCards[3].querySelector('p').textContent = t.skills.cloudDesc;
        skillCards[4].querySelector('h3').textContent = t.skills.methodologies;
        skillCards[4].querySelector('p').textContent = t.skills.methodologiesDesc;
    }

    // Projects section
    const projectsTitle = document.querySelector('#projects .section-title');
    if (projectsTitle) {
        projectsTitle.textContent = t.projects.title;
    }
    const projectsDesc = document.querySelector('#projects .section-description');
    if (projectsDesc) {
        projectsDesc.textContent = t.projects.description;
    }
    document.querySelectorAll('.click-for-details').forEach(el => {
        el.textContent = t.projects.clickForDetails;
    });
    document.querySelectorAll('.project-expanded-details h4').forEach((h4, index) => {
        if (index === 0) h4.textContent = t.projects.whatIBuilt;
        if (index === 1) h4.textContent = t.projects.technologies;
        if (index === 2) h4.textContent = t.projects.keyFeatures;
    });
    document.querySelectorAll('.project-expanded-actions a').forEach(a => {
        if (a.textContent.includes('GitHub')) {
            a.textContent = t.projects.viewGitHub;
        }
    });
    document.querySelectorAll('.close-expanded').forEach(btn => {
        btn.textContent = t.projects.close;
    });

    // Contact section
    const contactTitle = document.querySelector('#contact .section-title');
    if (contactTitle) {
        contactTitle.textContent = t.contact.title;
    }
    const contactDesc = document.querySelector('#contact .section-description');
    if (contactDesc) {
        contactDesc.textContent = t.contact.description;
    }
    const contactLabels = document.querySelectorAll('.code-form-label');
    if (contactLabels.length >= 4) {
        contactLabels[0].textContent = t.contact.name + ' =';
        contactLabels[1].textContent = t.contact.email + ' =';
        contactLabels[2].textContent = t.contact.subject + ' =';
        contactLabels[3].textContent = t.contact.message + ' =';
    }
    const sendBtn = document.querySelector('.btn-send, .code-form-submit');
    if (sendBtn) {
        sendBtn.textContent = t.contact.sendMessage;
    }

}

// Initialize language when DOM is ready
function initLanguage() {
    const langDropdownEl = document.getElementById('langDropdown');
    const langTextEl = document.getElementById('langText');
    const languageDropdownEl = document.querySelector('.language-dropdown');
    const langOptionsEl = document.querySelectorAll('.lang-option');
    
    if (!langDropdownEl || !langTextEl || !languageDropdownEl || !langOptionsEl.length) {
        // Retry if elements not ready
        setTimeout(initLanguage, 100);
        return;
    }

    const currentLanguage = getStoredLanguage();
    updateLanguageDisplay(currentLanguage);
    updateActiveLanguageOption(currentLanguage);
    translatePage(currentLanguage);

    // Toggle dropdown
    langDropdownEl.addEventListener('click', (e) => {
        e.stopPropagation();
        languageDropdownEl.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!languageDropdownEl.contains(e.target)) {
            languageDropdownEl.classList.remove('open');
        }
    });

    // Language option selection
    langOptionsEl.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = option.getAttribute('data-lang');
            applyLanguage(lang);
        });
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}

// ========== Navigation ==========
const navbar = document.querySelector('.navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
let lastScrollY = 0;
let animationTimeout = null;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Animate logo dots on scroll (throttled) - sequential flow one by one
    const logoDots = document.querySelectorAll('.logo-dot');
    const scrollDiff = Math.abs(window.scrollY - lastScrollY);
    
    if (scrollDiff > 5 && window.scrollY > 10) {
        // Clear any pending animation
        if (animationTimeout) {
            clearTimeout(animationTimeout);
        }
        
        // Remove animation class first
        logoDots.forEach(dot => {
            dot.classList.remove('dot-animate');
        });
        
        // Force reflow
        void logoDots[0].offsetHeight;
        
        // Add animation class sequentially - one by one, waiting for each to complete
        logoDots.forEach((dot, index) => {
            setTimeout(() => {
                dot.classList.add('dot-animate');
                // Remove class after this dot's animation completes
                setTimeout(() => {
                    dot.classList.remove('dot-animate');
                }, 400);
            }, index * 450); // 450ms delay - each dot waits for previous to finish (400ms animation + 50ms gap)
        });
    }
    
    lastScrollY = window.scrollY;
});

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    });
});

// ========== Hobbies Section Interactions ==========
document.addEventListener('DOMContentLoaded', () => {
    const hobbyRealms = document.querySelectorAll('.hobby-realm');
    
    hobbyRealms.forEach(realm => {
        // Add parallax effect on mouse move
        realm.addEventListener('mousemove', (e) => {
            const rect = realm.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            realm.style.transform = `translateY(-20px) scale(1.05) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });
        
        realm.addEventListener('mouseleave', () => {
            realm.style.transform = '';
        });
        
        // Add click effect
        realm.addEventListener('click', () => {
            realm.style.animation = 'none';
            setTimeout(() => {
                realm.style.animation = 'realmEntrance 0.5s ease-out';
            }, 10);
        });
    });
    
    // Intersection Observer for hobbies section animations
    const hobbiesSection = document.getElementById('hobbies');
    if (hobbiesSection) {
        const hobbiesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    hobbiesSection.classList.add('in-view');
                    // Trigger entrance animations
                    hobbyRealms.forEach((realm, index) => {
                        setTimeout(() => {
                            realm.style.animation = 'realmEntrance 1s ease-out forwards';
                        }, index * 200);
                    });
                }
            });
        }, { threshold: 0.1 });
        
        hobbiesObserver.observe(hobbiesSection);
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function activateNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', activateNavLink);

// ========== Smooth Scrolling ==========
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========== Animated Counter for Stats ==========
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const statLabel = element.nextElementSibling;
    const labelText = statLabel ? statLabel.textContent.trim() : '';
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            if (labelText === 'Lines of Code') {
                element.textContent = target + 'K+';
            } else {
                element.textContent = target + (target >= 100 ? '+' : '');
            }
            clearInterval(timer);
        } else {
            if (labelText === 'Lines of Code') {
                element.textContent = Math.floor(current) + 'K+';
            } else {
                element.textContent = Math.floor(current);
            }
        }
    }, 16);
}

// Intersection Observer for stats animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statItem = entry.target;
            const statNumber = statItem.querySelector('.stat-number');
            if (statNumber && !statNumber.classList.contains('animated')) {
                statNumber.classList.add('animated');
                animateCounter(statNumber);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(item => {
    statsObserver.observe(item);
});

// ========== Skill Progress Bars Animation ==========
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBar = entry.target;
            const width = progressBar.getAttribute('data-width');
            if (!progressBar.classList.contains('animated')) {
                progressBar.classList.add('animated');
                progressBar.style.width = width + '%';
            }
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// ========== Scroll Animations ==========
const fadeElements = document.querySelectorAll('.skill-card, .project-card, .stat-item, .section-header, .about-text, .about-image, .contact-info, .contact-form');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(element);
});

// ========== Contact Form Handling ==========
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;

        // Simple validation
        if (!name || !email || !subject || !message) {
            showFormMessage('Please fill in all fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate form submission
        showFormMessage('Sending message...', 'success');
        
        // Simulate API call
        setTimeout(() => {
            showFormMessage('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
            
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message code-form-message ${type}`;
    formMessage.style.display = 'block';
}

// ========== Typing Effect (Optional Enhancement) ==========
const typingElement = document.querySelector('.typing-text');
if (typingElement) {
    const texts = [
        'Creative Developer & Designer',
        'Software Development Student',
        'Full-Stack Enthusiast',
        'Problem Solver'
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeText() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentText.length) {
            setTimeout(() => isDeleting = true, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }

        setTimeout(typeText, isDeleting ? 50 : 100);
    }

    // Start typing effect after a delay
    setTimeout(typeText, 1000);
}

// ========== Code Tab Switching ==========
function initCodeTabs() {
    const codeWindows = document.querySelectorAll('.code-window');
    
    codeWindows.forEach(window => {
        const tabs = window.querySelectorAll('.code-tab');
        
        if (tabs.length > 0) {
            tabs.forEach((tab) => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    tab.classList.add('active');
                });
            });
        }
    });
}

// ========== Expandable Project Cards ==========
// Initialize project card expansion
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-testimonial-card');
    const projectBackdrop = document.getElementById('projectBackdrop');

    console.log('initProjectCards: Found', projectCards.length, 'cards');
    console.log('initProjectCards: Backdrop exists?', !!projectBackdrop);

    if (projectCards.length === 0) {
        console.warn('No project cards found!');
        return;
    }
    
    if (!projectBackdrop) {
        console.warn('Project backdrop not found!');
        return;
    }

    // Remove any existing expanded classes on page load (cleanup)
    projectCards.forEach(card => {
        if (card.classList.contains('expanded')) {
            console.log('Removing stale expanded class from card');
            card.classList.remove('expanded');
        }
    });
    // Backdrop removed - no longer needed
    document.body.style.overflow = '';

    // Track if a card is currently being toggled to prevent double-clicks
    let isToggling = false;
    
    projectCards.forEach((card, index) => {
        // Skip if already has listener (prevent duplicates)
        if (card.hasAttribute('data-listener-attached')) {
            console.log(`Skipping card ${index} - listener already attached`);
            return;
        }
        
        console.log(`Setting up click handler for card ${index}`);
        card.setAttribute('data-listener-attached', 'true');
        
        card.addEventListener('click', function(e) {
            // Use currentTarget to get the actual card that was clicked
            const clickedCard = e.currentTarget;
            
            // Prevent double-clicks
            if (isToggling) {
                console.log('Already toggling, ignoring click');
                return;
            }
            
            console.log('=== CARD CLICKED ===');
            console.log('Target:', e.target);
            console.log('Target tag:', e.target.tagName);
            console.log('Current card classes BEFORE:', clickedCard.className);
            
            // Check if click is on a link or button
            const clickedLink = e.target.closest('a.project-github-link');
            const clickedButton = e.target.closest('button.close-expanded');
            
            if (clickedLink || clickedButton) {
                console.log('Skipping - clicked on link/button');
                return;
            }
            
            console.log('PROCEEDING WITH EXPANSION');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Prevent other listeners
            
            isToggling = true;
            
            // Check current state BEFORE toggling
            const isCurrentlyExpanded = clickedCard.classList.contains('expanded');
            console.log('Is currently expanded?', isCurrentlyExpanded);
            
            // Toggle expanded state
            if (isCurrentlyExpanded) {
                console.log('Collapsing card');
                clickedCard.classList.remove('expanded');
                document.body.style.overflow = '';
            } else {
                console.log('Expanding card');
                // Close any other expanded card
                projectCards.forEach(c => {
                    if (c !== clickedCard && c.classList.contains('expanded')) {
                        c.classList.remove('expanded');
                    }
                });
                
                clickedCard.classList.add('expanded');
                document.body.style.overflow = 'hidden';
                console.log('Card expanded! Classes AFTER:', clickedCard.className);
                
                // Check if expanded content exists
                const expandedContent = clickedCard.querySelector('.project-expanded-content');
                console.log('Expanded content element:', expandedContent);
                if (expandedContent) {
                    console.log('Expanded content display:', window.getComputedStyle(expandedContent).display);
                    console.log('Expanded content visibility:', window.getComputedStyle(expandedContent).visibility);
                    console.log('Expanded content opacity:', window.getComputedStyle(expandedContent).opacity);
                    console.log('Expanded content innerHTML length:', expandedContent.innerHTML.length);
                } else {
                    console.warn('No .project-expanded-content found in card!');
                }
            }
            
            // Reset toggle flag after a short delay
            setTimeout(() => {
                isToggling = false;
            }, 300);
        }, { once: false, capture: false });
        
        console.log(`Click handler attached to card ${index}`);
    });

    // Close when clicking outside the expanded card
    document.addEventListener('click', (e) => {
        const expandedCard = document.querySelector('.project-testimonial-card.expanded');
        if (expandedCard) {
            // Close if clicking outside the card (not on the card or its children)
            if (!expandedCard.contains(e.target)) {
                expandedCard.classList.remove('expanded');
                document.body.style.overflow = '';
            }
        }
    });

    // Close function for close button
    window.closeProject = function(button) {
        const card = button.closest('.project-testimonial-card');
        if (card) {
            card.classList.remove('expanded');
            document.body.style.overflow = '';
        }
    };

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.project-testimonial-card').forEach(card => {
                card.classList.remove('expanded');
            });
            document.body.style.overflow = '';
        }
    });
}

// ========== Initialize on page load ==========
document.addEventListener('DOMContentLoaded', () => {
    // Prevent scroll restoration and ensure page starts at top
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Scroll to top on page load (especially for mobile)
    window.scrollTo(0, 0);
    
    // Set initial active nav link
    activateNavLink();
    initCodeTabs();
    initProjectCards();
});

// Ensure page starts at top on reload and re-initialize if needed
window.addEventListener('load', () => {
    // Clear any hash from URL
    if (window.location.hash) {
        window.history.replaceState(null, null, ' ');
    }
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Re-initialize project cards in case they weren't ready
    const cards = document.querySelectorAll('.project-testimonial-card');
    const backdrop = document.getElementById('projectBackdrop');
    if (cards.length > 0 && backdrop && !backdrop.hasAttribute('data-initialized')) {
        backdrop.setAttribute('data-initialized', 'true');
        initProjectCards();
    }
});
