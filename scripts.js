const wordList = [
    "apple", "orange", "banana", "grape", "pear", "peach", "plum", "berry", "melon", "kiwi",
    "lime", "lemon", "cherry", "fig", "date", "mango", "papaya", "guava", "apricot", "avocado"
];

class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    
    toString() {
        return JSON.stringify(this);
    }
}

class Block {
    constructor(prevHash, transaction, ts = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.numOnlyUsedOnce = Math.round(Math.random() * 999999999);
    }

    get hash() {
        const str = JSON.stringify(this);
        return CryptoJS.SHA256(str).toString();
    }
}

class Chain {
    static instance = new Chain();

    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'godwin'))];
    }

    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    async addBlock(transaction, senderPublicKey, signature) {
        console.log("🐢 Sending AXIS...");

        const encoder = new TextEncoder();
        const data = encoder.encode(transaction.toString());

        const isValid = this.verifySignature(senderPublicKey, signature, data);

        if (isValid) {
            console.log("🐢 Transaction is valid!");
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.numOnlyUsedOnce);
            this.chain.push(newBlock);
            this.displayBlockchain();
        } else {
            alert("Transaction is invalid!");
        }
    }

    verifySignature(publicKey, signature, data) {
        // Simplified verification using HMAC for mnemonic keys
        const key = CryptoJS.enc.Hex.parse(publicKey);
        const hash = CryptoJS.HmacSHA256(data, key).toString();
        return hash === signature;
    }

    mine(numOnlyUsedOnce) {
        let solution = 1;
        console.log('🐢 Mining transaction...');

        while (true) {
            const hash = CryptoJS.MD5((numOnlyUsedOnce + solution).toString()).toString();

            if (hash.substr(0, 4) === '0000') {
                console.log(`---> Solved transaction with solution: ${solution}. Block is confirmed!\n`);
                return solution;
            }

            solution += 1;
        }
    }

    displayBlockchain() {
    const output = document.getElementById('blockchain-output');
    output.innerHTML = '';

    Chain.instance.chain.forEach(block => {
        const blockElem = document.createElement('div');
        blockElem.className = 'block';
        blockElem.innerHTML = `
            <div class="transaction-info">
                <p>Transaction: ${block.transaction.toString()}</p>
                <p>Timestamp: ${block.ts}</p>
                <p>Nonce: ${block.numOnlyUsedOnce}</p>
                <p>Hash: ${block.hash}</p>
            </div>
        `;
        output.appendChild(blockElem);
    });

    }
}

class Wallet {
    constructor() {
        this.generateKeys();
    }

    generateKeys() {
        this.privateKey = this.generateMnemonicKey();
        this.publicKey = this.generateMnemonicKey();

        document.getElementById('public-key').textContent = this.publicKey;
        document.getElementById('private-key').textContent = this.privateKey;
        document.getElementById('wallet-keys').style.display = 'block';
    }

    generateMnemonicKey() {
        let key = '';
        while (key.length < 20) {
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            if (key.length + word.length <= 20) {
                key += word;
            }
        }
        return key;
    }

    async sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const signature = this.signTransaction(transaction);

        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }

    signTransaction(transaction) {
        // Simplified signing using HMAC for mnemonic keys
        const key = CryptoJS.enc.Hex.parse(this.privateKey);
        const data = CryptoJS.enc.Utf8.parse(transaction.toString());
        return CryptoJS.HmacSHA256(data, key).toString();
    }
}

document.getElementById('generate-wallet').addEventListener('click', function() {
    window.wallet = new Wallet();
});

document.getElementById('transaction-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const payee = document.getElementById('payee').value;

    if (window.wallet) {
        window.wallet.sendMoney(amount, payee);
    } else {
        alert('Please generate a wallet first!');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    Chain.instance.displayBlockchain();
});

// Authentication Logic
const accounts = JSON.parse(localStorage.getItem('accounts')) || {};

document.getElementById('create-account-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    if (accounts[username]) {
        alert('Username already exists!');
    } else {
        accounts[username] = password;
        localStorage.setItem('accounts', JSON.stringify(accounts));
        alert('Account created successfully!');
    }
});

document.getElementById('sign-in-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (accounts[username] && accounts[username] === password) {
        alert('Sign in successful!');
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('wallet-section').style.display = 'block';
        document.getElementById('transaction-form').style.display = 'block';
    } else {
        alert('Invalid username or password!');
    }
});
