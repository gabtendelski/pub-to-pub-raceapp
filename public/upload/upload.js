document.addEventListener('DOMContentLoaded', function() {
    const upload = document.querySelector('#upload-to-server');

    upload.addEventListener('click', uploadToServer);

    function uploadToServer() {
        console.log('uploading to server');
    }

});