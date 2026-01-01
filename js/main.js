// Cấu hình chung
const CONFIG = {
    repoOwner: "Isa2301-os",
    repoName: "blog-nguoi-am-phu",
    folderPath: "assets/content",
    defaultImage: "assets/image/anh1.jpg",
    postsPerPage: 6
};

let allPosts = [];

// 1. Hàm dọn dẹp JSON
function parseCleanJSON(text) {
    try {
        let cleanText = text.trim();
        if (cleanText.includes('}{')) {
            cleanText = cleanText.split('}{')[0] + '}';
        } else if ((cleanText.match(/}/g) || []).length > 1 && !cleanText.startsWith('[')) {
            cleanText = cleanText.substring(0, cleanText.indexOf('}') + 1);
        }
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Lỗi cấu trúc file JSON:", e);
        return null;
    }
}

// 2. Hàm dọn dẹp đường dẫn ảnh (Đã sửa để khớp với thư mục assets/image)
function getCleanPath(rawPath) {
    if (!rawPath) return CONFIG.defaultImage;
    
    // Nếu đường dẫn bắt đầu bằng /, loại bỏ nó
    let path = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    
    // Nếu đường dẫn chứa 'image/', đảm bảo nó trỏ đúng vào assets/image/
    if (path.includes('image/')) {
        const parts = path.split('image/');
        return 'assets/image/' + parts[parts.length - 1];
    }
    
    // Nếu là đường dẫn tương đối từ content (ví dụ: ../image/abc.jpg)
    if (path.includes('../')) {
        return path.replace('../', 'assets/');
    }

    return path;
}

// 3. Hàm tải bài viết chính
async function loadCategoryPosts(categoryName, page = 1) {
    const container = document.getElementById('post-list-container');
    // Không xóa container ngay để giữ hiệu ứng loading tốt hơn
    
    try {
        const apiUrl = `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/contents/${CONFIG.folderPath}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("Không thể kết nối với GitHub API");
        
        const files = await response.json();

        if (!Array.isArray(files)) throw new Error("Dữ liệu trả về không hợp lệ");

        const validFiles = files.filter(f => 
            f.name.endsWith('.json') && 
            !['settings.json', 'template-tan-man.json'].includes(f.name)
        ).reverse();

        const results = await Promise.all(validFiles.map(async (file) => {
            try {
                const res = await fetch(file.download_url);
                const text = await res.text();
                const data = parseCleanJSON(text);
                // Gán fileName để làm ID cho trang chi tiết
                if (data) return { ...data, fileName: file.name };
            } catch (e) { return null; }
        }));

        // Lọc bài viết theo category (không phân biệt hoa thường)
        allPosts = results
            .filter(post => {
                if (!post || !post.category) return false;
                // Hỗ trợ cả trường hợp category là mảng hoặc chuỗi
                const cat = Array.isArray(post.category) ? post.category[0] : post.category;
                return cat.toLowerCase().trim() === categoryName.toLowerCase().trim();
            })
            .map(post => ({
                ...post,
                image: getCleanPath(post.image),
                displayDate: post.date ? post.date.split('T')[0] : "01-01-2026"
            }));

        displayPosts(page);
        setupPagination(page);

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        if (container) container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:red;">Lỗi: ${error.message}</div>`;
    }
}

// 4. Hiển thị bài viết (Cấu trúc chuẩn Polaroid)
function displayPosts(page) {
    const container = document.getElementById('post-list-container');
    if (!container) return;

    const start = (page - 1) * CONFIG.postsPerPage;
    const paginated = allPosts.slice(start, start + CONFIG.postsPerPage);

    if (allPosts.length === 0) {
        container.innerHTML = "<div style='grid-column: 1/-1; text-align:center;'>Chưa có bài viết nào trong mục này.</div>";
        return;
    }

    container.innerHTML = paginated.map(post => `
        <a href="post-detail.html?id=${encodeURIComponent(post.fileName)}" class="photo-card-link">
            <article class="photo-card">
                <div class="polaroid-frame">
                    <img src="${post.image}" 
                         alt="${post.title}" 
                         loading="lazy"
                         onerror="this.onerror=null; this.src='${CONFIG.defaultImage}';">
                </div>
                <div class="caption-container">
                    <h2 class="caption">${post.title || "Tiêu đề đang cập nhật..."}</h2>
                    <div class="post-date">${post.displayDate}</div>
                </div>
            </article>
        </a>
    `).join('');
}

// 5. Phân trang
function setupPagination(currentPage) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    container.innerHTML = '';

    const totalPages = Math.ceil(allPosts.length / CONFIG.postsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = (i === currentPage) ? "page-link active" : "page-link";
        btn.setAttribute('aria-label', `Trang ${i}`);
        btn.onclick = () => {
            displayPosts(i);
            setupPagination(i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(btn);
    }
}

// Khởi chạy khi trang sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    // Gọi đúng category mà bạn đã đặt trong file JSON
    loadCategoryPosts('tan-man'); 
});