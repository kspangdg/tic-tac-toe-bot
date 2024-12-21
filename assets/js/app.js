/*
 * JS Tic Tac Toe Neural Network
 *
 * This is a simple Tic Tac Toe game that uses a neural network to play against the user.
 * The neural network is trained using a genetic algorithm.
 * 
 * @class NeuralNetwork
 * @version 1.0.0
 * @autor Keith Spang
 */


class NeuralNetwork {
    constructor(weights_data, biases_data) {
        this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.layers = {
            input:{count: 27, cells: []},  // [1,0,0] = 0, [0,1,0] = 1, [0,0,1] = 2
            hidden:{count: 11, cells: []},
            output:{count: 9, cells: []}
        }
        this.weights_data = weights_data;
        this.biases_data = biases_data;
        this.calculating = false;
        this.game_started = false;
        this.game_over = false;
        this.outcome = 0; // 0 = draw, 1 = user win, 2 = computer win
        this.canvas;
        this.ctx;
        this.grid;
        this.grid_cells;
        this.message;
    }

    sigmoid(weight) {
        return 1 / (1 + Math.exp(-weight));
    }
    random(min, max) {
        return (Math.random() * (max - min + 1) + min).toFixed(2);
    }
    color_opacity(value) {
       return Math.max(0, value);
    }

    check_outcome() {
        // winnning combinations
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        // check for win
        for (let i = 0; i < wins.length; i++) {
            if (this.board[wins[i][0]] === 1 && this.board[wins[i][1]] === 1 && this.board[wins[i][2]] === 1) {
                this.game_over = true;
                this.outcome = 1;
                this.message.innerHTML = 'You win!';
            } else if (this.board[wins[i][0]] === 2 && this.board[wins[i][1]] === 2 && this.board[wins[i][2]] === 2) {
                this.game_over = true;
                this.outcome = 2;
                this.message.innerHTML = 'Computer wins!';
            }
        }
        // check for draw
        if (!this.board.includes(0) && !this.game_over) {
            this.game_over = true;
            this.outcome = 0;
            this.message.innerHTML = 'Draw!';
        }
        this.calculating = false;
    }

    print_data() {
        for (const property in this.layers) {
            let html = '';
            for (let i = 0; i < this.layers[property].count; i++) {
                html += property + '_' + i + ': {v: ' + this.layers[property].cells[i].value.toFixed(2);
                if (property !== 'output') {
                    html += ', w: [';
                    for (let j = 0; j < this.layers[property].cells[i].weights.length; j++) {
                        html += this.layers[property].cells[i].weights[j] + ', ';
                    }
                    html += '], b: ' + this.layers[property].cells[i].bias;
                }
                html += '}<br>';
            }
            if (property === 'input') {
                document.getElementById('inputs').innerHTML = html;
            } else if (property === 'hidden') {
                document.getElementById('hidden').innerHTML = html;
            } else if (property === 'output') {
                document.getElementById('outputs').innerHTML = html;
            }
                
        }
    }
    
    print() {
        this.ctx.clearRect(0, 0, 860, 540);
        for (const property in this.layers) {
            let x = 0;
            let y = 0;
            if (property === 'input') {
                x = 10;
                y = 10;
            } else if (property === 'hidden') {
                x = 400;
                y = 10 * 17;
            } else if (property === 'output') {
                x = 800;
                y = 10 * 19;
            }
            // Draw lines
            if (property === 'input') {
                for (let i = 0; i < this.layers[property].count; i++) {
                    for (let j = 0; j < this.layers['hidden'].count; j++) {
                        const weight = this.color_opacity(this.layers[property].cells[i].weights[j]);
                        // clear previous line
                        this.ctx.beginPath();
                        this.ctx.moveTo(10, y + (i * 20));
                        this.ctx.lineTo(400, y * 17 + (j * 20));
                        console.log(weight);
                        
                        this.ctx.strokeStyle = (this.game_started) ? 'rgba(24, 231, 207, ' + weight + ')' : 'rgba(24, 231, 207, 0.1)';
                        this.ctx.stroke();
                    }
                }
            } else if (property === 'hidden') {
                for (let i = 0; i < this.layers[property].count; i++) {
                    for (let j = 0; j < this.layers['output'].count; j++) {
                        const weight = this.color_opacity(this.layers[property].cells[i].weights[j]);
                        this.ctx.beginPath();
                        this.ctx.moveTo(400, y + (i * 20));
                        this.ctx.lineTo(800, y + 20 + (j * 20));
                        this.ctx.strokeStyle = (this.game_started) ? 'rgba(24, 231, 207, ' + weight + ')' : 'rgba(24, 231, 207, 0.1)';
                        this.ctx.stroke();
                    }
                }
            }
            for (let i = 0; i < this.layers[property].count; i++) {
                let value = this.layers[property].cells[i].value;
                let hsl_inverse = 50 * value;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
                // increase stroke width
                this.ctx.strokeStyle = '#18E7CF';
                this.ctx.stroke();
                this.ctx.fillStyle = 'hsl(173, 81%, ' + hsl_inverse + '%)';
                this.ctx.fill();
                // Draw text
                // this.ctx.fillStyle = 'black';
                // this.ctx.font = '10px Arial';
                // this.ctx.fillText(value, x - 2.5, y + 2.5);
                y += 20;
            }
        }
    }

