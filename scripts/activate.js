const sourcecred = require('sourcecred').sourcecred;
const fs = require("fs-extra")

const Ledger = sourcecred.ledger.ledger.Ledger;
const LEDGER_PATH = 'data/ledger.json';

const getUnactive = account => account.active === false &&
    account.identity.name != 'lanski' &&
    account.identity.name != 'dapplion' &&
    account.identity.name != 'Tropicar' &&
    account.identity.name != 'pablomendez-95' &&
    account.identity.name != 'eduadiez--DAppNode-';

(async () => {
    const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
    const ledger = Ledger.parse(ledgerJSON);
    const accounts = ledger.accounts();
    let unactive = accounts.filter(getUnactive);

    unactive.forEach(account => {
        console.log("Activating user: " + account.identity.name + " ( id: " + account.identity.id + " )")
        ledger.activate(account.identity.id)
    });
    saveLedger(ledger);

})();

async function saveLedger(ledger) {
    await fs.writeFile(LEDGER_PATH, ledger.serialize());
}