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
        console.log("🐢 Sending TurtleCoin...");

        const encoder = new TextEncoder();
        const data = encoder.encode(transaction.toString());

        const key = await crypto.subtle.importKey(
            'spki',
            this.base64ToArrayBuffer(senderPublicKey),
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256'
            },
            true,
            ['verify']
        );

        const isValid = await crypto.subtle.verify(
            'RSASSA-PKCS1-v1_5',
            key,
            this.base64ToArrayBuffer(signature),
            data
        );

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

    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    displayBlockchain() {
        const output = document.getElementById('blockchain-output');
        output.innerHTML = '';

        Chain.instance.chain.forEach(block => {
            const blockElem = document.createElement('div');
            blockElem.className = 'block';
            blockElem.textContent = `
                Previous Hash: ${block.prevHash}
                Transaction: ${block.transaction.toString()}
                Timestamp: ${block.ts}
                Nonce: ${block.numOnlyUsedOnce}
                Hash: ${block.hash}
            `;
            output.appendChild(blockElem);
        });
    }
}

class Wallet {
    constructor() {
        this.generateKeys();
    }

    async generateKeys() {
        const keypair = await crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['sign', 'verify']
        );

        this.privateKey = await crypto.subtle.exportKey('pkcs8', keypair.privateKey);
        this.publicKey = await crypto.subtle.exportKey('spki', keypair.publicKey);

        document.getElementById('public-key').textContent = this.arrayBufferToBase64(this.publicKey);
        document.getElementById('private-key').textContent = this.arrayBufferToBase64(this.privateKey);
        document.getElementById('wallet-keys').style.display = 'block';
    }

    async sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.arrayBufferToBase64(this.publicKey), payeePublicKey);

        const sign = await crypto.subtle.sign(
            {
                name: 'RSASSA-PKCS1-v1_5',
            },
            await crypto.subtle.importKey('pkcs8', this.privateKey, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, true, ['sign']),
            new TextEncoder().encode(transaction.toString())
        );

        Chain.instance.addBlock(transaction, this.arrayBufferToBase64(this.publicKey), this.arrayBufferToBase64(sign));
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach((b) => binary += String.fromCharCode(b));
        return window.btoa(binary);
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
``
