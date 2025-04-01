// Khởi tạo phần tử DOM
const sudokuGrid = document.getElementById('sudokuGrid');
const gridSizeSelect = document.getElementById('gridSize');
const difficultySelect = document.getElementById('difficulty');
const generateBtn = document.getElementById('generateBtn');
const solveBtn = document.getElementById('solveBtn');
const clearBtn = document.getElementById('clearBtn');
const clearAllBtn = document.getElementById('clearAllBtn'); // Thêm nút Clear All
const createGridBtn = document.getElementById('createGridBtn'); // Nút tạo lưới nhập

// Thêm biến theo dõi thời gian
let startTime = null;
let timerInterval = null;

// Mảng chứa 50 lưới Sudoku đã tạo sẵn
let sudokuGrids = [];

let currentSudokuIndex = 0; // Lưu trữ chỉ số của lưới Sudoku hiện tại

// Tạo lưới Sudoku với kích thước tùy chọn và kích thước ô phù hợp
function createSudokuGrid(size) {
    sudokuGrid.innerHTML = ''; // Xóa lưới cũ

    // Cập nhật kích thước ô dựa trên kích thước lưới
    let cellSize;
    if (size === 4) cellSize = 50;
    else if (size === 9) cellSize = 40;
    else if (size === 16) cellSize = 30;
    else {
        console.error("Unsupported grid size!");
        return; // Thoát nếu không hỗ trợ kích thước lưới
    }

    for (let i = 0; i < size; i++) {
        const row = document.createElement('div');
        row.className = 'sudoku-row';

        for (let j = 0; j < size; j++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.className = 'sudoku-cell';
            cell.id = `cell-${i}-${j}`;

            // Cho phép nhập nhiều số nhưng không cho phép ký tự và kiểm tra giá trị hợp lệ
            cell.oninput = function () {
                cell.value = cell.value.replace(/[^0-9]/g, ''); // Loại bỏ ký tự không phải số

                // Chuyển đổi giá trị nhập vào
                const value = parseInt(cell.value);

                // Kiểm tra nếu giá trị không hợp lệ
                if (value > size || value < 1) {
                    alert(`Vui lòng nhập số từ 1 đến ${size}.`);
                    cell.value = ''; // Xóa giá trị không hợp lệ
                }

                // Thay đổi màu nền của ô
                if (cell.value) {
                    cell.style.backgroundColor = 'yellow'; // Chuyển màu ô sang màu vàng khi nhập số
                } else {
                    cell.style.backgroundColor = 'white'; // Trở lại màu trắng khi xóa số
                }
            };

            // Cập nhật kích thước của ô theo giá trị của `cellSize`
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.textAlign = 'center'; // Canh giữa số
            cell.style.fontSize = `${cellSize * 0.7}px`;   // Kích thước chữ nhỏ hơn để vừa với ô

            row.appendChild(cell);
        }

        sudokuGrid.appendChild(row);
    }
}

// Hàm hiển thị một lưới Sudoku từ mảng đã tạo
function displaySudokuGrid(grid, size) {
    createSudokuGrid(size);
    updateGrid(grid, size);
}

// Lấy dữ liệu từ lưới
function getGridData(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            const value = cell.value.match(/\d+/); // Lấy số đầu tiên từ chuỗi nếu có
            row.push(value ? parseInt(value[0]) : 0); // Nếu không có số nào, thêm 0
        }
        grid.push(row);
    }
    return grid;
}

// Cập nhật dữ liệu lưới sau khi giải
function updateGrid(grid, size) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.value = grid[i][j] === 0 ? '' : grid[i][j];
        }
    }
}

// Hàm tạo bảng Sudoku hoàn chỉnh
function generateCompleteSudoku(size) {
    const grid = Array.from({ length: size }, () => Array(size).fill(0));

    // Logic khởi tạo bảng Sudoku hoàn chỉnh
    function fillGrid() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const subgridSize = Math.sqrt(size);
                let num = (i * subgridSize + Math.floor(i / subgridSize) + j) % size + 1;
                grid[i][j] = num;
            }
        }
    }

    fillGrid(); // Tạo bảng Sudoku hoàn chỉnh
    return grid;
}

