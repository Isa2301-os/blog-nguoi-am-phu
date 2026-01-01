// Cấu hình chung để dễ quản lý
const CONFIG = {
    repoOwner: "Isa2301-os",
    repoName: "blog-nguoi-am-phu",
    folderPath: "assets/content",
    defaultImage: "assets/image/anh1.jpg",
    postsPerPage: 6
};

let allPosts = [];

// 1. Hàm dọn dẹp JSON (Tách riêng để dùng chung)
function parseCleanJSON(text) {
    try {
        let cleanText = text.trim();
        // Xử lý lỗi trùng lặp khối { }{ } của CloudCannon
        if (cleanText.includes('}{')) {
            cleanText = cleanText.split('}{')[0] + '}';
        } else if ((cleanText.match(/}/g) || []).length > 1 && !cleanText.startsWith('[')) {
            cleanText = cleanText.substring(0, cleanText.indexOf('}') + 1);
        }
        return JSON.parse(cleanText);
    } catch (e) {
        return null;
    }
}

// 2. Hàm dọn dẹp đường dẫn ảnh
function getCleanPath(rawPath) {
    if (!rawPath) return CONFIG.defaultImage;
    let path = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    if (path.includes('image/')) {
        const parts = path.split('image/');
        return 'assets/image/' + parts[parts.length - 1];
    }
    return path;
}

// 3. Hàm tải bài viết chính
async function loadCategoryPosts(categoryName, page = 1) {
    const container = document.getElementById('post-list-container');
    if (container) container.innerHTML = '<p style="text-align:center;">Đang tải bài viết...</p>';

    try {
        const apiUrl = `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/contents/${CONFIG.folderPath}`;
        const response = await fetch(apiUrl);
        const files = await response.json();

        if (!Array.isArray(files)) throw new Error("API Limit or Path Error");

        // Lọc file JSON hợp lệ (bỏ qua settings và template)
        const validFiles = files.filter(f => 
            f.name.endsWith('.json') && 
            !['settings.json', 'template-tan-man.json'].includes(f.name)
        ).reverse();

        // Tải nội dung bài viết
        const results = await Promise.all(validFiles.map(async (file) => {
            try {
                const res = await fetch(file.download_url);
                const text = await res.text();
                const data = parseCleanJSON(text);
                if (data) return { ...data, fileName: file.name };
            } catch (e) { return null; }
        }));

        // Lọc theo category và chuẩn hóa dữ liệu
        allPosts = results
            .filter(post => post && post.category?.toLowerCase() === categoryName.toLowerCase())
            .map(post => ({
                ...post,
                image: getCleanPath(post.image),
                displayDate: post.date ? post.date.split('T')[0] : "Mới nhất"
            }));

        displayPosts(page);
        setupPagination(page);

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        if (container) container.innerHTML = "<p style='text-align:center;'>Không thể tải dữ liệu bài viết.</p>";
    }
}

// 4. Hiển thị bài viết (Tối ưu chuỗi HTML)
function displayPosts(page) {
    const container = document.getElementById('post-list-container');
    if (!container) return;

    const start = (page - 1) * CONFIG.postsPerPage;
    const paginated = allPosts.slice(start, start + CONFIG.postsPerPage);

    if (paginated.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>Chưa có bài viết nào.</p>";
        return;
    }

    container.innerHTML = paginated.map(post => `
        <a href="post-detail.html?id=${encodeURIComponent(post.fileName)}" class="photo-card-link">
            <div class="photo-card">
                <div class="polaroid-frame">
                    <img src="${post.image}" alt="${post.title}" onerror="this.src='${CONFIG.defaultImage}'">
                </div>
                <div class="caption-container">
                    <div class="caption">${post.title || "Tiêu đề đang cập nhật..."}</div>
                    <div class="post-date">${post.displayDate}</div>
                </div>
            </div>
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
        const btn = document.createElement('button'); // Dùng button tốt hơn thẻ 'a' cho hành động này
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

document.addEventListener("DOMContentLoaded", () => loadCategoryPosts('tan-man'));