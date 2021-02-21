const Mensal = {
  open() {
    document.querySelector('.mensal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('.mensal-overlay').classList.remove('active')
  }
}

const Modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const MonthlyTransactions = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:monthlytransactions")) || []
  },
  set(monthly) {
    localStorage.setItem("dev.finances:monthlytransactions", JSON.stringify(monthly))
  }
}

const Transaction = {
  all: Storage.get(),

  monthly: MonthlyTransactions.get(),


  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  addMonthly(transaction) {
    Transaction.monthly.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  removeMonthly(index) {
    Transaction.monthly.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })
    Transaction.monthly.forEach((transaction) => {
      if (transaction.mamount > 0) {
        income += transaction.mamount
      }
    })
    return income;
  },

  expenses() {
    let expenses = 0
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
         expenses += transaction.amount
      }
    })
    Transaction.monthly.forEach((transaction) => {
      if (transaction.mamount < 0) {
        expenses += transaction.mamount
      }
    })
    return expenses;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {

  transactionContainer: document.querySelector('#data-table tbody'),

  transactionMonth: document.querySelector('#months'),

  getDate() {
    const months = {
      0: "Janeiro",
      1: "Fevereiro",
      2: "Março",
      3: "Abril",
      4: "Maio",
      5: "Junho",
      6: "Julho",
      7: "Agosto",
      8: "Setembro",
      9: "Outubro",
      10: "Novembro",
      11: "Dezembro"
    }
    let date = new Date()
    return `${months[date.getMonth()]}`
  },

  updateMonth() {
    const month = document.querySelector('#currentMonth')
    month.innerHTML = DOM.getDate()

    return month
  },
  
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    DOM.transactionContainer.appendChild(tr)
  },

  addMonthlyTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.classList.add('monthly')
    tr.innerHTML = DOM.insertMonthly(transaction, index)
    tr.dataset.index = index
    DOM.transactionContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expenses";
    const amount = Utils.formatCurrency(transaction.amount)
    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
    </td>
  `
  return html
  },

  insertMonthly(transaction, index) {
    const CSSclass = transaction.mamount > 0 ? "income" : "expenses";
    const amount = Utils.formatCurrency(transaction.mamount)
    const html = `
    <td class="description monthly bg">${transaction.mdescription}</td>
    <td class="${CSSclass} monthly md">${amount}</td>
    <td class="date monthly md">${Utils.formatMonthlyDate(transaction.mdate)}</td>
    <td class="monthly nd">
      <img onclick="Transaction.removeMonthly(${index})" src="./assets/minus.svg" alt="Remover Transação">
    </td>
  `
    return html
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionContainer.innerHTML = ""
  },

}

const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100

    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatMonthlyDate(day) {
    let date = new Date();
    return `${day}/${date.getMonth() + 1}/${date.getFullYear()}` 
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    return signal + value
  }
}

const Mform = {
  mdescription: document.querySelector('input#mdescription'),
  mamount: document.querySelector('input#mamount'),
  mdate: document.querySelector('input#mdate'),

  getMensalValues() {
    return {
      mdescription: Mform.mdescription.value,
      mamount: Mform.mamount.value,
      mdate: Mform.mdate.value
    }
  },

  validateMensalField() {
    const {mdescription, mamount, mdate} = Mform.getMensalValues()

    if (mdescription.trim() === "" || mamount.trim() === "" || mdate.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatMensalValues() {
    let {mdescription, mamount, mdate} = Mform.getMensalValues()
    mamount = Utils.formatAmount(mamount)

    return {
      mdescription,
      mamount,
      mdate,
    }
  },

  clearFields() {
    Mform.mdescription.value = ""
    Mform.mamount.value = ""
    Mform.mdate.value = ""
  },

  saveTransaction(transaction) {
    Transaction.addMonthly(transaction)
  },

  submit(event) {
    event.preventDefault()

    try {
      Mform.validateMensalField()
      const transaction = Mform.formatMensalValues()
      Mform.saveTransaction(transaction)
      Mform.clearFields()
      Mensal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateField() {
    const {description, amount, date} = Form.getValues()

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let {description, amount, date} = Form.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date,
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateField()
      const transaction = Form.formatValues()
      Form.saveTransaction(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  }  
}


Storage.get()

MonthlyTransactions.get()

const App = {
  init() {
    DOM.updateMonth()
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    })

    Transaction.monthly.forEach((transaction, index) => {
      DOM.addMonthlyTransaction(transaction, index);
    })
    
    DOM.updateBalance()

    Storage.set(Transaction.all)

    MonthlyTransactions.set(Transaction.monthly)
  
  },
  
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()