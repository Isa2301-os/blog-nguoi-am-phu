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
        // Thêm vào bên trong hàm renderMenu sau khi fetch data thành công
        if (data.home_banner) {
             document.getElementById('main-banner').src = data.home_banner;
         }
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
async function renderMenu() {
    try {
        // Gọi file settings.json từ thư mục assets/content
        const res = await fetch('./assets/content/settings.json');
        if (!res.ok) throw new Error("Không tìm thấy file settings.json");
        
        const data = await res.json();
        const menuContainer = document.getElementById('dynamic-menu');
        
        if (!menuContainer || !data.menu_tree) return;

        let menuHtml = '';
        data.menu_tree.forEach(item => {
            // Tạo mục cha (ví dụ: Thành Nghị)
            menuHtml += `
                <li class="menu-item has-children">
                    <a href="#">${item.parent} <span class="arrow">▼</span></a>
                    <ul class="sub-menu">`;
            
            // Tạo các mục con (ví dụ: Góc Tản Mạn, Phim)
            if (item.children) {
                item.children.forEach(child => {
                    menuHtml += `<li><a href="${child.link}">${child.name}</a></li>`;
                });
            }
            
            menuHtml += `</ul></li>`;
        });
        
        menuContainer.innerHTML = menuHtml;
    } catch (error) {
        console.error("Lỗi hiển thị menu:", error);
    }
}

// Chạy hàm ngay khi trang tải xong
document.addEventListener('DOMContentLoaded', renderMenu);