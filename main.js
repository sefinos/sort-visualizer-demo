function recordBubbleSort(inputArray) {
    const array = [...inputArray]; // never mutate the original
    const steps = [];

    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {

            // record a "compare" step
            steps.push({
                type: 'compare',
                indices: [j, j + 1],
                array: [...array]
            });

            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];

                // record a "swap" step
                steps.push({
                    type: 'swap',
                    indices: [j, j + 1],
                    array: [...array]
                });
            }
        }
        // mark the last unsorted element as sorted after each pass
        steps.push({
            type: 'sorted',
            indices: [array.length - i - 1],
            array: [...array]
        });
    }

    steps.push({ type: 'done', indices: [], array: [...array] });
    return steps;
}

function recordInsertionSort(inputArray) {
    const array = [...inputArray];
    const steps = [];

    for (let i = 1; i < array.length; i++) {
        let j = i;

        // compare current element against the sorted portion to its left
        while (j > 0) {
            steps.push({
                type: 'compare',
                indices: [j - 1, j],
                array: [...array]
            });

            if (array[j - 1] > array[j]) {
                [array[j - 1], array[j]] = [array[j], array[j - 1]];

                steps.push({
                    type: 'swap',
                    indices: [j - 1, j],
                    array: [...array]
                });

                j--;
            } else {
                break; // element found its spot
            }
        }
    }

    // everything is sorted at the end — mark all indices
    steps.push({
        type: 'sorted',
        indices: array.map((_, index) => index),
        array: [...array]
    });
    steps.push({ type: 'done', indices: [], array: [...array] });

    return steps;
}

function recordSelectionSort(inputArray) {
    const array = [...inputArray];
    const steps = [];

    for (let i = 0; i < array.length - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < array.length; j++) {
            steps.push({
                type: 'compare',
                indices: [minIndex, j],
                array: [...array]
            });

            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];

            steps.push({
                type: 'swap',
                indices: [i, minIndex],
                array: [...array]
            });
        }

        steps.push({
            type: 'sorted',
            indices: [i],
            array: [...array]
        });
    }

    steps.push({
        type: 'sorted',
        indices: [array.length - 1],
        array: [...array]
    });
    steps.push({ type: 'done', indices: [], array: [...array] });

    return steps;
}

function recordMergeSort(inputArray) {
    const array = [...inputArray];
    const steps = [];

    function merge(left, mid, right) {
        const leftPart = array.slice(left, mid + 1);
        const rightPart = array.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftPart.length && j < rightPart.length) {
            steps.push({
                type: 'compare',
                indices: [left + i, mid + 1 + j],
                array: [...array]
            });

            if (leftPart[i] <= rightPart[j]) {
                array[k] = leftPart[i];
                i++;
            } else {
                array[k] = rightPart[j];
                j++;
            }

            steps.push({
                type: 'swap', // a value was written into place
                indices: [k],
                array: [...array]
            });
            k++;
        }

        while (i < leftPart.length) {
            array[k] = leftPart[i];
            steps.push({ type: 'swap', indices: [k], array: [...array] });
            i++; k++;
        }

        while (j < rightPart.length) {
            array[k] = rightPart[j];
            steps.push({ type: 'swap', indices: [k], array: [...array] });
            j++; k++;
        }
    }

    function sort(left, right) {
        if (left >= right) return;
        const mid = Math.floor((left + right) / 2);
        sort(left, mid);
        sort(mid + 1, right);
        merge(left, mid, right);
    }

    sort(0, array.length - 1);

    steps.push({
        type: 'sorted',
        indices: array.map((_, index) => index),
        array: [...array]
    });
    steps.push({ type: 'done', indices: [], array: [...array] });

    return steps;
}

