'use strict';

const bindLetters = (letters, callback) => {

    let getLetterIndex = (countOfClicks) => {
        return (letters.length <= countOfClicks) ? (countOfClicks % letters.length) : countOfClicks
    };

    return (...args) => {
        let [event, countOfClicks] = args;
        let letterIndex = getLetterIndex(countOfClicks);
        let letter = letters[letterIndex];

        callback(letter, event)
    }
};

let debounceWithClickCounter = (callBack, ms) => {
    let timerId = null;
    let countOfClicks = 0;

    let resetDebounceState = () => {
        countOfClicks = 0;
        timerId = null
    };

    let callBackWithTimeout = (...args) => {
        return timerId = setTimeout(() => {
            callBack(...args, countOfClicks);
            resetDebounceState()
        }, ms)
    };

    let trackClick = () => countOfClicks += 1;

    let reInitTimeOutWithCallBack = (...args) => {
        trackClick();
        clearInterval(timerId);
        timerId = callBackWithTimeout(...args);
    };

    let isTimerSet = () => !!timerId;

    return (...args) => isTimerSet() ? reInitTimeOutWithCallBack(...args) : callBackWithTimeout(...args);
};


let handleClick = (letters) => {
    debounceWithClickCounter(
        bindLetters(
            letters, (letter, event) => {console.log(letter, event)})
        , 1000)
};


class HTMLButton {
    constructor(){}

    render() {
        let button = document.createElement('button');
        button.innerText = this.label;
        button.addEventListener('click', (event) => { this.command(event) } );
        return button
    }

    setCommand(command) {
        this.command = command;
    }

    setLabel(label) {
        this.label = label;
    }
}

class HTMLInput {
    constructor(value){
        this.value = value;
    }

    render() {
        let input = document.createElement('input');
        input.value = this.value;
        input.readOnly = true;
        return input;
    }
}

class HTMLRendererService {
    constructor(){
    }

    render(sourceId, renderedClass){
        let source = document.getElementById(sourceId);
        let element = renderedClass.render();
        renderedClass.setRenderer(this.rerender(sourceId, renderedClass));
        source.appendChild(element);
    }

    rerender(sourceId, renderedClass){
        document.getElementById(sourceId).innerHTML = '';
        return this.render.bind(this, sourceId, renderedClass)
    }

}

const buttonConfig = {
    LETTER: [{
        value: ['a', 'b', 'c'],
        label: 'abc',
        type: 'INPUT'
    },{
        value: ['d', 'e', 'f'],
        label: 'def',
        type: 'INPUT'
    },{
        value: '',
        label: 'delete',
        type: 'ACTION'
    },{
        value: 'NUMBER',
        label: 'Change Mode',
        type: 'TYPE'
    }
    ],
    NUMBER:[
        {
            value: [1],
            label: '1',
            type: 'SYMBOL'
        },
        {
            value: '',
            label: 'delete',
            type: 'ACTION'
        },
        {
            value: 'LETTER',
            label: 'Change Mode',
            type: 'TYPE'
        }
    ]
};

class HtmlComponent {
    constructor(){

    }

    setRenderer(renderer){
        this.renderer = renderer;
    }

    reRender(){
        this.renderer()
    }
}

class Phone extends HtmlComponent {
    constructor(buttonsFactory, initialValue = ''){
        super();
        this.value = initialValue;
        this.type = 'LETTER'
    }

    setValue(value){
        this.value += value;
        this.reRender();
    };

    render(){
        let phoneRoot = document.createElement('div');

        let buttons = buttonConfig[this.type]
            .map((btnConf) => {
                let btn = new HTMLButton();
                btn.setLabel(btnConf.label);
                btn.setCommand(this.bindValueToCommand(btnConf.value, this.getCommandByType(btnConf.type)));
                return btn;
            });

        phoneRoot.appendChild(new HTMLInput(this.value).render());

        buttons.map((button) => phoneRoot.appendChild(button.render()));

        return phoneRoot;
    };

    getCommandByType(type){
        switch (type) {
            case 'INPUT':
                return this.handleClick.bind(this);
            case 'ACTION':
                return this.deleteValue.bind(this);
            case 'TYPE':
                return this.changeMode.bind(this);
            case "SYMBOL":
                return this.handleSymbol.bind(this);
        }
    };

    bindValueToCommand(value, command) {
        return command(value)
    }

    handleClick (letters){
        return debounceWithClickCounter(
            bindLetters(
                letters, letter => { this.setValue(letter) })
            , 1000)
    };

    deleteValue () {
        return () => {
            this.value = this.value.slice(0, -1);
            this.reRender()
        };
    };

    changeMode (type) {
        return () => {
            this.type = type;
            this.reRender();
        }
    };

    handleSymbol(symbol) {
        return bindLetters(symbol, () => { this.setValue(symbol) })
    }
}

let phone = new Phone();

let renderService = new HTMLRendererService();
renderService.render('phone', phone);
