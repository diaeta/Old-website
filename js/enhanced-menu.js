// Enhanced Navigation Menu JavaScript for Diaeta.be

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing enhanced navigation menu...');
    
    // Initialize all navigation components
    initializeMobileMenu();
    initializeDropdowns();
    initializeSearch();
    initializeLanguageSwitcher();
    initializeAccessibility();
    initializeSmoothScrolling();
    
    console.log('Enhanced navigation menu initialized successfully');
});

// ===== MOBILE MENU FUNCTIONALITY =====
function initializeMobileMenu() {
    const toggle = document.querySelector('.rd-navbar-toggle');
    const menuWrap = document.querySelector('.rd-navbar-menu-wrap');
    const body = document.body;
    
    if (!toggle || !menuWrap) return;
    
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = menuWrap.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.rd-navbar-wrap') && menuWrap.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuWrap.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    function openMobileMenu() {
        menuWrap.classList.add('active');
        toggle.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Focus management
        const firstLink = menuWrap.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
    
    function closeMobileMenu() {
        menuWrap.classList.remove('active');
        toggle.classList.remove('active');
        body.style.overflow = '';
        
        // Return focus to toggle button
        toggle.focus();
    }
}

// ===== DROPDOWN FUNCTIONALITY =====
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.rd-navbar--has-dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const dropdownMenu = dropdown.querySelector('.rd-navbar-dropdown');
        
        if (!link || !dropdownMenu) return;
        
        // Desktop hover functionality
        if (window.innerWidth > 767) {
            dropdown.addEventListener('mouseenter', function() {
                closeAllDropdowns();
                dropdown.classList.add('active');
                dropdownMenu.style.display = 'block';
            });
            
            dropdown.addEventListener('mouseleave', function() {
                dropdown.classList.remove('active');
                dropdownMenu.style.display = 'none';
            });
        }
        
        // Mobile click functionality
        if (window.innerWidth <= 767) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = dropdown.classList.contains('active');
                closeAllDropdowns();
                
                if (!isActive) {
                    dropdown.classList.add('active');
                    dropdownMenu.style.display = 'block';
                    link.setAttribute('aria-expanded', 'true');
                } else {
                    link.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // Keyboard navigation
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                
                if (window.innerWidth <= 767) {
                    link.click();
                }
            }
        });
    });
    
    function closeAllDropdowns() {
        dropdowns.forEach(d => {
            d.classList.remove('active');
            const menu = d.querySelector('.rd-navbar-dropdown');
            if (menu) {
                menu.style.display = 'none';
            }
            const link = d.querySelector('a');
            if (link) {
                link.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.rd-navbar--has-dropdown')) {
            closeAllDropdowns();
        }
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchForms = document.querySelectorAll('.nav-search form');
    
    searchForms.forEach(form => {
        const input = form.querySelector('input');
        const button = form.querySelector('button');
        
        if (!input || !button) return;
        
        // Form submission
        form.addEventListener('submit', function(e) {
            const query = input.value.trim();
            
            if (!query) {
                e.preventDefault();
                input.focus();
                showSearchError('Veuillez entrer un terme de recherche');
                return;
            }
            
            // Add loading state
            button.disabled = true;
            button.innerHTML = '<span class="spinner"></span>';
            
            // Simulate search (replace with actual search implementation)
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = '<span class="novi-icon mdi mdi-magnify"></span>';
                
                // For demo purposes, redirect to a search results page
                // In production, this would be handled by your backend
                window.location.href = `search-results.html?s=${encodeURIComponent(query)}`;
            }, 1000);
        });
        
        // Input validation
        input.addEventListener('input', function() {
            clearSearchError();
            
            if (this.value.trim()) {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
        
        // Keyboard shortcuts
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.blur();
                clearSearchError();
            }
        });
    });
}

function showSearchError(message) {
    clearSearchError();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'search-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 0.25rem;
    `;
    
    const searchContainer = document.querySelector('.nav-search');
    if (searchContainer) {
        searchContainer.appendChild(errorDiv);
    }
}

function clearSearchError() {
    const error = document.querySelector('.search-error');
    if (error) {
        error.remove();
    }
}

// ===== LANGUAGE SWITCHER =====
function initializeLanguageSwitcher() {
    const languageLinks = document.querySelectorAll('.language-switcher a');
    const currentPath = window.location.pathname;
    
    languageLinks.forEach(link => {
        // Set active state based on current page
        if (link.href.includes(currentPath) || 
            (currentPath === '/' && link.href.includes('index.html'))) {
            link.classList.add('active');
        }
        
        // Add click tracking (optional)
        link.addEventListener('click', function() {
            // You can add analytics tracking here
            console.log('Language switched to:', this.textContent.trim());
        });
    });
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Passer au contenu principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #005773;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not present
    const mainContent = document.querySelector('main') || document.querySelector('.page');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
    
    // Enhanced focus management
    const focusableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focused');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    });
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.rd-navbar-menu-wrap');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    document.querySelector('.rd-navbar-toggle').classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Smooth scroll to target
                const headerHeight = document.querySelector('.rd-navbar-wrap').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, href);
                
                // Focus management for accessibility
                setTimeout(() => {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 1000);
            }
        });
    });
}

// ===== WINDOW RESIZE HANDLING =====
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(function() {
        // Reinitialize components on resize
        if (window.innerWidth > 767) {
            // Desktop mode
            const mobileMenu = document.querySelector('.rd-navbar-menu-wrap');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
            
            const toggle = document.querySelector('.rd-navbar-toggle');
            if (toggle) {
                toggle.classList.remove('active');
            }
            
            document.body.style.overflow = '';
        }
        
        // Reinitialize dropdowns
        initializeDropdowns();
    }, 250);
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe navigation elements for animations
document.addEventListener('DOMContentLoaded', function() {
    const navElements = document.querySelectorAll('.rd-navbar-nav > li');
    navElements.forEach(el => observer.observe(el));
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Navigation error:', e.error);
    
    // Fallback to basic navigation if enhanced features fail
    if (e.error && e.error.message.includes('navigation')) {
        console.log('Falling back to basic navigation');
        // Implement fallback navigation here
    }
});

// ===== ANALYTICS INTEGRATION (Optional) =====
function trackNavigationEvent(action, label) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: 'Navigation',
            event_label: label
        });
    }
    
    // Google Analytics Universal
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Navigation', action, label);
    }
}

// Track navigation interactions
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.closest('.rd-navbar-nav')) {
        const text = link.textContent.trim();
        trackNavigationEvent('click', text);
    }
});

// ===== EXPORT FOR GLOBAL ACCESS =====
window.DiaetaNavigation = {
    openMobileMenu: function() {
        const menuWrap = document.querySelector('.rd-navbar-menu-wrap');
        if (menuWrap) {
            menuWrap.classList.add('active');
            document.querySelector('.rd-navbar-toggle').classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeMobileMenu: function() {
        const menuWrap = document.querySelector('.rd-navbar-menu-wrap');
        if (menuWrap) {
            menuWrap.classList.remove('active');
            document.querySelector('.rd-navbar-toggle').classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    trackEvent: trackNavigationEvent
};
