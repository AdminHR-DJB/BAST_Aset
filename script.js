// --- LOGIKA UI & NAVIGASI SPA ---

document.addEventListener('DOMContentLoaded', () => {
    // Definisi Elemen Navigasi
    const navBast = document.getElementById('nav-bast');
    const navMaster = document.getElementById('nav-master');
    const navAset = document.getElementById('nav-aset');
    
    // Definisi Elemen View (Konten)
    const viewBast = document.getElementById('view-bast');
    const viewMaster = document.getElementById('view-master');
    const viewAset = document.getElementById('view-aset');
    
    const pageTitle = document.getElementById('page-title');

    // Fungsi untuk me-reset tampilan semua tombol nav
    function resetNavStyles() {
        const navs = [navBast, navMaster, navAset];
        navs.forEach(nav => {
            nav.classList.remove('bg-brand-green-dark');
            nav.classList.add('hover:bg-brand-green-dark');
        });
    }

    // Fungsi untuk menyembunyikan semua view
    function hideAllViews() {
        const views = [viewBast, viewMaster, viewAset];
        views.forEach(view => {
            view.classList.add('hidden');
        });
    }

    // Fungsi Switch Tab
    function switchTab(tabName) {
        hideAllViews();
        resetNavStyles();

        switch (tabName) {
            case 'bast':
                viewBast.classList.remove('hidden');
                navBast.classList.add('bg-brand-green-dark');
                navBast.classList.remove('hover:bg-brand-green-dark');
                pageTitle.textContent = "Monitoring BAST Aset";
                break;
            case 'master':
                viewMaster.classList.remove('hidden');
                navMaster.classList.add('bg-brand-green-dark');
                navMaster.classList.remove('hover:bg-brand-green-dark');
                pageTitle.textContent = "Master Data";
                break;
            case 'aset':
                viewAset.classList.remove('hidden');
                navAset.classList.add('bg-brand-green-dark');
                navAset.classList.remove('hover:bg-brand-green-dark');
                pageTitle.textContent = "Monitoring Aset";
                break;
        }
    }

    // Event Listener Navigasi
    navBast.addEventListener('click', () => switchTab('bast'));
    navMaster.addEventListener('click', () => switchTab('master'));
    navAset.addEventListener('click', () => switchTab('aset'));
});