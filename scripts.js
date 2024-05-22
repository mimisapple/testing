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


// JavaScript code for handling form submissions, generating keys, etc.
// This file will be shared across all pages as it contains common functionality.

// Function to generate a random string of a specified length
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to generate a private key
function generatePrivateKey() {
    return '0x' + generateRandomString(64); // Assuming a traditional crypto private key format with added zeros
}

// Function to generate a public key
function generatePublicKey() {
    return '0x' + generateRandomString(66); // Assuming a traditional crypto public key format with added zeros
}

// Function to handle login form submission
function handleLoginFormSubmit(event) {
    event.preventDefault();
    // Implement login logic here
    console.log('Login form submitted');
    // Redirect to wallet profile page after successful login
    window.location.href = 'profile.html';
}

// Function to handle create account form submission
function handleCreateAccountFormSubmit(event) {
    event.preventDefault();
    // Implement account creation logic here
    console.log('Create account form submitted');
    // Generate private and public keys
    const privateKey = generatePrivateKey();
    const publicKey = generatePublicKey();
    // Update DOM to display keys
    document.getElementById('private-key').textContent = privateKey;
    document.getElementById('public-key').textContent = publicKey;
}

// Function to handle transaction form submission
function handleTransactionFormSubmit(event) {
    event.preventDefault();
    // Implement transaction processing logic here
    console.log('Transaction form submitted');
}

// Add event listeners for form submissions
document.getElementById('login-form').addEventListener('submit', handleLoginFormSubmit);
document.getElementById('create-account-form').addEventListener('submit', handleCreateAccountFormSubmit);
document.getElementById('transaction-form').addEventListener('submit', handleTransactionFormSubmit);

// Function to handle form submission
document.getElementById('create-account-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const firstName = document.getElementById('firstName').value;
    // Get other form data (last name, email, phone number, zip code)

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate password and confirm password match
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    // If passwords match, proceed with account creation
    // You can implement further logic here (e.g., sending data to server)

    // Clear form fields
    this.reset();
});

// Function to redirect to login page after account creation
function redirectToLogin() {
    window.location.href = 'login.html'; // Redirect to login page
}

function login() {
    // Get form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const zipCode = document.getElementById('zipCode').value;

    // Store form data in localStorage (you can use other methods like cookies or session storage)
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('email', email);
    localStorage.setItem('phone', phone);
    localStorage.setItem('zipCode', zipCode);

    // Redirect to profile page
    window.location.href = 'profile.html';
}
