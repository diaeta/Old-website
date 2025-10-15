console.log('=== NEW-MENU.JS LOADED ===');

// ULTRA-AGGRESSIVE FIX: Intercept using BOTH capture phase click AND mousedown/touchstart
function forceNavigateToDropdownItem(e) {
  console.log('Event detected:', e.type, 'Width:', window.innerWidth);

  // Only in mobile mode
  if (window.innerWidth >= 1200) {
    console.log('Desktop mode, skipping');
    return;
  }

  // Check if a dropdown item was clicked
  const clickedItem = e.target.closest('.dropdown-item');
  console.log('Clicked element:', e.target, 'Closest dropdown-item:', clickedItem);

  if (!clickedItem) return;

  // Check if it's inside a dropdown menu
  const dropdownMenu = clickedItem.closest('.dropdown-menu');
  if (!dropdownMenu) {
    console.log('Not in dropdown menu');
    return;
  }

  const href = clickedItem.getAttribute('href');
  console.log('!!! DROPDOWN ITEM DETECTED IN MOBILE MODE !!!');
  console.log('Href:', href);

  if (href && href !== '#' && href !== '') {
    // Prevent any other handlers from interfering
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    console.log('>>> FORCING NAVIGATION TO:', href);

    // Close all menus immediately
    document.querySelectorAll('.dropdown').forEach(function(d) {
      d.classList.remove('show');
    });
    document.querySelectorAll('.dropdown-menu').forEach(function(m) {
      m.classList.remove('show');
    });
    const collapse = document.querySelector('.navbar-collapse');
    if (collapse) {
      collapse.classList.remove('show');
    }

    // Force navigation immediately
    console.log('>>> NAVIGATING NOW TO:', href);
    window.location.href = href;
  } else {
    console.log('Invalid href:', href);
  }
}

// Add listeners for click, mousedown, AND touchstart
document.addEventListener('click', forceNavigateToDropdownItem, true);
document.addEventListener('mousedown', forceNavigateToDropdownItem, true);
document.addEventListener('touchstart', forceNavigateToDropdownItem, true);
console.log('=== EVENT LISTENERS ATTACHED ===');

// Wait for all scripts to load and then initialize our new menu
window.addEventListener('load', function() {
  // Small delay to ensure all other scripts are processed
  setTimeout(function() {
    console.log('Initializing new menu...');

    // Disable any old rd-navbar functionality
    const oldNavbar = document.querySelector('.rd-navbar-wrap');
    if (oldNavbar) {
      oldNavbar.style.display = 'none';
      oldNavbar.style.visibility = 'hidden';
    }

    // Disable Bootstrap dropdown functionality
    if (window.bootstrap && window.bootstrap.Dropdown) {
      // Remove Bootstrap dropdown event listeners
      document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(function(element) {
        element.removeAttribute('data-bs-toggle');
      });
    }

    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (navbarToggler && navbarCollapse) {
      // Remove any existing event listeners
      const newToggler = navbarToggler.cloneNode(true);
      navbarToggler.parentNode.replaceChild(newToggler, navbarToggler);
      
      newToggler.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        navbarCollapse.classList.toggle('show');
      });
    }

    dropdowns.forEach(function(dropdown) {
      const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
      const dropdownMenu = dropdown.querySelector('.dropdown-menu');

      if (dropdownToggle && dropdownMenu) {
        // Remove Bootstrap attributes without cloning
        dropdownToggle.removeAttribute('data-bs-toggle');
        dropdownToggle.removeAttribute('aria-expanded');

        // Handle dropdown toggle clicks
        dropdownToggle.addEventListener('click', function(e) {
          if (window.innerWidth < 1200) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Dropdown toggle clicked');

            const isAlreadyOpen = dropdown.classList.contains('show');

            // First, close all open dropdowns
            dropdowns.forEach(function(d) {
              d.classList.remove('show');
              const menu = d.querySelector('.dropdown-menu');
              if (menu) {
                menu.classList.remove('show');
              }
            });

            // If the clicked one wasn't already open, open it.
            if (!isAlreadyOpen) {
              dropdown.classList.add('show');
              dropdownMenu.classList.add('show');
              console.log('Dropdown opened');
            } else {
              console.log('Dropdown closed');
            }
          }
        });

        // Note: Dropdown item clicks are handled by the capture phase handler at the top of this file
      }
    });
    
    // Close mobile menu and dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      // Don't close if clicking on navbar elements
      if (e.target.closest('.navbar-toggler') || e.target.closest('.dropdown-toggle')) {
        return;
      }
      
      // Close mobile menu when clicking outside navbar
      if (!e.target.closest('.navbar') && navbarCollapse && navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
      }
      
      // Close dropdowns when clicking outside dropdown area
      if (!e.target.closest('.dropdown')) {
        dropdowns.forEach(function(dropdown) {
          if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
              dropdownMenu.classList.remove('show');
            }
          }
        });
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 1200) {
        // Reset mobile menu state on desktop
        if (navbarCollapse) {
          navbarCollapse.classList.remove('show');
        }
        // Reset dropdown states
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('show');
          const dropdownMenu = dropdown.querySelector('.dropdown-menu');
          if (dropdownMenu) {
            dropdownMenu.classList.remove('show');
          }
        });
      }
    });
    
    console.log('New menu initialized successfully');
  }, 1000); // Increased delay to ensure all scripts are loaded
});