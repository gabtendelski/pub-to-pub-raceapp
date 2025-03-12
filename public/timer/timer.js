document.addEventListener('DOMContentLoaded', function() {
    const start = document.querySelector('#start');
    const stop = document.querySelector('#stop');
    const timer = document.querySelector('#timer');
    const positions = document.querySelector('#positions');

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

    function addPosition(currentTime){
        const posTemplate = document.querySelector('#position-template');
        const pos = posTemplate.content.cloneNode(true);
        let posTime = pos.querySelector('.posTime');
        let posInRace = pos.querySelector('.posInRace');
        posTime.textContent = setTimer(currentTime);
        posInRace.textContent = positions.children.length;
        positions.appendChild(pos);
    }
});