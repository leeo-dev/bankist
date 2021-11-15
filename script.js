'use strict';
import accounts from './data.js';

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

class Bankist {
  #accounts;
  #currentAccount;
  constructor(accounts) {
    this.#accounts = accounts;
    this.#createUsername(this.#accounts);
    this.#selectDOMElements();
    this.#handleActions();
  }
  #selectDOMElements() {
    // Elements
    this.labelWelcome = document.querySelector('.welcome');
    this.labelDate = document.querySelector('.date');
    this.labelBalance = document.querySelector('.balance__value');
    this.labelSumIn = document.querySelector('.summary__value--in');
    this.labelSumOut = document.querySelector('.summary__value--out');
    //prettier-ignore
    this.labelSumInterest = document.querySelector('.summary__value--interest');
    this.labelTimer = document.querySelector('.timer');
    this.containerApp = document.querySelector('.app');
    this.containerMovements = document.querySelector('.movements');
    this.btnLogin = document.querySelector('.login');
    this.btnTransfer = document.querySelector('#transfer');
    this.btnLoan = document.querySelector('.form__btn--loan');
    this.btnClose = document.querySelector('#close-account');
    this.btnSort = document.querySelector('.btn--sort');
    this.inputLoginUsername = document.querySelector('.login__input--user');
    this.inputLoginPin = document.querySelector('.login__input--pin');
    this.inputTransferTo = document.querySelector('.form__input--to');
    this.inputTransferAmount = document.querySelector('.form__input--amount');
    this.inputLoanAmount = document.querySelector('.form__input--loan-amount');
    this.inputCloseUsername = document.querySelector('.form__input--user');
    this.inputClosePin = document.querySelector('.form__input--pin');
  }
  #handleActions() {
    this.btnLogin.addEventListener('submit', this.#login.bind(this));
    this.btnTransfer.addEventListener('submit', this.#transferMoney.bind(this));
    this.btnClose.addEventListener('submit', this.#closeAccount.bind(this));
  }
  #displayMovements(account) {
    console.log(account);
    account.movements.forEach((movement, index) => {
      const typeMovement = movement < 0 ? 'withdrawal' : 'deposit';
      const order = index + 1;
      const html = `<div class="movements__row">
        <div class="movements__type movements__type--${typeMovement}">${order} ${typeMovement}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${movement} €</div>
      </div>`;
      this.containerMovements.insertAdjacentHTML('afterbegin', html);
    });
  }
  #createUsername(accounts) {
    accounts.forEach(account => {
      account.username = account.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join('');
    });
  }
  #displaySummary(account) {
    const income = account.movements
      .filter(movement => movement > 0)
      .reduce((previousMovement, currentMovement) => {
        return previousMovement + currentMovement;
      });

    this.labelSumIn.textContent = `${income}€`;

    const out = account.movements
      .filter(movement => movement < 0)
      .reduce((previousMovement, currentMovement) => {
        return previousMovement + currentMovement;
      });

    this.labelSumOut.textContent = `${out}€`;

    const interest = account.movements
      .filter(movement => movement > 0)
      .map(interest => (interest * 1.2) / 100)
      .reduce((previousMovement, currentMovement) => {
        return previousMovement + currentMovement;
      });

    this.labelSumInterest.textContent = `${interest}€`;
  }
  #login(event) {
    event.preventDefault();
    let data = [...new FormData(this.btnLogin)];
    data = Object.fromEntries(data);
    //prettier-ignore
    const loggedUser = this.#accounts.find(account => account.username === data.username);
    if (!loggedUser) return;
    if (loggedUser?.pin === Number(data.pin)) {
      this.#currentAccount = loggedUser;
      this.containerApp.style.opacity = 1;
      this.btnLogin.reset();
      this.#updateUI(this.#currentAccount);
    }
  }
  #calcAndDisplayBalance(account) {
    //prettier-ignore
    this.#currentAccount.balance = account.movements.reduce((currentMovement, nextMovement) => currentMovement + nextMovement, 0 );
    this.labelBalance.textContent = `${this.#currentAccount.balance}€`;
  }
  #updateUI(account) {
    this.#displayMovements(account);
    this.#displaySummary(account);
    this.#calcAndDisplayBalance(account);
  }
  #transferMoney(event) {
    event.preventDefault();
    const data = [...new FormData(this.btnTransfer)];
    const { account, amount } = Object.fromEntries(data);
    if (!account || !Number(amount)) return;
    const receiverAccount = this.#accounts.find(
      receiverAccount => receiverAccount.username === account
    );
    //prettier-ignore
    if(this.#currentAccount.balance >= Number(amount) && receiverAccount){
      this.#currentAccount.movements.push(-Number(amount));
      receiverAccount.movements.push(Number(amount));
      this.#updateUI(this.#currentAccount);

    }
  }
  #closeAccount(event) {
    event.preventDefault();
    let data = [...new FormData(this.btnClose)];
    const { username, pin } = Object.fromEntries(data);
    //prettier-ignore
    if(username === this.#currentAccount.username && Number(pin) === this.#currentAccount.pin){
      const indexCloseAccount = this.#accounts.findIndex(account => account.username === username);
      this.#accounts.splice(indexCloseAccount, 1);
      this.containerApp.style.opacity = 0;
    }
    this.btnClose.reset();
  }
}

const BankistApp = new Bankist(accounts);
