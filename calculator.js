const display = document.getElementById("display");
const btnClear = document.getElementById("kAC");

const calculatorState = {
  operator: null,
  operand: null,
  lastKeyType: null,
  tempResult: null,
};

document.addEventListener("keypress", (event) => {
  enterNumber(event.key);
});

initializeButtonHandlers();

/**
 * Inicializa los manejadores de evento para los botones de la calculadora.
 */
function initializeButtonHandlers() {
  const numberButtons = document.getElementsByClassName("key-number");
  Array.from(numberButtons).forEach((button) => {
    button.onclick = (event) => {
      enterNumber(event.target.value);
      flashButton(event.target.value);
    };
  });

  const operatorButtons = document.getElementsByClassName("key-operator");
  Array.from(operatorButtons).forEach((button) => {
    button.onclick = (event) => {
      enterOperator(event.target.value);
      setSelectedButton(event.target.value);
      flashButton(event.target.value);
    };
  });

  const controlButtons = document.getElementsByClassName("key-control");
  Array.from(controlButtons).forEach((button) => {
    button.onclick = (event) => {
      enterControl(event.target.value);
      flashButton(event.target.value);
    };
  });

  btnClear.onclick = () => {
    clearDisplay("partial");
  };
}

/**
 * Agrega un valor a la pantalla y normaliza el texto mostrado.
 * @param {string|Decimal} value Valor que se debe agregar a la pantalla.
 */
function printDisplay(value) {
  if (display.value.length < 9) {
    display.value = `${display.value}${value}`;
  }

  display.value = display.value.replace(/^(0+)/g, "");

  if (display.value.indexOf(".") === 0 || display.value.length === 0) {
    display.value = `0${display.value}`;
  }
}

/**
 * Procesa la entrada numérica y el punto decimal.
 * @param {string} num Caracter ingresado por el usuario.
 */
function enterNumber(num) {
  if (calculatorState.lastKeyType === "operator" || btnClear.innerText === "AC") {
    display.value = "0";
  }

  if (num === "." && display.value.includes(".")) {
    return;
  }

  calculatorState.lastKeyType = "number";
  btnClear.innerText = "C";
  printDisplay(num);
  setSelectedButton("=");
}

/**
 * Procesa la entrada de operadores y el signo igual.
 * @param {string} operatorValue Operador ingresado por el usuario.
 */
function enterOperator(operatorValue) {
  if (operatorValue === "%" || operatorValue === "+/-") {
    enterControl(operatorValue);
    return;
  }

  if (calculatorState.lastKeyType === "number" && calculatorState.operand) {
    computeResult(calculatorState.operator);
  }

  calculatorState.operand = new Decimal(display.value);
  calculatorState.lastKeyType = "operator";

  if (operatorValue !== "=") {
    calculatorState.operator = operatorValue;
  } else {
    calculatorState.tempResult = calculatorState.operand;
    clearDisplay("all");
    printDisplay(calculatorState.tempResult);
  }
}

/**
 * Procesa las acciones de control como porcentaje y cambio de signo.
 * @param {string} controlValue Acción de control.
 */
function enterControl(controlValue) {
  let resultValue = display.value;

  switch (controlValue) {
    case "%": {
      if (
        calculatorState.operator === "+" ||
        (calculatorState.operator === "-" && calculatorState.operand)
      ) {
        resultValue = calculatorState.operand
          .mul(Number(display.value))
          .div(100)
          .toNumber();
      } else {
        const currentValue = new Decimal(display.value);
        resultValue = currentValue.div(100).toNumber();
      }
      break;
    }
    case "+/-": {
      if (Number(display.value) !== 0) {
        resultValue = display.value.startsWith("-")
          ? display.value.slice(1)
          : `-${display.value}`;
      }
      break;
    }
    default:
      return;
  }

  display.value = resultValue;
}

/**
 * Calcula el resultado según el operador almacenado.
 * @param {string|null} operatorValue Operador matemático.
 */
function computeResult(operatorValue) {
  if (!calculatorState.operand || !operatorValue) {
    return;
  }

  let resultValue;

  switch (operatorValue) {
    case "+":
      resultValue = calculatorState.operand.plus(display.value).toNumber();
      break;
    case "-":
      resultValue = calculatorState.operand.sub(display.value).toNumber();
      break;
    case "*":
      resultValue = calculatorState.operand.mul(display.value).toNumber();
      break;
    case "/":
      resultValue = calculatorState.operand.div(display.value).toNumber();
      break;
    default:
      return;
  }

  display.value = resultValue;
}

/**
 * Limpia la pantalla parcial o total.
 * @param {"all"|"partial"} mode Modo de limpieza.
 */
function clearDisplay(mode) {
  if (mode === "all") {
    btnClear.innerText = "AC";
    calculatorState.operator = null;
    calculatorState.operand = null;
    calculatorState.lastKeyType = null;
    display.value = "0";
    return;
  }

  if (mode === "partial" && btnClear.innerText === "AC") {
    clearDisplay("all");
    setSelectedButton("=");
    return;
  }

  if (mode === "partial" && btnClear.innerText === "C") {
    display.value = "0";
    btnClear.innerText = "AC";
    if (calculatorState.operator) {
      setSelectedButton(calculatorState.operator);
    }
  }
}

/**
 * Marca el botón de operador seleccionado en la interfaz.
 * @param {string} operatorValue Operador que se debe seleccionar.
 */
function setSelectedButton(operatorValue) {
  const currentSelected = document.querySelector(".selected");
  if (currentSelected) {
    currentSelected.classList.remove("selected");
  }

  if (operatorValue !== "=") {
    const button = document.getElementById(`k${operatorValue}`);
    if (button) {
      button.classList.add("selected");
    }
  }
}

/**
 * Agrega la animación de pulsado al botón correspondiente.
 * @param {string} key Tecla asociada al botón.
 */
function flashButton(key) {
  const button = document.getElementById(`k${key}`);
  if (!button) {
    return;
  }

  button.classList.add("click");
  setTimeout(() => {
    button.classList.remove("click");
  }, 100);
}
