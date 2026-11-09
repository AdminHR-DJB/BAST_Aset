// =========================================================
// SCRIPT.JS - LOGIKA UI & NAVIGASI SINGLE PAGE APPLICATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. STATE & MOCK DATA (Simulasi Database)
    // ==========================================
    // Data ini sementara digunakan agar UI bisa dirender dan diuji.
    // Nantinya akan diganti dengan data real-time dari Firebase Firestore.
    let state = {
        bast: [],
        masterBarang: ["Splicer", "Kabel Dropcore 1 Core", "Router ZTE F609", "Tiang Besi 7m"],
        masterKaryawan: ["Ardian Mustofa", "Budi Santoso", "Siti Aminah", "Joko Widodo"],
        aset: [] // Berisi distribusi aset yang dipecah/disatukan berdasarkan rules BAST
    };

    // ==========================================
    // 2. LOGIKA NAVIGASI SPA (TABS)
    // ==========================================
    const views = {
        bast: document.getElementById('view-bast'),
        master: document.getElementById('view-master'),
        aset: document.getElementById('view-aset')
    };
    
    const navButtons = {
        bast: document.getElementById('nav-bast'),
        master: document.getElementById('nav-master'),
        aset: document.getElementById('nav-aset')
    };

    const pageTitle = document.getElementById('page-title');

    function switchTab(tabName, title) {
        // Sembunyikan semua view & reset style tombol
        Object.keys(views).forEach(key => {
            views[key].classList.add('hidden');
            navButtons[key].classList.remove('bg-brand-green-dark');
            navButtons[key].classList.add('hover:bg-brand-green-dark');
        });

        // Tampilkan view yang dipilih
        views[tabName].classList.remove('hidden');
        navButtons[tabName].classList.add('bg-brand-green-dark');
        navButtons[tabName].classList.remove('hover:bg-brand-green-dark');
        pageTitle.textContent = title;
    }

    navButtons.bast.addEventListener('click', () => switchTab('bast', 'Monitoring BAST Aset'));
    navButtons.master.addEventListener('click', () => switchTab('master', 'Master Data'));
    navButtons.aset.addEventListener('click', () => switchTab('aset', 'Distribusi Aset Karyawan'));


    // ==========================================
    // 3. LOGIKA MODAL (POP-UP)
    // ==========================================
    const modals = {
        tambahBast: document.getElementById('modal-tambah-bast'),
        editBast: document.getElementById('modal-edit-bast'),
        loading: document.getElementById('modal-loading'),
        sukses: document.getElementById('modal-sukses')
    };

    // Fungsi utilitas buka/tutup modal
    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

    // Event Listener Buka Modal
    document.getElementById('btn-open-tambah-bast').addEventListener('click', () => {
        document.getElementById('form-tambah-bast').reset();
        generateNomorSuratBerdasarkanTanggal(); // Set nomor surat default
        openModal(modals.tambahBast);
    });

    // Event Listener Tutup Modal
    document.querySelectorAll('.btn-close-tambah').forEach(btn => btn.addEventListener('click', () => closeModal(modals.tambahBast)));
    document.querySelectorAll('.btn-close-edit').forEach(btn => btn.addEventListener('click', () => closeModal(modals.editBast)));
    document.getElementById('btn-close-sukses').addEventListener('click', () => closeModal(modals.sukses));


    // ==========================================
    // 4. LOGIKA INTERAKSI FORM BAST
    // ==========================================
    
    // A. Otomatisasi Nomor Surat BAST
    const inputTgl = document.getElementById('input-tgl');
    const inputNoUrut = document.getElementById('input-no-urut');
    const inputNoSurat = document.getElementById('input-no-surat');

    function getRomawi(bulan) {
        const romawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        return romawi[bulan - 1];
    }

    function generateNomorSuratBerdasarkanTanggal() {
        let tglValue = inputTgl.value;
        if (!tglValue) {
            // Default ke hari ini jika kosong
            const today = new Date();
            tglValue = today.toISOString().split('T')[0]; 
            inputTgl.value = tglValue;
        }

        const dateObj = new Date(tglValue);
        const tahun = dateObj.getFullYear();
        const bulan = dateObj.getMonth() + 1; // 1-12
        const bulanRomawi = getRomawi(bulan);
        
        // TODO: Saat integrasi Firebase, ambil nomor urut terakhir di bulan & tahun ini.
        // Untuk UI mockup, kita asumsikan nomor urut terakhir adalah 1 (sehingga next adalah 2)
        let urutTerakhirDariDB = 1; 
        
        let urutFinal = inputNoUrut.value ? parseInt(inputNoUrut.value) : (urutTerakhirDariDB + 1);
        let urutFormat = urutFinal.toString().padStart(3, '0');

        inputNoSurat.value = `007/DJB-UHO/ASL/${tahun}/${bulanRomawi}/${urutFormat}`;
    }

    inputTgl.addEventListener('change', generateNomorSuratBerdasarkanTanggal);
    inputNoUrut.addEventListener('input', generateNomorSuratBerdasarkanTanggal);

    // B. Conditional Logic Dropdown Pembangunan
    const dropPembangunan = document.getElementById('input-pembangunan-dropdown');
    const teksPembangunan = document.getElementById('input-pembangunan-teks');

    dropPembangunan.addEventListener('change', (e) => {
        if (e.target.value === 'Ya') {
            teksPembangunan.classList.remove('hidden');
            teksPembangunan.required = true;
        } else {
            teksPembangunan.classList.add('hidden');
            teksPembangunan.value = '';
            teksPembangunan.required = false;
        }
    });

    // C. Render Datalist (Autocomplete dari Master Data)
    function renderDatalists() {
        const listBarang = document.getElementById('list-barang');
        const listKaryawan = document.getElementById('list-karyawan');
        
        listBarang.innerHTML = state.masterBarang.map(item => `<option value="${item}">`).join('');
        listKaryawan.innerHTML = state.masterKaryawan.map(item => `<option value="${item}">`).join('');
    }
    renderDatalists(); // Panggil saat inisialisasi awal


    // ==========================================
    // 5. SIMULASI SUBMIT FORM & PROSES GAS
    // ==========================================
    const btnSubmitBast = document.getElementById('btn-submit-bast');
    
    btnSubmitBast.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Validasi dasar (Native HTML5 validation trigger)
        const form = document.getElementById('form-tambah-bast');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Ambil Data
        const noSurat = inputNoSurat.value;
        const jenisAset = document.getElementById('input-jenis-aset').value;
        const namaBarang = document.getElementById('input-nama-barang').value;
        const statusPembangunan = dropPembangunan.value;
        const keteranganPembangunan = teksPembangunan.value || "-";
        const penyerah = document.getElementById('input-penyerah').value;
        const penerima = document.getElementById('input-penerima').value;
        const registerASL = document.getElementById('input-register-asl').value;
        const keterangan = document.getElementById('input-keterangan').value;

        // Tampilkan Modal Loading
        closeModal(modals.tambahBast);
        openModal(modals.loading);

        // ==============================================================
        // TODO (FIREBASE & GAS LOGIC): 
        // 1. Simpan data BAST ke Firestore
        // 2. Cek & simpan Nama Barang/Karyawan baru ke koleksi Master jika belum ada
        // 3. Panggil API endpoint Google Apps Script via fetch() untuk duplicate template Docs
        // ==============================================================
        
        // Simulasi Request API (Delay 2.5 Detik)
        setTimeout(() => {
            // Simulasi Update Master Data Otomatis jika ada entitas baru
            if(!state.masterBarang.includes(namaBarang)) state.masterBarang.push(namaBarang);
            if(!state.masterKaryawan.includes(penyerah)) state.masterKaryawan.push(penyerah);
            if(!state.masterKaryawan.includes(penerima)) state.masterKaryawan.push(penerima);
            renderDatalists();
            renderMasterTables();

            // Simulasi Push Data BAST
            const dataBaru = {
                id: Date.now(),
                tgl: inputTgl.value,
                noSurat: noSurat,
                jenisAset: jenisAset,
                namaBarang: namaBarang,
                pembangunan: statusPembangunan === 'Ya' ? keteranganPembangunan : '-',
                penyerah: penyerah,
                penerima: penerima,
                registerASL: registerASL,
                keterangan: keterangan,
                linkDocs: "https://docs.google.com/spreadsheets/d/mock-link"
            };
            state.bast.unshift(dataBaru);
            renderTableBAST();

            // Simulasi Pemecahan Baris untuk Monitoring Aset (Sesuai PRD)
            const listRegister = registerASL.split('\n').filter(r => r.trim() !== '');
            if (statusPembangunan === 'Ya') {
                // Disatukan dalam 1 baris
                state.aset.unshift({
                    ...dataBaru,
                    registerASL: listRegister.join(', ')
                });
            } else {
                // Dipecah jadi baris terpisah
                listRegister.forEach(reg => {
                    state.aset.unshift({
                        ...dataBaru,
                        registerASL: reg.trim()
                    });
                });
            }
            renderTableAset();

            // Tutup Loading, Buka Sukses
            closeModal(modals.loading);
            document.getElementById('link-lihat-dokumen').href = dataBaru.linkDocs;
            openModal(modals.sukses);

        }, 2500); 
    });


    // ==========================================
    // 6. RENDER TABEL UI (View Layer)
    // ==========================================
    
    function renderTableBAST() {
        const tbody = document.getElementById('tbody-bast');
        tbody.innerHTML = state.bast.map((item, index) => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${index + 1}</td>
                <td class="px-4 py-3">${item.tgl}</td>
                <td class="px-4 py-3 font-medium text-gray-900">${item.noSurat}</td>
                <td class="px-4 py-3">${item.jenisAset}</td>
                <td class="px-4 py-3">${item.namaBarang}</td>
                <td class="px-4 py-3">${item.pembangunan}</td>
                <td class="px-4 py-3">${item.penyerah}</td>
                <td class="px-4 py-3">${item.penerima}</td>
                <td class="px-4 py-3 whitespace-pre-wrap">${item.registerASL}</td>
                <td class="px-4 py-3 truncate max-w-xs">${item.keterangan}</td>
                <td class="px-4 py-3 text-center">
                    <a href="${item.linkDocs}" target="_blank" class="text-green-600 hover:text-green-800 text-lg">
                        <i class="fa-solid fa-file-excel"></i>
                    </a>
                </td>
                <td class="px-4 py-3 text-center">
                    <button class="text-blue-500 hover:text-blue-700 mx-1" onclick="openEditBAST(${item.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-500 hover:text-red-700 mx-1"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function renderMasterTables() {
        document.getElementById('tbody-master-barang').innerHTML = state.masterBarang.map((item, index) => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-2">${index + 1}</td>
                <td class="px-4 py-2">${item}</td>
                <td class="px-4 py-2 text-center"><button class="text-red-500"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');

        document.getElementById('tbody-master-karyawan').innerHTML = state.masterKaryawan.map((item, index) => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-2">${index + 1}</td>
                <td class="px-4 py-2">${item}</td>
                <td class="px-4 py-2 text-center"><button class="text-red-500"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    }

    function renderTableAset() {
        const tbody = document.getElementById('tbody-monitoring-aset');
        tbody.innerHTML = state.aset.map((item, index) => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${index + 1}</td>
                <td class="px-4 py-3 font-medium">${item.penerima}</td>
                <td class="px-4 py-3">${item.jenisAset}</td>
                <td class="px-4 py-3">${item.namaBarang}</td>
                <td class="px-4 py-3">${item.registerASL}</td>
                <td class="px-4 py-3">${item.noSurat}</td>
                <td class="px-4 py-3 text-center">
                    <button class="text-blue-500 mx-1"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-500 mx-1"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // Inisialisasi Render Kosong
    renderTableBAST();
    renderMasterTables();
    renderTableAset();

    // ==========================================
    // 7. FUNGSI GLOBAL (Untuk Event Inline HTML)
    // ==========================================
    // Mengekspos fungsi openEditBAST ke global window agar bisa dipanggil dari renderTableBAST
    window.openEditBAST = function(id) {
        const data = state.bast.find(b => b.id === id);
        if (data) {
            document.getElementById('edit-no-surat').value = data.noSurat;
            document.getElementById('edit-jenis-aset').value = data.jenisAset;
            document.getElementById('edit-nama-barang').value = data.namaBarang;
            document.getElementById('edit-register-asl').value = data.registerASL;
            document.getElementById('edit-penanggung-jawab').value = data.penerima;
            document.getElementById('edit-link-spreadsheet').value = data.linkDocs;
            document.getElementById('edit-keterangan').value = data.keterangan;
            
            openModal(modals.editBast);
        }
    }

});
