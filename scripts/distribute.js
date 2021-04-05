const sourcecred = require('sourcecred').sourcecred;
const fs = require("fs-extra")
let zksync = require('zksync');
let ethers = require('ethers');
const dotenv = require('dotenv').config();
const Ledger = sourcecred.ledger.ledger.Ledger;
const G = sourcecred.ledger.grain;
const LEDGER_PATH = 'data/ledger.json';

const DAPPNODE_BOT_DISCORD_ID = "mO3FKOU7dkON3XTyKan53Q";
const MINIMAL_PAN_BALANCE = 60000000000000000000
const TOKEN = 'PAN'

const nodePrefix = sourcecred.core.graph.NodeAddress.fromParts([
    "sourcecred",
    "ethereum"
]);

(async () => {
    const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
    const ledger = Ledger.parse(ledgerJSON);
    const accounts = ledger.accounts();

    // ZKSYNC setup
    const syncProvider = await zksync.getDefaultProvider(process.env.NETWORK);
    const ethersProvider = ethers.getDefaultProvider(process.env.NETWORK);
    const ethWallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
    if (! await syncWallet.isSigningKeySet()) {
        const changePubkey = await syncWallet.setSigningKey({
            feeToken: process.env.TOKEN
        });

        // Wait till transaction is committed
        const receipt = await changePubkey.awaitReceipt();
    }

    const pending = accounts.filter(account =>
        account.balance > MINIMAL_PAN_BALANCE &&
        account.identity.aliases.filter(
            alias => alias.address.startsWith(nodePrefix) === true
        ).length != 0);

    for (let i = 0; i < pending.length; i++) {
        let account = pending[i];
        const ethAlias = account.identity.aliases.filter(
            alias => alias.address.startsWith(nodePrefix) === true
        );
        let lastAddress = ethAlias.find(alias => alias.description.startsWith('ethereum/' + (ethAlias.length - 1)) === true)
            .description.replace('ethereum/' + (ethAlias.length - 1) + '/', '')

        if (lastAddress === "0x0000000000000000000000000000000000000000") {
            console.log(`Account ${account.identity.name} has been deactivated`)
            return
        }
        
        const amount = zksync.utils.closestPackableTransactionAmount(account.balance);
        try {
            const transfer = await syncWallet.syncTransfer({
                to: lastAddress,
                token: process.env.TOKEN,
                amount
            });

            const transferReceipt = await transfer.awaitReceipt();
            if(!transferReceipt || !transferReceipt.executed || !transferReceipt.success) {
                console.error(transferReceipt.failReason)
                process.exit(1);
            }
            console.log("Successfully sent to: " + account.identity.name + " " + amount.toString() + " " + process.env.TOKEN + " : " + "https://zkscan.io/transactions/" + transfer.txHash )
            ledger.transferGrain({
                to: DAPPNODE_BOT_DISCORD_ID,
                from: account.identity.id,
                amount: amount.toString(),
                memo: "https://zkscan.io/transactions/" + transfer.txHash
            })
            saveLedger(ledger)
        } catch (error) {
            console.error(error)
            process.exit(1);
        }

    }
})();

async function saveLedger(ledger) {
    await fs.writeFile(LEDGER_PATH, ledger.serialize());
}