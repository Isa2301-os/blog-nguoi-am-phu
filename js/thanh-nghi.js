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