// Hoán đổi hàng và cột để xáo trộn bảng Sudoku (giữ nguyên)
function shuffleSudoku(grid, size) {
    const subgridSize = Math.sqrt(size);

    if (!Number.isInteger(subgridSize)) {
        console.warn("Grid size does not support shuffling.");
        return;
    }

    // Hoán đổi ngẫu nhiên các hàng trong từng khối
    for (let i = 0; i < size; i += subgridSize) {
        const rows = [...Array(subgridSize).keys()].map(x => x + i);
        shuffleArray(rows);
        for (let j = 0; j < subgridSize; j++) {
            [grid[i + j], grid[rows[j]]] = [grid[rows[j]], grid[i + j]];
        }
    }

    // Hoán đổi ngẫu nhiên các cột trong từng khối
    for (let i = 0; i < size; i += subgridSize) {
        const cols = [...Array(subgridSize).keys()].map(x => x + i);
        shuffleArray(cols);
        for (let j = 0; j < subgridSize; j++) {
            for (let k = 0; k < size; k++) {
                [grid[k][i + j], grid[k][cols[j]]] = [grid[k][cols[j]], grid[k][i + j]];
            }
        }
    }
}

// Hàm xáo trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Xóa số trong các ô dựa trên độ khó
function removeNumbers(grid, size, percentage) {
    let cellsToRemove = Math.floor(size * size * percentage);
    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if (grid[row][col] !== 0) {
            grid[row][col] = 0;
            cellsToRemove--;
        }
    }
}

// Tạo 50 lưới Sudoku và lưu vào mảng sudokuGrids
function generateMultipleSudoku(size, difficulty) {
    sudokuGrids = [];
    const difficultyPercentage = { easy: 0.4, medium: 0.5, hard: 0.6 };

    for (let i = 0; i < 50; i++) {
        const grid = generateCompleteSudoku(size);
        shuffleSudoku(grid, size);
        removeNumbers(grid, size, difficultyPercentage[difficulty]);
        sudokuGrids.push(grid); // Thêm lưới vào mảng
    }

    currentSudokuIndex = 0; // Đặt lại chỉ số lưới hiện tại
    displaySudokuGrid(sudokuGrids[currentSudokuIndex], size);
    // Bắt đầu tính thời gian khi tạo lưới mới
    startTimer();
}

// Hàm quản lý thời gian
function startTimer() {
    startTime = Date.now(); // Lưu thời gian bắt đầu
    clearInterval(timerInterval); // Nếu có timer cũ thì xóa
    
    // Tạo phần tử timer nếu chưa có
    let timerElement = document.getElementById('timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'timer';
        timerElement.textContent = '00:00';
        timerElement.style.fontSize = '24px';
        timerElement.style.margin = '10px 0';
        timerElement.style.fontWeight = 'bold';
        
        // Thêm vào DOM sau controls
        const controlsDiv = document.getElementById('controls');
        controlsDiv.parentNode.insertBefore(timerElement, controlsDiv.nextSibling);
    }
    
    // Tạo phần tử hiển thị điểm nếu chưa có
    let scoreElement = document.getElementById('score');
    if (!scoreElement) {
        scoreElement = document.createElement('div');
        scoreElement.id = 'score';
        scoreElement.textContent = '1000';
        scoreElement.style.fontSize = '20px';
        scoreElement.style.margin = '5px 0';
        scoreElement.style.display = 'none'; // Ẩn điểm khi bắt đầu
        
        // Thêm vào DOM sau timer
        timerElement.parentNode.insertBefore(scoreElement, timerElement.nextSibling);
    }
    
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Tính số giây trôi qua
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Hàm tính điểm
function calculateScore() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Thời gian giải (giây)
    const baseScore = 1000; // Điểm tối đa
    const timePenalty = elapsedTime * 5; // Mỗi giây trôi qua trừ 5 điểm
    const finalScore = Math.max(baseScore - timePenalty, 0); // Điểm không nhỏ hơn 0
    return finalScore;
}

