document.addEventListener('DOMContentLoaded', async function() {
    const start = document.querySelector('#start');
    const stop = document.querySelector('#stop');
    const timer = document.querySelector('#timer');
    const positions = document.querySelector('#positions');

    const db = await new Promise((resolve, reject) => {
        const request = window.indexedDB.open('positionsDB', 1);
        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            if(!db.objectStoreNames.contains('racePositions')) {
                db.createObjectStore('racePositions', {autoIncrement: true});
                console.log('created object store');
            }
        };
        request.onsuccess = function(event) {
            console.log('opened database');
            resolve(event.target.result);
        };
        request.onerror = function(event) {
            console.log('error opening database', event.target.errorCode);
            reject(event.target.errorCode);
        };
    });

    let isRunning = false;
    let startTime = 0;
    let time = 0;


    start.addEventListener('click', startTimer);
    stop.addEventListener('click', stopTimer);



    function startTimer() {
        console.log('started timer');
        if(!isRunning) { 
            startTime = performance.now(); 
            isRunning = true;
        } else {
            addPosition(performance.now() - startTime);
        }
        updateTimer();
    }

    function stopTimer(){
        console.log('stopped timer');
        isRunning = false;
    }

    function updateTimer() {
        if(!isRunning) {
            return;
        }
        time = performance.now() - startTime;
        timer.textContent = setTimer(time);
        setTimeout(updateTimer, 10);
    }

    function setTimer(time){
        let hours = Math.floor(time / 3600000);
        let minutes = Math.floor((time % 3600000) / 60000);
        let seconds = Math.floor((time % 60000) / 1000);
        let milliseconds = Math.floor((time / 10) % 100);
        return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + ":" + milliseconds.toString().padStart(2, "0");
    }


    function getPositions(){
        let transaction = db.transaction('racePositions', 'readonly');
        let store = transaction.objectStore('racePositions');
        let request = store.getAll();

        request.onsuccess = function(event){
            console.log('got positions', event.target.result);
        }
        request.onerror = function(event){
            console.log('error getting positions', event.target.errorCode);
        }
    }

    function isDatabaseEmpty(){
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('racePositions', 'readonly');
            const store = transaction.objectStore('racePositions');
            const request = store.count();
            request.onsuccess = function(event){
                resolve(event.target.result.length === 0);
            }
            request.onerror = function(event){
                reject(event.target.errorCode);
            }
        });
    }
    

    function addPosition(currentTime){
        const posTemplate = document.querySelector('#position-template');
        const pos = posTemplate.content.cloneNode(true);
        let posTime = pos.querySelector('.posTime');
        let posInRace = pos.querySelector('.posInRace');
        posTime.textContent = setTimer(currentTime);
        posInRace.textContent = positions.children.length;
        positions.appendChild(pos);


        let transaction = db.transaction('racePositions', 'readwrite');
        let store = transaction.objectStore('racePositions');
        let request = store.add({time: currentTime});
        request.onsuccess = function(){
            console.log('added position to database', request.result);
        }
        request.onerror = function(event){
            console.log('error adding position to database', event.target.errorCode);
        }

        getPositions();
        //console.log(isDatabaseEmpty());
    }


});