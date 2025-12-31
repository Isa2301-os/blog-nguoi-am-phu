let allPosts = []; 
const postsPerPage = 5; 

async function loadCategoryPosts(categoryName, page = 1) {
    const repoOwner = "Isa2301-os";
    const repoName = "blog-nguoi-am-phu";
    const folderPath = "assets/content";

    try {
        if (allPosts.length === 0) {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
            const files = await response.json();
            
            // Kiểm tra nếu là mảng dữ liệu hợp lệ
            if (!Array.isArray(files)) return;

            const jsonFiles = files.filter(f => f.name.endsWith('.json')).reverse();
            
            for (const file of jsonFiles) {
                const res = await fetch(file.download_url);
                const data = await res.json();
                
                // So sánh category không phân biệt chữ hoa chữ thường
                if (data.category && data.category.toLowerCase() === categoryName.toLowerCase()) {
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
    if (!container) return;
    container.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    paginatedPosts.forEach(post => {
        // Lưu ý: post.title.toUpperCase() sẽ làm tiêu đề viết hoa hết
        const cardHtml = `
            <a href="post-detail.html?id=${post.fileName}" class="photo-card-link">
                <div class="photo-card">
                    <div class="polaroid-frame">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    <div class="caption-container">
                        <div class="caption">${post.title}</div>
                        <div class="post-date">${post.date || ''}</div>
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
    if (totalPages <= 1) return; // Không hiện phân trang nếu chỉ có 1 trang

    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = "#";
        link.innerText = i;
        link.className = (i === currentPage) ? "page-link active" : "page-link";
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            displayPosts(i);
            setupPagination(i);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt lên đầu
        });
        
        paginationContainer.appendChild(link);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Tự động nhận diện category dựa trên tên file HTML hoặc mặc định 'tan-man'
    loadCategoryPosts('tan-man');
});