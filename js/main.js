document.addEventListener("DOMContentLoaded", function() {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = ''; 

    // postData lấy từ file post.js đã nhúng ở trên
    postData.forEach(post => {
        const postHTML = `
            <div class="post-item">
                <a href="${post.link}" style="text-decoration: none; color: inherit;">
                    <img src="${post.image}" alt="${post.title}">
                    <p>${post.title}</p>
                </a>
            </div>
        `;
        postContainer.innerHTML += postHTML;
    });
    async function loadCategoryPosts(categoryName) {
  const repoOwner = "Isa2301-os";
  const repoName = "blog-nguoi-am-phu";
  const folderPath = "assets/content"; // Thư mục chứa bài viết

  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
    const files = await response.json();
    const container = document.querySelector('.grid-container');

    for (const file of files) {
      if (file.name.endsWith('.json')) {
        const res = await fetch(file.download_url);
        const data = await res.json();

        // LỌC THEO CHUYÊN MỤC
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
  } catch (error) { console.error("Lỗi tải bài:", error); }
}

// Gọi hàm này trong trang goc-tan-man.html
// loadCategoryPosts('tan-man');
});