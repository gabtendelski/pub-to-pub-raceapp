document.addEventListener('DOMContentLoaded', async function() {
    const start = document.querySelector('#start');
    const stop = document.querySelector('#stop');
    const timer = document.querySelector('#timer');
    const positions = document.querySelector('.positions');
    const clear = document.querySelector('.cleardb');

    const db = await createDB();

    await fillPositions();

    let isRunning = false;
    let startTime = 0;
    let time = 0;


    start.addEventListener('click', startTimer);
    stop.addEventListener('click', stopTimer);
    clear.addEventListener('click', clearDB);



    function startTimer() {
        if(!isRunning) { 
            console.log('started timer');
            if(timer.textContent === '00:00:00:00') {
                startTime = performance.now(); 
            } else {
                startTime = performance.now() - time;
            }
            isRunning = true;
            start.textContent = 'Lap';
            stop.textContent = 'Stop';
        } else {
            addPosition(performance.now() - startTime);
            addPositionToDB(performance.now() - startTime);

        }
        updateTimer();
    }

    function stopTimer(){
        if(isRunning) {
            console.log('stopped timer');
            isRunning = false;
            stop.textContent = 'Restart';
            start.textContent = 'Start';
        } else if(!isRunning && stop.textContent === 'Restart') {
            console.log('timer restarted');
            startTime = performance.now(); 
            isRunning = true;
            stop.textContent = 'Stop';
            start.textContent = 'Lap';
            updateTimer();
        }

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


    async function createDB(){
        return new Promise((resolve, reject) => {
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
        const pos = posTemplate.content.cloneNode(true);
        let posTime = pos.querySelector('.posTime');
        let posInRace = pos.querySelector('.posInRace');
        posTime.textContent = setTimer(currentTime);
        posInRace.textContent = positions.children.length;
        positions.appendChild(pos);
    }

    function addPositionToDB(currentTime){
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
    }

    async function fillPositions(){
        getPositions().then(positionsList => {
            positionsList.forEach(pos => {
                addPosition(pos.time);
            });
        });
    }


    function clearDB(){ //needs work, deletes data, but requires a reload
        //loop thru db and delete all records 
        //let request = db.transaction('racePositions', 'readwrite').objectStore('racePositions').delete(item);
        createDB();
        positions.innerHTML = '';

        const posHeaderTemplate = document.querySelector('.position-header-template');
        const posHeader = posHeaderTemplate.content.cloneNode(true);
        positions.appendChild(posHeader);
    }
});