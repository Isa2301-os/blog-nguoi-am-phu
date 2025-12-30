document.addEventListener("DOMContentLoaded", function() {
    
    async function loadCategoryPosts(categoryName) {
        const repoOwner = "Isa2301-os"; //
        const repoName = "blog-nguoi-am-phu"; //
        const folderPath = "assets/content"; //

        try {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
            const files = await response.json();
            const container = document.querySelector('.grid-container'); //

            if (!container) return;

            for (const file of files) {
                if (file.name.endsWith('.json')) { //
                    const res = await fetch(file.download_url);
                    const data = await res.json();

                    // Lọc theo chuyên mục
                    if (data.category === categoryName) {
                        const cardHtml = `
                            <a href="post-detail.html?id=${file.name}" class="photo-card-link">
                                <div class="photo-card">
                                    <div class="polaroid-frame">
                                        <img src="${data.image}" alt="${data.title}">
                                    </div>
                                    <div class="caption">${data.title.toUpperCase()}</div>
                                </div>
                            </a>`;
                        container.insertAdjacentHTML('beforeend', cardHtml);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải bài viết:", error);
        }
    }

    // Gọi hàm để tải bài viết cho mục Góc Tản Mạn
    loadCategoryPosts('tan-man');
});