// Transaction class
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }

    // Serialize transaction as a string
    toString() {
        return JSON.stringify(this);
    }
}

// Block class
class Block {
    constructor(prevHash, transaction, ts = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.numOnlyUsedOnce = Math.round(Math.random() * 999999999);
    }

    // Getter method to return a hash of this block
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex')
    }
}

// Chain class
class Chain {
    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'godwin'))];
    }

    // Return the last block in the chain
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Mine a block to confirm it as a transaction on the blockchain
    mine(numOnlyUsedOnce) {
        let solution = 1;
        console.log('🐢 Mining transaction...')

        // Keep looping until solution is found
        while(true) {
            const hash = crypto.createHash('MD5');
            hash.update((numOnlyUsedOnce + solution).toString()).end();

            const attempt = hash.digest('hex')

            // Add more 0's to make it harder
            if (attempt.substr(0, 4) === '0000'){
                console.log(`---> Solved transaction with solution: ${solution}. Block is confirmed!\n`);
                return solution
            }

            solution += 1
        }
    }

    // Add a block to the blockchain
    addBlock(transaction, senderPublicKey, signature) {
        console.log("🐢 Sending AXIS...")

        // Verify a transaction before adding it
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());

        const isValid = verifier.verify(senderPublicKey, signature);

        // If it is valid, create a block, mine it and add it to the blockchain
        if (isValid) {
            console.log("🐢 Transaction is valid!")
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.numOnlyUsedOnce);
            this.chain.push(newBlock);
        }
    }
}

// Wallet class
class Wallet {
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }

    // Send money from users wallet to another
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();

        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}

// Initialize wallet
const wallet = new Wallet();

// Display public and private keys
document.getElementById('public-key').textContent = wallet.publicKey;
document
