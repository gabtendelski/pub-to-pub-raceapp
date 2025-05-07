document.addEventListener('DOMContentLoaded', async function() {
    const upload = document.querySelector('#upload-to-server');
    const positions = document.querySelector('.positions');
    const clear = document.querySelector('.cleardb');

    let db = await getDB();
    await fillPositions();
    

    upload.addEventListener('click', uploadToServer);
    clear.addEventListener('click', clearDB);

    function uploadToServer() {
        console.log('Uploading to server');
        getPositions().then((positionsList) => {
            fetch('/upload-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(positionsList), // Send the positions as JSON
            })
                .then((response) => {
                    if (response.ok) {
                        console.log('Data uploaded successfully.');
                    } else {
                        console.error('Failed to upload data:', response.statusText);
                    }
                })
                .catch((error) => {
                    console.error('Error uploading data:', error);
                });
        });
    }

    async function getDB(){
        return new Promise((resolve, reject) => {
            let request = window.indexedDB.open('positionsDB', 1);
            request.onupgradeneeded = function(event){
                let db = event.target.result;
                if(!db.objectStoreNames.contains('racePositions')) {
                    db.createObjectStore('racePositions', {autoIncrement: true});
                    console.log('created object store');
                }
            };
            request.onsuccess = function(event){
                console.log('opened database');
                resolve(event.target.result);
            };
            request.onerror = function(event){
                console.log('error opening database', event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }

    function getPositions(){
        return new Promise((resolve, reject) => {
            let transaction = db.transaction('racePositions', 'readonly');
            let store = transaction.objectStore('racePositions');
            let request = store.getAll();
    
            request.onsuccess = function(event){
                console.log('got positions', event.target.result);
                resolve(event.target.result);
            }
            request.onerror = function(event){
                console.log('error getting positions', event.target.errorCode);
                reject(event.target.errorCode);
            }
        });
        

    }

    function addPosition(currentTime){
        const posTemplate = document.querySelector('.position-template');
        if(!posTemplate) {
            console.log('no template');
            return;
        }
        const pos = posTemplate.content.cloneNode(true);
        let posTime = pos.querySelector('.posTime');
        let posInRace = pos.querySelector('.posInRace');
        posTime.textContent = setTimer(currentTime);
        posInRace.textContent = positions.children.length;
        positions.appendChild(pos);
    }

    function setTimer(time){
        let hours = Math.floor(time / 3600000);
        let minutes = Math.floor((time % 3600000) / 60000);
        let seconds = Math.floor((time % 60000) / 1000);
        let milliseconds = Math.floor((time / 10) % 100);
        return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + ":" + milliseconds.toString().padStart(2, "0");
    }

    async function fillPositions(){
        getPositions().then(positionsList => {
            positionsList.forEach(pos => {
                addPosition(pos.time);
            });
        });
    }
    
    function clearDB(){
        db.close();

        const request = window.indexedDB.deleteDatabase('positionsDB');
        request.onsuccess = function() {
            console.log('deleted database');
        };

        positions.innerHTML = '';

        const posHeaderTemplate = document.querySelector('.position-header-template');
        const posHeader = posHeaderTemplate.content.cloneNode(true);
        positions.appendChild(posHeader);

        window.location.assign(window.location.href);
    }
});