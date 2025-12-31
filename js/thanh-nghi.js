function switchTab(fileName, element) {
    const contentDiv = document.getElementById("dynamic-content");
    const tabs = document.querySelectorAll(".tab-btn");

    // Xóa trạng thái active của các tab cũ
    tabs.forEach(tab => tab.classList.remove("active"));
    // Thêm active cho tab vừa nhấn
    element.classList.add("active");

    // Hiệu ứng mờ dần khi chuyển
    contentDiv.style.opacity = 0;

    // Tải file HTML con
    fetch(fileName)
        .then(response => {
            if (!response.ok) throw new Error("Không tìm thấy file " + fileName);
            return response.text();
        })
        .then(data => {
            setTimeout(() => {
                contentDiv.innerHTML = data;
                contentDiv.style.opacity = 1;
            }, 300);
        })
        .catch(error => {
            contentDiv.innerHTML = "<p>Nội dung đang được cập nhật...</p>";
            contentDiv.style.opacity = 1;
            console.error(error);
        });
}

// Tự động load tab Tiểu Sử khi vừa vào trang
window.onload = () => {
    const firstTab = document.querySelector(".tab-btn");
    if(firstTab) switchTab('tieu-su.html', firstTab);
};
async function renderMenu() {
    try {
        // 1. Lấy dữ liệu từ file settings.json bạn vừa tạo
        const response = await fetch('assets/content/settings.json');
        const data = await response.json();
        const menuContainer = document.getElementById('dynamic-menu');

        if (!menuContainer || !data.menu_tree) return;

        menuContainer.innerHTML = ''; // Xóa trắng menu cũ nếu có

        // 2. Duyệt qua các mục menu cha (như Thành Nghị, Cộng Đồng)
        data.menu_tree.forEach(parentItem => {
            const li = document.createElement('li');
            li.className = 'menu-parent';
            
            let html = `<a href="#">${parentItem.parent} <span class="arrow">▼</span></a>`;
            
            // 3. Nếu có các trang con, tạo danh sách ul con
            if (parentItem.children && parentItem.children.length > 0) {
                html += `<ul class="sub-menu">`;
                parentItem.children.forEach(child => {
                    html += `<li><a href="${child.link}">${child.name}</a></li>`;
                });
                html += `</ul>`;
            }

            li.innerHTML = html;
            menuContainer.appendChild(li);
        });
    } catch (error) {
        console.error("Không thể tải menu:", error);
    }
}

// Gọi hàm khi trang web tải xong
document.addEventListener('DOMContentLoaded', renderMenu);