// Sự kiện cho nút tạo Sudoku
generateBtn.addEventListener('click', () => {
    const size = parseInt(gridSizeSelect.value);
    const difficulty = difficultySelect.value;
    generateMultipleSudoku(size, difficulty);
});

// Sự kiện cho nút giải Sudoku từ lưới hiện tại
solveBtn.addEventListener('click', () => {
    const size = parseInt(gridSizeSelect.value);
    const grid = getGridData(size);
    if (solveSudoku(grid, size)) {
        updateGrid(grid, size);
    } else {
        alert("This Sudoku puzzle cannot be solved.");
    }
});

// Hàm giải Sudoku (đệ quy)
function solveSudoku(grid, size) {
    const findEmptyCell = () => {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) return [i, j]; // Tìm ô trống
            }
        }
        return null; // Không còn ô trống
    };

    const isValid = (row, col, num) => {
        // Kiểm tra xem số có nằm trong khoảng cho phép hay không
        if (num < 1 || num > size) {
            alert(`Số ${num} không hợp lệ. Vui lòng nhập số từ 1 đến ${size}.`);
            return false; // Số không hợp lệ
        }

        for (let x = 0; x < size; x++) {
            if (grid[row][x] === num || grid[x][col] === num) return false; // Kiểm tra hàng và cột
        }
        const subgridSize = Math.sqrt(size);
        const startRow = row - row % subgridSize;
        const startCol = col - col % subgridSize;
        for (let i = 0; i < subgridSize; i++) {
            for (let j = 0; j < subgridSize; j++) {
                if (grid[i + startRow][j + startCol] === num) return false; // Kiểm tra ô con
            }
        }
        return true; // Số hợp lệ
    };

    const emptyCell = findEmptyCell();
    if (!emptyCell) return true; // Đã giải xong

    const [row, col] = emptyCell;

    for (let num = 1; num <= size; num++) {
        if (isValid(row, col, num)) {
            grid[row][col] = num;

            if (solveSudoku(grid, size)) return true; // Đệ quy giải Sudoku

            grid[row][col] = 0; // Quay lui
        }
    }

    return false; // Không có lời giải
}

// Hàm kiểm tra xem lưới Sudoku có được giải đúng không
function checkSudokuSolution(grid, size) {
    const isValid = (row, col, num) => {
        const subgridSize = Math.sqrt(size);

        // Kiểm tra hàng và cột
        for (let x = 0; x < size; x++) {
            if (grid[row][x] === num && x !== col) return false;
            if (grid[x][col] === num && x !== row) return false;
        }

        // Kiểm tra ô con (subgrid)
        const startRow = row - row % subgridSize;
        const startCol = col - col % subgridSize;
        for (let i = 0; i < subgridSize; i++) {
            for (let j = 0; j < subgridSize; j++) {
                if (grid[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
                    return false;
                }
            }
        }

        return true;
    };

    // Kiểm tra tất cả các ô trong lưới
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const num = grid[i][j];
            if (num === 0 || !isValid(i, j, num)) {
                return false;
            }
        }
    }
    return true;
}

// Nút để tạo lưới nhập
createGridBtn.addEventListener('click', () => {
    const size = parseInt(gridSizeSelect.value); // Lấy kích thước lưới hiện tại
    createSudokuGrid(size); // Tạo lưới
    document.getElementById('sudokuInputArea').style.display = 'block'; // Hiện thị vùng nhập liệu
    // Bắt đầu tính thời gian khi tạo lưới mới
    startTimer();
});

// Cập nhật giá trị của phần tử gridSizeValue khi thay đổi kích thước lưới
document.addEventListener('DOMContentLoaded', function() {
    const gridSizeValueSpan = document.getElementById('gridSizeValue');

    gridSizeSelect.addEventListener('change', function() {
        gridSizeValueSpan.textContent = gridSizeSelect.value;
    });
});

// Hàm tạo bản sao của mảng 2 chiều
function cloneGrid(grid) {
    return grid.map(row => row.slice());
}