function recordQuickSort(inputArray) {
    const array = [...inputArray];
    const steps = [];

    function partition(low, high) {
        const pivot = array[high]; // last element as pivot
        let i = low - 1;

        for (let j = low; j < high; j++) {
            steps.push({
                type: 'compare',
                indices: [j, high], // comparing against the pivot
                array: [...array]
            });

            if (array[j] < pivot) {
                i++;
                [array[i], array[j]] = [array[j], array[i]];
                steps.push({
                    type: 'swap',
                    indices: [i, j],
                    array: [...array]
                });
            }
        }

        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        steps.push({
            type: 'swap',
            indices: [i + 1, high],
            array: [...array]
        });

        steps.push({
            type: 'sorted', // pivot has landed in its final position
            indices: [i + 1],
            array: [...array]
        });

        return i + 1;
    }

    function sort(low, high) {
        if (low >= high) {
            if (low === high) {
                steps.push({ type: 'sorted', indices: [low], array: [...array] });
            }
            return;
        }
        const pivotIndex = partition(low, high);
        sort(low, pivotIndex - 1);
        sort(pivotIndex + 1, high);
    }

    sort(0, array.length - 1);

    steps.push({ type: 'done', indices: [], array: [...array] });
    return steps;
}

/* ==========================================================================
   Rendering
   ========================================================================== */
function renderBars(array, highlightIndices = [], highlightType = '', sortedIndices = []) {
    const container = document.getElementById("bar-container");
    container.innerHTML = '';

    const maxValue = Math.max(...array);
    const sortedSet = new Set(sortedIndices);

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');

        // Sorted state is cumulative — once a bar is placed, it stays green
        // for the rest of playback, regardless of what happens elsewhere.
        if (sortedSet.has(index)) {
            bar.classList.add('sorted');
        }

        // Compare/swap highlighting overlays on top for just this one frame.
        if (highlightType && (highlightType === 'compare' || highlightType === 'swap') && highlightIndices.includes(index)) {
            bar.classList.add(highlightType);
        }

        bar.style.height = `${(value / maxValue) * 100}%`;
        container.appendChild(bar);
    });
}

/* ==========================================================================
   Algorithm registry
   Each entry pairs a recorder with the metadata the status bar displays.
   Adding algorithm #6 later only means adding one entry here + one tab.
   ========================================================================== */
const ALGORITHMS = {
    bubble:    { label: 'bubbleSort.js',    recorder: recordBubbleSort,    complexity: 'O(n\u00B2)',        opLabel: 'swaps' },
    insertion: { label: 'insertionSort.js', recorder: recordInsertionSort, complexity: 'O(n\u00B2)',        opLabel: 'swaps' },
    selection: { label: 'selectionSort.js', recorder: recordSelectionSort, complexity: 'O(n\u00B2)',        opLabel: 'swaps' },
    merge:     { label: 'mergeSort.js',     recorder: recordMergeSort,     complexity: 'O(n log n)',   opLabel: 'writes' },
    quick:     { label: 'quickSort.js',     recorder: recordQuickSort,     complexity: 'O(n log n)~',  opLabel: 'swaps' }
};

/* Builds the full step list for an algorithm, prefixed with a "start" frame
   (the untouched array, so step-back can return all the way to the beginning)
   and annotated with running comparison/operation counts so any step can be
   rendered instantly without recounting from scratch. */
function buildSteps(array, algoKey) {
    const recorded = ALGORITHMS[algoKey].recorder(array);
    const steps = [{ type: 'start', indices: [], array: [...array] }, ...recorded];

    let compares = 0;
    let ops = 0;
    const sortedSet = new Set();

    steps.forEach(step => {
        if (step.type === 'compare') compares++;
        if (step.type === 'swap') ops++;

        if (step.type === 'sorted') {
            step.indices.forEach(idx => sortedSet.add(idx));
        }

        // Belt-and-braces: whatever gaps individual algorithms leave in their
        // 'sorted' markers (e.g. bubble sort never explicitly marks index 0),
        // the final frame should always show every bar as sorted.
        if (step.type === 'done') {
            step.array.forEach((_, idx) => sortedSet.add(idx));
        }

        step.compares = compares;
        step.ops = ops;
        step.sortedIndices = [...sortedSet];
    });

    return steps;
}

