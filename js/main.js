let allPosts = []; 
const postsPerPage = 6; 

// 1. HÀM DỌN DẸP ĐƯỜNG DẪN ẢNH (Quan trọng nhất để fix lỗi ảnh)
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

async function loadCategoryPosts(categoryName, page = 1) {
    const repoOwner = "Isa2301-os";
    const repoName = "blog-nguoi-am-phu";
    const folderPath = "assets/content";

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
        const files = await response.json();
        
        if (!Array.isArray(files)) return;

        // Lọc bỏ file hệ thống và bài viết mẫu để làm sạch danh sách
        const jsonFiles = files.filter(f => 
            f.name.endsWith('.json') && 
            f.name !== 'settings.json' && 
            f.name !== 'template-tan-man.json'
        ).reverse();

        allPosts = []; 
        
        for (const file of jsonFiles) {
            const res = await fetch(file.download_url);
            const data = await res.json();
            
            if (data.category && data.category.toLowerCase() === categoryName.toLowerCase()) {
                allPosts.push({ 
                    ...data, 
                    image: getCleanPath(data.image), 
                    fileName: file.name 
                });
            }
        }

        displayPosts(page);
        setupPagination(page);

    } catch (error) {
        console.error("Lỗi tải bài viết:", error);
    }
}

// 2. HÀM HIỂN THỊ VỚI CẤU TRÚC CSS POLAROID
function displayPosts(page) {
    const container = document.querySelector('.grid-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    paginatedPosts.forEach(post => {
        // Cấu trúc HTML này phải khớp 100% với file CSS của bạn
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

function setupPagination(currentPage) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = "#";
        link.innerText = i;
        link.className = (i === currentPage) ? "page-link active" : "page-link";
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            displayPosts(i);
            setupPagination(i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(link);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCategoryPosts('tan-man');
});