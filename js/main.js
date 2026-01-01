let allPosts = []; 
const postsPerPage = 6; 

// 1. HÀM DỌN DẸP ĐƯỜNG DẪN ẢNH
function getCleanPath(rawPath) {
    if (!rawPath) return 'assets/image/anh1.jpg';
    let cleanPath = rawPath;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    
    if (cleanPath.includes('image/')) {
        const parts = cleanPath.split('image/');
        cleanPath = 'assets/image/' + parts[parts.length - 1];
    }
    return cleanPath;
}

// 2. LOAD BÀI VIẾT THEO CATEGORY
async function loadCategoryPosts(categoryName, page = 1) {
    const repoOwner = "Isa2301-os";
    const repoName = "blog-nguoi-am-phu";
    const folderPath = "assets/content";

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
        const files = await response.json();
        if (!Array.isArray(files)) return;

        const jsonFiles = files.filter(f => 
            f.name.endsWith('.json') && 
            f.name !== 'settings.json' && 
            f.name !== 'template-tan-man.json'
        ).reverse();

        allPosts = []; // Làm sạch mảng trước khi nạp bài mới

        // Dùng Promise.all để tải nhiều file cùng lúc (Nhanh hơn)
        const postPromises = jsonFiles.map(file => fetch(file.download_url).then(r => r.json().then(data => ({...data, fileName: file.name}))));
        const results = await Promise.all(postPromises);

        results.forEach(data => {
            if (data.category && data.category.toLowerCase() === categoryName.toLowerCase()) {
                allPosts.push({ 
                    ...data, 
                    image: getCleanPath(data.image)
                });
            }
        });

        displayPosts(page);
        setupPagination(page);

    } catch (error) {
        console.error("Lỗi tải bài viết:", error);
        document.getElementById('post-list-container').innerHTML = "Lỗi tải dữ liệu.";
    }
}

// 3. HIỂN THỊ POLAROID
function displayPosts(page) {
    const container = document.getElementById('post-list-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    paginatedPosts.forEach(post => {
        // CẤU TRÚC CHUẨN ĐỂ KHỚP VỚI CSS POLAROID
        const cardHtml = `
            <a href="post-detail.html?id=${encodeURIComponent(post.fileName)}" class="photo-card-link">
                <div class="photo-card">
                    <div class="polaroid-frame">
                        <img src="${post.image}" alt="${post.title}" onerror="this.src='assets/image/anh1.jpg'">
                    </div>
                    <div class="caption-container">
                        <div class="caption">${post.title}</div>
                        <div class="post-date">${post.date ? post.date.split('T')[0] : ''}</div>
                    </div>
                </div>
            </a>`;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 5. PHÂN TRANG
function setupPagination(currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = "#";
        link.innerText = i;
        link.className = (i === currentPage) ? "page-link active" : "page-link";
        link.onclick = (e) => {
            e.preventDefault();
            displayPosts(i);
            setupPagination(i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        paginationContainer.appendChild(link);
    }
}

// KHỞI CHẠY
document.addEventListener("DOMContentLoaded", () => {
loadCategoryPosts('tan-man'); // Load bài viết sau
});