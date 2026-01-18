
// ============================================================
// FUNCIONALIDAD DE LA PLANTILLA
// ============================================================

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');

    // En móvil, toggle open
    if (window.innerWidth <= 992) {
        sidebar.classList.toggle('open');
    }
}

// Toggle Submenu
function toggleSubmenu(button) {
    const submenu = button.nextElementSibling;
    const arrow = button.querySelector('.menu-item-arrow');

    submenu.classList.toggle('show');

    if (submenu.classList.contains('show')) {
        arrow.classList.remove('bi-chevron-down');
        arrow.classList.add('bi-chevron-up');
    } else {
        arrow.classList.remove('bi-chevron-up');
        arrow.classList.add('bi-chevron-down');
    }
}

// Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.getElementById('themeIcon');

    if (document.body.classList.contains('light-theme')) {
        icon.classList.remove('bi-moon-fill');
        icon.classList.add('bi-sun-fill');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.remove('bi-sun-fill');
        icon.classList.add('bi-moon-fill');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeIcon').classList.remove('bi-moon-fill');
    document.getElementById('themeIcon').classList.add('bi-sun-fill');
}

// Toggle Notifications (placeholder)
function toggleNotifications() {
    alert('Panel de notificaciones - Implementar con Angular Material o componente personalizado');
}

// Simular actualización de stats
function updateStats() {
    const pkts = document.getElementById('statPkts');
    const conn = document.getElementById('statConn');

    setInterval(() => {
        pkts.textContent = (Math.floor(Math.random() * 3000) + 2000).toLocaleString();
        conn.textContent = Math.floor(Math.random() * 100) + 100;
    }, 2000);
}

updateStats();

// Responsive sidebar
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 992) {
        sidebar.classList.remove('open');
    }
});

// Click outside to close sidebar on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.header-toggle');

    if (window.innerWidth <= 992 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});
