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
});