function generateRandomArray(size, min = 5, max = 100) {
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

/* ==========================================================================
   Playback state
   All of Phase 3 (play/pause/step/reset/speed) is just moving `index`
   around this steps array and re-rendering — no live algorithm logic runs
   during playback.
   ========================================================================== */
const state = {
    algo: 'bubble',
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    delay: 150
};

let currentArray = [];

/* ==========================================================================
   DOM references
   ========================================================================== */
const sizeSlider = document.getElementById('array-size');
const sizeLabel = document.getElementById('size-label');
const generateBtn = document.getElementById('generate-btn');
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');
const stepBackBtn = document.getElementById('step-back-btn');
const stepForwardBtn = document.getElementById('step-forward-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const tabs = Array.from(document.querySelectorAll('.tab'));
const statusAlgo = document.getElementById('status-algo');
const statusComplexity = document.getElementById('status-complexity');
const statusCompares = document.getElementById('status-compares');
const statusOps = document.getElementById('status-ops');

/* ==========================================================================
   Core playback controls
   ========================================================================== */
function renderStep(i) {
    state.index = i;
    const step = state.steps[i];
    renderBars(step.array, step.indices, step.type, step.sortedIndices);
    updateStatusBar(step);
    updateButtonStates();
}

function updateStatusBar(step) {
    const meta = ALGORITHMS[state.algo];
    statusAlgo.textContent = meta.label;
    statusComplexity.textContent = meta.complexity;
    statusCompares.textContent = `comparisons: ${step.compares}`;
    statusOps.textContent = `${meta.opLabel}: ${step.ops}`;
}

function updateButtonStates() {
    const atStart = state.index <= 0;
    const atEnd = state.index >= state.steps.length - 1;
    stepBackBtn.disabled = atStart;
    stepForwardBtn.disabled = atEnd;
    playPauseBtn.disabled = atEnd;
}

function play() {
    if (state.index >= state.steps.length - 1) return;
    state.playing = true;
    playPauseBtn.textContent = '\u23F8 pause';
    tick();
}

function tick() {
    if (!state.playing) return;

    if (state.index >= state.steps.length - 1) {
        pause();
        return;
    }

    renderStep(state.index + 1);
    state.timer = setTimeout(tick, state.delay);
}

function pause() {
    state.playing = false;
    clearTimeout(state.timer);
    playPauseBtn.textContent = '\u25B6 play';
}

function stepForward() {
    pause();
    if (state.index < state.steps.length - 1) renderStep(state.index + 1);
}

function stepBack() {
    pause();
    if (state.index > 0) renderStep(state.index - 1);
}

function resetPlayback() {
    pause();
    renderStep(0);
}

function loadAlgorithm(algoKey) {
    pause();
    state.algo = algoKey;
    state.steps = buildSteps(currentArray, algoKey);
    renderStep(0);
}

/* ==========================================================================
   Event wiring
   ========================================================================== */
sizeSlider.addEventListener('input', () => {
    sizeLabel.textContent = sizeSlider.value;
});

generateBtn.addEventListener('click', () => {
    const size = parseInt(sizeSlider.value, 10);
    currentArray = generateRandomArray(size);
    loadAlgorithm(state.algo);
});

speedSlider.addEventListener('input', () => {
    state.delay = parseInt(speedSlider.value, 10);
    speedLabel.textContent = `${state.delay}ms`;
});

playPauseBtn.addEventListener('click', () => {
    if (state.playing) {
        pause();
    } else {
        play();
    }
});

stepForwardBtn.addEventListener('click', stepForward);
stepBackBtn.addEventListener('click', stepBack);
resetBtn.addEventListener('click', resetPlayback);

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        loadAlgorithm(tab.dataset.algo);
    });
});

/* ==========================================================================
   Initial load
   ========================================================================== */
currentArray = generateRandomArray(parseInt(sizeSlider.value, 10));
loadAlgorithm(state.algo);