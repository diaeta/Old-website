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
        // Remove any existing event listeners and attributes
        const newToggle = dropdownToggle.cloneNode(true);
        dropdownToggle.parentNode.replaceChild(newToggle, dropdownToggle);
        
        // Remove any Bootstrap attributes
        newToggle.removeAttribute('data-bs-toggle');
        newToggle.removeAttribute('aria-expanded');
        
        newToggle.addEventListener('click', function(e) {
          if (window.innerWidth < 1560) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
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
            }
          }
        });
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
      if (window.innerWidth >= 1560) {
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