/**
 * Function that represents the Node class
 * @param _id Object Node Id
 * @param _data Node Information
 * @param _x Node x position
 * @param _y Node y position
 */
function Node(_id, _data, _x, _y) {
    this.id = _id;
    this.data = _data;
    this.x = _x;
    this.y = _y;
    this.getId = function() {
        return this.id;
    };
    this.getData = function() {
        return this.data;
    };
    this.getX = function() {
        return this.x;
    };
    this.getY = function() {
        return this.y;
    };
}

/**
 * Function that represents the class of Edge
 * @param _source Object Edge parent
 * @param _target Object Edge child
 */
function Edge(_source, _target) {
    this.source = _source;
    this.target = _target;
    this.getSource = function() {
        return this.source;
    };
    this.getTarget = function() {
        return this.target;
    };
}

/**
 * Variable that composes the instance of Vue.js
 */
let app = new Vue({
    el: '#app',
    data() {
        return {
            redirect: true,
            title: 'Registro de gramatica',
            add: 'Agregar',
            wordValidate: '',
            arrow: '\u27f6',
            lambda: '\u03BB',
            upperRegex: '^[A-Z]+$',
            lowerRegex: '^[a-z0-9]+$',
            productionRegex: '^[a-zA-Z0-9|]+$',
            nodeColor: '#008cc2',
            nodeSize: 5,
            edgeColor: '#282c34',
            edgeType: 'line',
            edgeSize: 0.1,
            initialSymbol: '',
            nonTerminal: '',
            terminal: '',
            nonTerminalSymbols: [],
            terminalSymbols: [],
            ruleSource: '',
            ruleTarget: '',
            productionRules: [],
            disableSelect: true,
            disableProduction: true,
            disableSubmit: false,
            counter: 0,
            wordsCounter: 0,
            idCounter: 1,
            edgeCounter: 0,
            nodes: [],
            edges: [],
            words: [],
            graph: {
                nodes: [],
                edges: []
            },
            validRule: false,
            validWord: false,
            validSubmit: false,
            wordExist: false,
            wordInput: ''
        }
    },
    watch: {
        'ruleTarget': function(value) {
            this.validateProduction(value);
        },
    },
    methods: {
        /**
         * Validate the text field based on each regular expression
         * @param event event launched by each Input
         */
        validateInput(event) {
            let expresion;
            switch (event.srcElement.id) {
                case 'nonTerminalInput':
                    expresion = this.upperRegex;
                    break;
                case 'terminalInput':
                    expresion = this.lowerRegex;
                    break;
                case 'rulesInput':
                    expresion = this.productionRegex;
                    break;
                case 'wordInput':
                    expresion = this.lowerRegex;
                    break;
                default:
                    break;
            }
            let regex = new RegExp(expresion);
            let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            if (!regex.test(key)) {
                event.preventDefault();
                return false;
            }
        },
        /**
         * Enter a new non-terminal symbol
         */
        addNonTerminal() {
            this.nonTerminalSymbols.push(this.nonTerminal);
            this.disableSelect = false;
            this.nonTerminal = '';
        },
        /**
         * Enter a new terminal symbol
         */
        addTerminal() {
            this.terminalSymbols.push(this.terminal);
            this.disableProduction = false;
            this.terminal = '';
        },
        /**
         * validate the text entered in each production rule
         */
        validateProduction(value) {
            this.validRule = false;
            let validationList = this.nonTerminalSymbols.concat(this.terminalSymbols);
            let production = value.split('|');
            production.forEach(rule => {
                if (validationList.includes(rule)) {
                    this.validRule = true;
                } else if (value === 'v') {
                    this.validRule = true;
                }
            })
        },
        /**
         * enter a production rule in the object 'productionRules'
         */
        addProductionRule() {
            this.productionRules.push({
                source: this.ruleSource,
                target: this.ruleTarget
            });
            this.ruleSource = '';
            this.ruleTarget = '';
            this.validSubmit = true;
            this.validateSubmit();
        },
        /**
         * enter nodes in the object that renders the tree
         */
        insertNodes() {
            this.nodes.forEach(node => {
                this.graph.nodes.push({
                    id: node.id,
                    label: node.data,
                    x: node.x,
                    y: node.y,
                    size: this.nodeSize,
                    color: this.nodeColor
                });
            })
        },
        /**
         * enter edges on the object that renders the tree
         */
        insertEdges() {
            this.edges.forEach(edge => {
                this.graph.edges.push({
                    id: `e${this.edgeCounter}`,
                    source: edge.source,
                    target: edge.target,
                    color: this.edgeColor,
                    type: this.edgeType,
                    size: this.edgeSize
                });
                this.edgeCounter++;
            })
        },
        /**
         *
         * This method recursively creates the nodes and edges of the branch tree by storing this information in arrays.
         * When creating the nodes, their positions on the screen are also calculated when calling the calculateXAxis() method
         * For the creation of the child nodes, it is verified if the node that enters by parameter to the method has non-terminal symbols,
         * if it does, it looks for the production of the symbol and creates the nodes, dragging their data to the children
         * eliminating the terminal symbol that produced children
         * The validation to prevent recursion isn't called infinitely, it's a counter up to 8 in order not to generate many levels in the tree at the time of showing it
         *
         * @param id parent node
         */
        createGraph(node) {
            let nonTerminalAux = this.stringLoop(node.getData());
            if(nonTerminalAux[0] !== ''){
                let production = this.productionRules[this.filterKeySource(nonTerminalAux[0])];
                let productionsList = production.target.split('|');
                for (let i = 0; i < productionsList.length; i++) {
                    this.idCounter++;
                    let aux;
                    if(node.getId() !== 1) {
                        aux = new Node(
                            this.idCounter,
                            this.insert(this.removeByIndex(node.getData(), nonTerminalAux[1]), productionsList[i], nonTerminalAux[1]),
                            this.calculateXAxis(productionsList.length, node.getX(), node.getY() + 1, i),
                            node.getY() + 1
                        );
                    } else {
                        aux = new Node(
                            this.idCounter,
                            productionsList[i],
                            this.firstXAxis(productionsList.length, node.getX(), i),
                            node.getY() + 1
                        );
                    }
                    this.nodes.push(aux);
                    this.edges.push(new Edge(node.getId(), aux.getId()));
                    if(this.counter < 8) {
                        this.counter++;
                        this.createGraph(aux);
                    } else {
                        this.counter = 0;
                    }
                }
            }
        },
        /**
         *
         * This method is similar to the createGraph() method but this is in order to save the possible words in an array,
         * for that reason the method doesn't store edges or nodes anywhere
         * The validation to avoid recursion is not called infinitely, it is a counter up to 1000 in order to store as many words as possible without sacrificing program performance
         * @param id parent node
         */
        createWords(node) {
            let nonTerminalAux = this.stringLoop(node.getData());
            if(nonTerminalAux[0] !== ''){
                let production = this.productionRules[this.filterKeySource(nonTerminalAux[0])];
                let productionsList = production.target.split('|');
                for (let i = 0; i < productionsList.length; i++) {
                    this.idCounter++;
                    let aux;
                    if(node.getId() !== 1) {
                        aux = new Node(
                            this.idCounter,
                            this.insert(this.removeByIndex(node.getData(), nonTerminalAux[1]), productionsList[i], nonTerminalAux[1]),
                            0,
                            0
                        );
                        this.checkWord(aux.getData());
                        if (!this.wordExist) {
                            this.words.push(aux.getData());
                        }
                    } else {
                        aux = new Node(
                            this.idCounter,
                            productionsList[i],
                            0,
                            0
                        );
                    }
                    if(this.wordsCounter < 1000) {
                        this.wordsCounter++;
                        this.wordExist = false;
                        this.createWords(aux);
                    } else {
                        this.wordsCounter = 0;
                    }
                }
            }
        },
        /**
         * look for a String at the source of the production rules by returning the index found
         * @param searchKey String to look in the array
         * @return found index
         */
        filterKeySource(searchKey) {
            let element = '';
            Object.keys(this.productionRules).forEach(index => {
                if (this.productionRules[index].source === searchKey)
                    element = index;
            });
            return element
        },
        /**
         * remove a char in a given index of a string
         * @param str original string
         * @param index  index to be removed
         * @return new string
         */
        removeByIndex(value, index) {
            return value.slice(0, Number(index)) + value.slice(Number(index) + 1);
        },
        /**
         * this method check if a given string has a non-terminal symbol,
         * if it does return an array with the firt non-terminal symbol and the index of it
         * @param srt string to verify
         * @return array with non-terminal symbol and index of it
         */
        stringLoop(value){
            let productionTarget = [];
            for (let i = 1; i <= value.length; i++) {
                if(this.nonTerminalSymbols.includes(value.substring((i - 1), i))) {
                    productionTarget[0] = value.substring((i - 1), i);
                    productionTarget[1] = (i - 1) + '';
                    return productionTarget;
                } else{
                    productionTarget[0] = '';
                    productionTarget[1] = '';
                }
            }
            return productionTarget;
        },
        insert(original, newValue, index) {
            let indexAux = Number(index);
            let originalBegin = original.substring(0, indexAux);
            let originalEnd = original.substring(indexAux);
            return originalBegin + newValue + originalEnd;
        },
        /**
         * verify that a word exists within the set of non-terminal symbols
         * @param word string to verify
         */
        checkWord(word){
            this.nonTerminalSymbols.forEach(item => {
                if (word.indexOf(item) !== -1) {
                    this.wordExist = true;
                }
            });
        },
        /**
         * Validates that the word entered is accepted within the grammar
         */
        isValidWord() {
            if (this.words.includes(this.wordInput)) {
                this.validWord = true;
                this.wordValidate = 'La palabra se encuentra dentro de la gramatica ingresada'
            } else {
                this.validWord = true;
                this.wordValidate = 'La palabra NO se encuentra dentro de la gramatica ingresada'
            }
        },
        /**
         * calculates the x of each node in the screen, to do this it uses quantity of nodes that the parent node has,
         * the x position of the parent node, and the number of child the current node is.
         * according to the Y position the distance between each child is less
         *
         * @param lenght  quantity of nodes that the parent node has
         * @param x x position of the parent node
         * @param y level in the tree
         * @param index  number of child the current node is
         * @return calculated x
         */
        calculateXAxis(lenght, x, y, index) {
            let sum = y / 10;
            let lenghtAux = lenght / 2;
            let newXPosition = (index - Math.trunc(lenghtAux)) + x;
            if (newXPosition === x && lenght === 2) {
                newXPosition = newXPosition + sum;
            } else if (newXPosition < x) {
                newXPosition = (index - Math.trunc(lenghtAux) + sum) + x;
            } else if (newXPosition > x) {
                newXPosition = (index - Math.trunc(lenghtAux) - sum) + x;
            }
            return newXPosition;
        },
        /**
         * calculates the x of the first row of children in the tree (level 1),
         * the diferrence between this method and calculatex() is that the distance between each children is greater and not calculated
         * @param lenght  quantity of nodes that the parent node has
         * @param x x position of the parent node
         * @param index  number of child the current node is
         * @return calculated x
         */
        firstXAxis(lenght, x, index) {
            let lenghtAux = lenght / 2;
            let newXPosition = (index - Math.trunc(lenghtAux)) + x;
            if (newXPosition > 0) {
                newXPosition = newXPosition + 2;
            } else if (newXPosition < 0){
                newXPosition = newXPosition - 2
            }
            return newXPosition;
        },
        /**
         * Create the Sigma Library instance with the general configuration
         * and highlight the graph to illustrate
         */
        validateSubmit() {
            if (this.productionRules.length > 1 && this.initialSymbol !== '') {
                this.validSubmit = true;
            }
        },
        /**
         * Reload the window to reload the initial form
         */
        cleanGrammar() {
            window.location.reload();
        }
    }
});

/**
 * Create the Sigma Library instance with the general configuration
 * and highlight the graph to illustrate
 */
function renderGraph() {
    let sigmaInstance = new sigma({
        renderer: {
            container: document.getElementById('sigma-container'),
            type: 'canvas'
        },
        settings: {
            minEdgeSize: 0.1,
            maxEdgeSize: 2,
            minNodeSize: 1,
            maxNodeSize: 8,
        }
    });

    sigmaInstance.graph.read(app.graph);
    sigmaInstance.refresh();
}

/**
 * Hide the area of the form, viewing the tree
 */
function hideIntro() {
    app.redirect = false;
    document.getElementById('sigma-container').style.display = 'block';
}

/**
 * Call the recursive functions, build the graph and render the tree
 */
function init() {
    hideIntro();
    app.nodes.push(new Node(app.idCounter, app.initialSymbol, 0, 0));
    app.createGraph(app.nodes[0]);
    app.createWords(app.nodes[0]);
    app.insertNodes();
    app.insertEdges();

    renderGraph();
}
