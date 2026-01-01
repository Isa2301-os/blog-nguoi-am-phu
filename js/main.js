let allPosts = []; 
const postsPerPage = 6; 

// Hàm dọn dẹp đường dẫn ảnh (Xử lý mọi lỗi đường dẫn từ CloudCannon)
function getCleanPath(rawPath) {
    if (!rawPath) return 'assets/image/anh1.jpg'; // Ảnh mặc định nếu bài ko có ảnh
    let cleanPath = rawPath;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    
    // Nếu bị lồng thư mục, chỉ lấy phần từ assets/image trở đi
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

        // Lọc bỏ file hệ thống và file mẫu
        const jsonFiles = files.filter(f => 
            f.name.endsWith('.json') && 
            f.name !== 'settings.json' && 
            f.name !== 'template-tan-man.json'
        ).reverse();

        allPosts = []; // Reset mảng để tránh lặp bài viết
        
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
        document.getElementById('loading').innerText = "Không thể tải bài viết lúc này.";
    }
}

function displayPosts(page) {
    const container = document.getElementById('post-list-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    if (paginatedPosts.length === 0) {
        container.innerHTML = "<p>Chưa có bài viết nào trong mục này.</p>";
        return;
    }

        paginatedPosts.forEach(post => {
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
    const container = document.getElementById('pagination-container');
    if (!container) return;
    container.innerHTML = '';

    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = (i === currentPage) ? "page-link active" : "page-link";
        btn.onclick = () => {
            displayPosts(i);
            setupPagination(i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(btn);
    }
}

    document.addEventListener("DOMContentLoaded", () => {
    loadCategoryPosts('tan-man');
});