// Hàm kiểm tra và đánh dấu các ô lỗi
function checkAndHighlightSolution(grid, size) {
    let hasError = false;
    // Hàm kiểm tra tính hợp lệ của số tại ô (không so sánh với chính nó)
    const isValidCell = (row, col, num) => {
        for (let x = 0; x < size; x++) {
            if (x !== col && grid[row][x] === num) return false;
            if (x !== row && grid[x][col] === num) return false;
        }
        const subgridSize = Math.sqrt(size);
        const startRow = row - row % subgridSize;
        const startCol = col - col % subgridSize;
        for (let i = 0; i < subgridSize; i++) {
            for (let j = 0; j < subgridSize; j++) {
                if ((startRow + i !== row || startCol + j !== col) &&
                    grid[startRow + i][startCol + j] === num) return false;
            }
        }
        return true;
    };
    // Duyệt qua từng ô trong grid
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cellElement = document.getElementById(`cell-${i}-${j}`);
            const value = cellElement.value;
            // Nếu ô trống, đánh dấu lỗi
            if (value === '') {
                cellElement.style.backgroundColor = 'red';
                hasError = true;
            } else {
                const num = parseInt(value);
                if (!isValidCell(i, j, num)) {
                    cellElement.style.backgroundColor = 'red';
                    hasError = true;
                } else {
                    // Nếu ô đúng, có thể giữ màu vàng (hoặc đặt lại màu mặc định nếu cần)
                    cellElement.style.backgroundColor = 'yellow';
                }
            }
        }
    }
    return hasError;
}

// Ghi đè sự kiện kiểm tra đáp án với phiên bản mới có đánh dấu lỗi và tính điểm
document.getElementById('checkBtn').addEventListener('click', () => {
    const size = parseInt(document.getElementById('gridSize').value);
    const grid = getGridData(size);
    const hasError = checkAndHighlightSolution(grid, size);
    if (!hasError) {
        clearInterval(timerInterval); // Dừng đếm thời gian
        const score = calculateScore(); // Tính điểm
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = score; // Hiển thị điểm trên giao diện
        scoreElement.style.display = 'block'; // Hiển thị phần tử điểm
        scoreElement.innerHTML = `<strong>Điểm của bạn: ${score}</strong>`;
        alert(`🎉 Chính xác! Bạn đạt ${score} điểm.`);
    } else {
        alert("❌ Sai rồi! Các ô sai đã được đánh dấu màu đỏ.");
    }
});

// Hàm gợi ý nước đi cho một ô trống
function giveHint() {
    const size = parseInt(gridSizeSelect.value);
    const grid = getGridData(size);
    // Tạo bản sao của grid để giải mà không ảnh hưởng đến grid hiện tại
    const gridCopy = cloneGrid(grid);
    // Giải sudoku trên gridCopy
    if (!solveSudoku(gridCopy, size)) {
        alert("Không thể tìm lời giải cho lưới hiện tại!");
        return;
    }
    // Tìm một ô trống trong grid ban đầu và thay bằng số từ gridCopy
    let hintGiven = false;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell.value === '') { // Nếu ô trống thì đưa gợi ý
                cell.value = gridCopy[i][j];
                cell.style.backgroundColor = 'lightgreen'; // Màu để nhận biết là gợi ý
                hintGiven = true;
                return; // Chỉ gợi ý một ô mỗi lần bấm
            }
        }
    }
    if (!hintGiven) {
        alert("Lưới đã đầy, không có ô trống để gợi ý!");
    }
}

// Thêm sự kiện cho nút gợi ý nếu có
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem nút hint có tồn tại không
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) {
        hintBtn.addEventListener('click', giveHint);
    }
    
    // Kiểm tra nếu có nút createButton, thêm sự kiện startTimer
    const createButton = document.getElementById('createButton');
    if (createButton) {
        createButton.addEventListener('click', () => {
            createSudokuGrid(); // Hàm tạo Sudoku
            startTimer(); // Bắt đầu đếm thời gian ngay khi lưới được tạo
        });
    }
});