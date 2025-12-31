let allPosts = []; // Lưu trữ toàn bộ bài viết sau khi lấy về
const postsPerPage = 5; // Số bài mỗi trang

async function loadCategoryPosts(categoryName, page = 1) {
    const repoOwner = "Isa2301-os";
    const repoName = "blog-nguoi-am-phu";
    const folderPath = "assets/content";

    try {
        // Chỉ fetch dữ liệu từ GitHub ở lần đầu tiên
        if (allPosts.length === 0) {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
            const files = await response.json();
            
            // Lọc chỉ lấy file .json và đảo ngược để bài mới lên đầu
            const jsonFiles = files.filter(f => f.name.endsWith('.json')).reverse();
            
            // Lấy nội dung chi tiết của từng file
            for (const file of jsonFiles) {
                const res = await fetch(file.download_url);
                const data = await res.json();
                if (data.category === categoryName) {
                    allPosts.push({ ...data, fileName: file.name });
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
    container.innerHTML = '';

    // Tính toán vị trí bài viết bắt đầu và kết thúc của trang hiện tại
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    paginatedPosts.forEach(post => {
        const cardHtml = `
            <a href="post-detail.html?id=${post.fileName}" class="photo-card-link">
                <div class="photo-card">
                    <div class="polaroid-frame">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    <div class="caption-container">
                        <div class="caption">${post.title.toUpperCase()}</div>
                        <div class="post-date">${post.date || ''}</div>
                    </div>
                </div>
            </a>`;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function setupPagination(currentPage) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(allPosts.length / postsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = "#";
        link.innerText = i;
        link.className = (i === currentPage) ? "page-link active" : "page-link";
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            displayPosts(i);
            setupPagination(i);
            window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
        });
        
        paginationContainer.appendChild(link);
    }
}

// Gọi hàm khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
    loadCategoryPosts('tan-man');
});