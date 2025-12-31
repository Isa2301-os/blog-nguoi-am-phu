let allPosts = []; 
const postsPerPage = 6; // Thay đổi số lượng bài viết mỗi trang tùy ý

async function loadCategoryPosts(categoryName, page = 1) {
    const repoOwner = "Isa2301-os";
    const repoName = "blog-nguoi-am-phu";
    const folderPath = "assets/content";

    try {
        if (allPosts.length === 0) {
            // Sử dụng fetch trực tiếp thay vì GitHub API để tránh rate limit nếu có thể, 
            // nhưng vì bạn cần liệt kê file nên giữ GitHub API là hợp lý.
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
            const files = await response.json();
            
    if (!Array.isArray(files)) return;

            // 1. LỌC BỎ FILE SETTINGS VÀ TEMPLATE NGAY TẠI ĐÂY
            const jsonFiles = files.filter(f => 
                f.name.endsWith('.json') && 
                f.name !== 'settings.json' && 
                f.name !== 'template-tan-man.json'
            ).reverse();
            
            for (const file of jsonFiles) {
                const res = await fetch(file.download_url);
                const data = await res.json();
                
            if (data.category && data.category.toLowerCase() === categoryName.toLowerCase()) {
                    // 2. FIX ĐƯỜNG DẪN ẢNH TRƯỚC KHI PUSH VÀO MẢNG
                    let fixedImage = data.image || '';
                    if (fixedImage.startsWith('/')) fixedImage = fixedImage.substring(1);
                    
                    // Xử lý lỗi lồng thư mục assets/content/assets/...
                    if (fixedImage.includes('image/')) {
                        const parts = fixedImage.split('image/');
                        fixedImage = 'assets/image/' + parts[parts.length - 1];
                    }

                    allPosts.push({ ...data, image: fixedImage, fileName: file.name });
                }
            }
        }

        displayPosts(page);
        setupPagination(page);

    } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
    }
}

function displayPosts(page) {
    const container = document.querySelector('.grid-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    paginatedPosts.forEach(post => {
        // Tên file đã bao gồm .json, cần encode để an toàn cho URL
        const postDetailUrl = `post-detail.html?id=${encodeURIComponent(post.fileName)}`;
        
        const cardHtml = `
            <a href="${postDetailUrl}" class="photo-card-link">
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