    predict() {
        // Input layer
        for (let i = 0; i < this.board.length; i++) {
            console.log('board: ' + i);
            
            if (this.board[i] === 0) {
                this.layers['input'].cells[i * 3].value = 1;
                this.layers['input'].cells[i * 3 + 1].value = 0;
                this.layers['input'].cells[i * 3 + 2].value = 0;
            } else if (this.board[i] === 1) {
                this.layers['input'].cells[i * 3].value = 0;
                this.layers['input'].cells[i * 3 + 1].value = 1;
                this.layers['input'].cells[i * 3 + 2].value = 0;
            } else if (this.board[i] === 2) {
                this.layers['input'].cells[i * 3].value = 0;
                this.layers['input'].cells[i * 3 + 1].value = 0;
                this.layers['input'].cells[i * 3 + 2].value = 1;
            }
        }
        
        // Hidden layer
        for (let i = 0; i < this.layers['hidden'].count; i++) {
            let sum = 0;
            for (let j = 0; j < this.layers['input'].count; j++) {
                sum += this.layers['input'].cells[j].value * this.layers['input'].cells[j].weights[i];
            }
            sum += this.layers['hidden'].cells[i].bias;
            this.layers['hidden'].cells[i].value = sum;
        }
        // Output layer
        for (let i = 0; i < this.layers['output'].count; i++) {
            let sum = 0;
            for (let j = 0; j < this.layers['hidden'].count; j++) {
                sum += this.layers['hidden'].cells[j].value * this.layers['hidden'].cells[j].weights[i];
            }
            sum += this.layers['output'].cells[i].bias;
            this.layers['output'].cells[i].value = this.sigmoid(sum);
        }
        //this.print();
        this.print_data();
        this.computer_move();
    }

    computer_move() {
        let max = 0;
        let index = 0;
        for (let i = 0; i < this.layers['output'].count; i++) {
            if (this.layers['output'].cells[i].value > max && this.board[i] === 0) {
                max = this.layers['output'].cells[i].value;
                index = i;
            }
        }
        console.log('Computer move: ' + max + ' at index: ' + index);
        this.board[index] = 2;
        this.grid_cells[index].innerHTML = 'o';
        document.getElementById('compute').innerHTML = index + 1;
        this.check_outcome();
        this.print();
    }

    // User input evet listener
    user_input() {
        const self = this;
        for (let i = 0; i < this.grid_cells.length; i++) {
            this.grid_cells[i].addEventListener('click', function() {
                if (self.game_over || self.board[i] !== 0 || self.calculating) return;
                if (!self.game_started) self.message.innerHTML = 'Good luck... You\'ll need it';
                self.game_started = true;
                self.calculating = true;
                self.board[i] = 1; // update board
                self.grid_cells[i].innerHTML = 'x'; // update UI
                self.check_outcome();
                if (self.game_over) return;
                self.predict();
            });
        }
    }

    init() {
        // Get elements
        const grid = document.getElementById('grid');
        const canvas = document.getElementById('canvas');
        const grid_cells = grid.getElementsByTagName('div');
        const message = document.getElementById('message');
        if (grid === null) { console.error('Grid not found'); return; }
        if (canvas === null) { console.error('Canvas not found'); return; }
        if (grid_cells.length !== 9) { console.error('Grid cells not found'); return; }
        if (message === null) { console.error('Message not found'); return; }
        this.grid = grid;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid_cells = grid_cells;
        this.message = message;

        // Create input, hidden and output cells
        for (const property in this.layers) {
            for (let i = 0; i < this.layers[property].count; i++) {
                this.layers[property].cells.push({
                    value: 0,
                    weights: [],
                    bias: 0
                });
                // Create weights
                if (property === 'input') {
                    this.layers[property].cells[i].weights = global_weights['i' + i];
                    this.layers[property].cells[i].bias = global_biases['i' + i];
                } else if (property === 'hidden') {
                    this.layers[property].cells[i].weights = global_weights['h' + i];
                    this.layers[property].cells[i].bias = global_biases['h' + i];
                }
            }
        }
        console.log(this.layers);
        this.print();
        this.user_input();
        this.print_data();
    }

}

// Init Neural Network
const NN = new NeuralNetwork(global_weights, global_biases);
NN.init();
