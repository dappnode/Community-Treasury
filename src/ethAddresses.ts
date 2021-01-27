import Discord, { TextChannel, Message } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const sourcecred = require('sourcecred').default;
const fs = require("fs-extra")
const Ledger = sourcecred.ledger.ledger.Ledger;
const LEDGER_PATH = 'data/ledger.json';

const nodePrefix = sourcecred.core.graph.NodeAddress.fromParts([
    "sourcecred",
    "ethereum"
]);

export const discordToken = process.env.SOURCECRED_DISCORD_TOKEN;
const FILTER_TEXT = (message: Message) => /^[Cc]laim to 0x[a-fA-F0-9]{40}$/.test(message.content) || /^[Uu]nclaim$/.test(message.content);

const main = async () => {
    
    const client = new Discord.Client();
    await client.login(discordToken);

    // wait to get the data
    await delay(1000);

    // DAppNode ctchannel = 747647430450741309
    let ctChannel = await client.channels.fetch('788165053169401866') as TextChannel;
    let messages = (await ctChannel.messages.fetch()).filter(FILTER_TEXT).sort((x, y) => {
        return x.createdTimestamp - y.createdTimestamp
    });

    const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
    const ledger = Ledger.parse(ledgerJSON);

    messages.map((msg) => {
        let author_id = msg.author.id

        const discordIdentity = sourcecred.core.graph.NodeAddress.append(
            sourcecred.plugins.discord.declaration.memberNodeType.prefix,
            msg.author.bot ? "bot" : "user",
            author_id
        );

        const linkedAccount = ledger.accountByAddress(discordIdentity);
        if (!linkedAccount) {
            return;
        }

        let ethAddress = /^[Cc]laim to 0x[a-fA-F0-9]{40}$/.test(msg.content) ? msg.content.replace(/[cC]laim to /, "") : "0x0000000000000000000000000000000000000000";
        let address = sourcecred.core.graph.NodeAddress.append(nodePrefix, author_id, ethAddress);

        const ethLinkedAccount = ledger.accountByAddress(address);
        if (ethLinkedAccount) {
            return;
        }

        let prevEthAddressAlias = linkedAccount.identity.aliases.filter((alias: any) => alias.address.startsWith(nodePrefix) === true)
        var alias = {
            description: "ethereum/" + prevEthAddressAlias.length + "/" + ethAddress,
            address: address
        }
        console.log("added: " + alias.description + " to: " + linkedAccount.identity.name )
        ledger.addAlias(linkedAccount.identity.id, alias);
    });

    saveLedger(ledger);
    client.destroy();

};

main();

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveLedger(ledger: typeof Ledger) {
    await fs.writeFile(LEDGER_PATH, ledger.serialize());
}