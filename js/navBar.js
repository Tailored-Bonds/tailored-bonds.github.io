// Function to toggle the mobile menu (for smaller screens)
function toggleMobileMenu() {
    const navMenuLeft = document.querySelector('.nav-menu-left');
    const navMenuRight = document.querySelector('.nav-menu-right');

    // Toggle 'active' class for both left and right menus
    navMenuLeft.classList.toggle('active');
    navMenuRight.classList.toggle('active');
}

// Add event listener for the hamburger menu (mobile)
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
}


// Highlight the active link in the navbar
const navLinks = document.querySelectorAll('.nav-menu li a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(link => link.classList.remove('active'));
        link.classList.add('active');
    });
});