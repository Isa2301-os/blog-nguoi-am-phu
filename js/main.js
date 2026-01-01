let allPosts = []; 
const postsPerPage = 6; 

// 1. HÀM DỌN DẸP ĐƯỜNG DẪN ẢNH (Giữ nguyên logic của bạn)
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

// 2. LOAD BÀI VIẾT THEO CATEGORY (Đã sửa lỗi dòng 34 và tăng tính chịu lỗi)
async function loadCategoryPosts(categoryName, page = 1) {
    const repoOwner = "Isa2301-os";
    const repoName = "blog-nguoi-am-phu";
    const folderPath = "assets/content";

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
        const files = await response.json();
        
        if (!Array.isArray(files)) {
            console.error("Không tìm thấy danh sách file hoặc API giới hạn.");
            return;
        }

        const jsonFiles = files.filter(f => 
            f.name.endsWith('.json') && 
            f.name !== 'settings.json' && 
            f.name !== 'template-tan-man.json'
        ).reverse();

        allPosts = []; 

        // Tải từng file và kiểm tra JSON hợp lệ
        const postPromises = jsonFiles.map(file => 
            fetch(file.download_url)
                .then(r => r.text()) // Đọc dạng text để tránh crash khi parse JSON lỗi
                .then(text => {
                    try {
                        const data = JSON.parse(text);
                        return { ...data, fileName: file.name };
                    } catch (e) {
                        console.warn(`Bỏ qua file lỗi định dạng JSON: ${file.name}`);
                        return null; // Trả về null nếu file hỏng
                    }
                })
                .catch(err => {
                    console.error(`Lỗi kết nối khi tải file ${file.name}:`, err);
                    return null;
                })
        );

        const results = await Promise.all(postPromises);

        // Lọc bỏ các bài viết null và phân loại theo category
        results.forEach(data => {
            if (data && data.category && data.category.toLowerCase() === categoryName.toLowerCase()) {
                allPosts.push({ 
                    ...data, 
                    image: getCleanPath(data.image)
                });
            }
        });

        displayPosts(page);
        setupPagination(page);

    } catch (error) {
        console.error("Lỗi hệ thống tải bài viết:", error);
        const container = document.getElementById('post-list-container');
        if (container) container.innerHTML = "<p style='text-align:center;'>Không thể kết nối dữ liệu. Vui lòng thử lại sau.</p>";
    }
}

// 3. HIỂN THỊ POLAROID (Đã tối ưu hiển thị an toàn)
function displayPosts(page) {
    const container = document.getElementById('post-list-container');
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    if (paginatedPosts.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>Chưa có bài viết nào trong mục này.</p>";
        return;
    }

    paginatedPosts.forEach(post => {
        // Xử lý ngày tháng an toàn
        let displayDate = "Mới nhất";
        if (post.date) {
            displayDate = post.date.includes('T') ? post.date.split('T')[0] : post.date;
        }

        const safeTitle = post.title || "Tiêu đề đang cập nhật...";
        const safeImage = post.image || 'assets/image/anh1.jpg';
        const safeFileName = post.fileName ? encodeURIComponent(post.fileName) : "";

        const cardHtml = `
            <a href="post-detail.html?id=${safeFileName}" class="photo-card-link">
                <div class="photo-card">
                    <div class="polaroid-frame">
                        <img src="${safeImage}" alt="${safeTitle}" onerror="this.src='assets/image/anh1.jpg'">
                    </div>
                    <div class="caption-container">
                        <div class="caption">${safeTitle}</div>
                        <div class="post-date">${displayDate}</div>
                    </div>
                </div>
            </a>`;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 4. PHÂN TRANG (Giữ nguyên)
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
    // Tự động lấy category từ tiêu đề trang hoặc mặc định là 'tan-man'
    loadCategoryPosts('tan-man'); 
});