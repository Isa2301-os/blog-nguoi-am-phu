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
// --- PHẦN 1: XỬ LÝ CHUYỂN TAB (Dành cho trang tieu-su.html nếu có) ---
function switchTab(fileName, element) {
    const contentDiv = document.getElementById("dynamic-content");
    const tabs = document.querySelectorAll(".tab-btn");

    if (!contentDiv) return;

    tabs.forEach(tab => tab.classList.remove("active"));
    element.classList.add("active");

    contentDiv.style.opacity = 0;

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

// --- PHẦN 2: TỰ ĐỘNG LOAD MENU TỪ JSON ---
async function renderMenu() {
    try {
        // Gọi file settings.json - dùng dấu ./ để an toàn trên GitHub Pages
        const res = await fetch('./assets/content/settings.json');
        if (!res.ok) throw new Error("Không tìm thấy file settings.json");
        
        const data = await res.json();
        const menuContainer = document.getElementById('dynamic-menu');
        
        // Kiểm tra đúng tên thuộc tính trong JSON (ở đây là data.menu)
        const menuData = data.menu || data.menu_tree; 
        if (!menuContainer || !menuData) return;

        // Cập nhật Banner nếu có
        if (data.home_banner && document.getElementById('main-banner')) {
            document.getElementById('main-banner').src = data.home_banner;
        }

        let menuHtml = '';
        menuData.forEach(item => {
            // Sửa lỗi dấu "/" ở đầu link
            const mainLink = item.link ? (item.link.startsWith('/') ? item.link.substring(1) : item.link) : "#";
            const name = item.name || item.parent;

            if (item.sub_menu || item.children) {
                const children = item.sub_menu || item.children;
                menuHtml += `
                    <li class="menu-item has-children">
                        <a href="${mainLink}">${name} <span class="arrow">▼</span></a>
                        <ul class="sub-menu">`;
                
                children.forEach(child => {
                    const childLink = child.link.startsWith('/') ? child.link.substring(1) : child.link;
                    menuHtml += `<li><a href="${childLink}">${child.name}</a></li>`;
                });
                
                menuHtml += `</ul></li>`;
            } else {
                menuHtml += `<li class="menu-item"><a href="${mainLink}">${name}</a></li>`;
            }
        });
        
        menuContainer.innerHTML = menuHtml;
    } catch (error) {
        console.error("Lỗi hiển thị menu:", error);
    }
}

// --- PHẦN 3: KHỞI TẠO KHI TRANG LOAD XONG ---
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();

    // Nếu trang có tab-btn thì load tab đầu tiên
    const firstTab = document.querySelector(".tab-btn");
    if(firstTab) switchTab('tieu-su.html', firstTab);
});