const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
    btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.assign('../login/login.html');
    });
}