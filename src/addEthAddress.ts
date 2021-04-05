const sourcecred = require('sourcecred').sourcecred;
const fs = require("fs-extra")
const Ledger = sourcecred.ledger.ledger.Ledger;
const LEDGER_PATH = 'data/ledger.json';

const nodePrefix = sourcecred.core.graph.NodeAddress.fromParts([
    "sourcecred",
    "ethereum"
]);

const env = process.argv.slice(2);

async function main(env:any) {
    const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
    const ledger = Ledger.parse(ledgerJSON);
    
    if(env.length != 2){
        console.error("[Error] command usage: addEthAddress.js [DiscordId|LedgerId] [ethAddress]")
        return
    } 
   
    const accountId = env[0];
    const ethAddress = env[1];
    
    if(!validateInputAddresses(ethAddress)) console.error("[Error] Not a valid ethAddress")
    const ledgerAccount = ledger.accounts().filter( (account:any) => account.identity.id === accountId);
    let account;
    if(ledgerAccount.length == 0){
        const discordIdentity = sourcecred.core.graph.NodeAddress.append(
            sourcecred.plugins.discord.declaration.memberNodeType.prefix,
            "user",
            accountId
        );
        const linkedAccount = ledger.accountByAddress(discordIdentity);
        if (!linkedAccount) {
            console.error("[Error] DiscordId or LedgerId not found!")
            return
        }
        account = linkedAccount;
    }else {
        account = ledgerAccount;
    }

    let address = sourcecred.core.graph.NodeAddress.append(nodePrefix, accountId, ethAddress);

    const ethLinkedAccount = ledger.accountByAddress(address);
    if (ethLinkedAccount) {
        console.error("[Error] Eth Account already registered")
        return;
    }

    let prevEthAddressAlias = account.identity.aliases.filter((alias: any) => alias.address.startsWith(nodePrefix) === true)
    var alias = {
        description: "ethereum/" + prevEthAddressAlias.length + "/" + ethAddress,
        address: address
    }
    console.log("added: " + alias.description + " to: " + account.identity.name )
    ledger.addAlias(account.identity.id, alias);
    saveLedger(ledger)
}

main(env);


function validateInputAddresses(address:any ) {
        return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}

async function saveLedger(ledger: any) {
    await fs.writeFile(LEDGER_PATH, ledger.serialize());
}