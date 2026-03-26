const notesMaster = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoRange = []; 
for(let oct=2; oct<=6; oct++) {
    notesMaster.forEach(n => pianoRange.push(n + oct));
}

// ピアノ音源読み込み
const piano = new Tone.Sampler({
    urls: { A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", A5: "A5.mp3", C6: "C6.mp3" },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
        const status = document.getElementById('loading-status');
        status.innerText = "READY";
        setTimeout(() => status.style.display = 'none', 1500);
    }
}).toDestination();

// 鍵盤生成
const pianoEl = document.getElementById('piano');
pianoRange.forEach(note => {
    const isBlack = note.includes('#');
    const div = document.createElement('div');
    div.id = `note-${note.replace('#', 's')}`;
    div.className = `key ${isBlack ? 'black-key' : 'white-key'}`;
    if(note.startsWith('C')) div.innerHTML = `<span>${note}</span>`;
    div.onmousedown = () => playSingleNote(note);
    pianoEl.appendChild(div);
});

function playSingleNote(note) {
    if (Tone.context.state !== 'running') Tone.start();
    piano.triggerAttackRelease(note, "2n");
    lightKey(note, 'active');
}

function lightKey(note, className) {
    const el = document.getElementById(`note-${note.replace('#', 's')}`);
    if (el) {
        el.classList.add(className);
        setTimeout(() => el.classList.remove(className), 400);
    }
}

function updateProject() {
    const root = document.getElementById('key-select').value;
    const rootIdx = notesMaster.indexOf(root);
    const intervals = [0, 2, 4, 5, 7, 9, 11];
    const baseOctave = rootIdx <= 7 ? 3 : 2;
    const container = document.getElementById('chord-container');
    container.innerHTML = "";

    for (let i = 0; i < 8; i++) {
        const btn = document.createElement('button');
        btn.className = "chord-btn";
        btn.id = `chord-btn-${i}`;
        
        const baseNoteIdx = (rootIdx + intervals[i % 7]) % 12;
        const baseName = notesMaster[baseNoteIdx];
        const type = i === 7 ? "" : ([1,2,5].includes(i) ? "m" : (i===6 ? "dim" : ""));
        const roman = i === 7 ? "I" : ["I", "ii", "iii", "IV", "V", "vi", "vii°"][i];
        
        btn.innerHTML = `<span class="chord-name">${baseName}${type}</span><span class="roman">${roman}</span>`;
        
        btn.onclick = () => {
            if (Tone.context.state !== 'running') Tone.start();
            btn.classList.add('active-press');
            setTimeout(() => btn.classList.remove('active-press'), 300);

            const chordNotes = [];
            const octaveOffset = i === 7 ? baseOctave + 1 : baseOctave;
            const startIdx = i % 7;

            [0, 2, 4].forEach(step => {
                const stepIdx = startIdx + step;
                const totalInterval = intervals[stepIdx % 7] + (Math.floor(stepIdx / 7) * 12);
                const finalIdx = (rootIdx + totalInterval);
                chordNotes.push(notesMaster[finalIdx % 12] + (octaveOffset + Math.floor(finalIdx / 12)));
            });
            
            piano.triggerAttackRelease(chordNotes, "1n");
            chordNotes.forEach(n => lightKey(n, 'chord-active'));
        };
        container.appendChild(btn);
    }
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key >= '1' && key <= '8') {
        const btn = document.getElementById(`chord-btn-${parseInt(key) - 1}`);
        if (btn) btn.click();
    }
    const melodyMap = { 'a':'C3','w':'C#3','s':'D3','e':'D#3','d':'E3','f':'F3','t':'F#3','g':'G3','y':'G#3','h':'A3','u':'A#3','j':'B3','k':'C4' };
    const note = melodyMap[key];
    if (note) playSingleNote(note);
});

document.getElementById('key-select').onchange = updateProject;
updateProject();