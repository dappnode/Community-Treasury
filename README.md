# DAppNode community contribution

DAppNode as an open source community will encourage people to **contribute** to the DAppNode project, rewarding them with **grain**.

![](https://i.imgur.com/DftcMBF.png)

## What means contribute?

There are a lot of different types of contributions, from a response message in a dicord channel, to a useful thread open in the [forum](https://forum.dappnode.io/). No matters who did the contribution when and how, if it was valuable it will be rewarded.

## What is grain?

Grain is a community-specific digital currency that is issued on the basis of Cred scores. Grain represents how much a participant has supported that community, either through contributions or financial support.

## Who will rank each contribution?

Following DAppNode phylosophy (_decentrallize until it hurts, centrallize until it works_), DAppNode team will not be tracking this community contribution.

Thanks to [Sourcecred](https://sourcecred.io/), there will be used an elaborated system where the community itself will rate each contribution. The better a contribution is rated, the more will be rewarded.

## Where to rate contributions?

Sourcecred supports the same plugins DAppNode community has (discord, discourse and github), and ideally these 3 plugins would be tracked. Unfortunately, there are some tecnical complications when using these 3 plugins at the same time, so DAppNode will track only **discord**.

But do not panic! There will be a discord channel **IdidAThing** where contributions beyond discord will be posted and rated as well.

All public discord channels from the DAppNode server will be tracked, exluding the one dedicated to 'Announcements'.

## How to rate contributions ?

As said before, discord will be the platform to rate contributions. We encourage everyone to feel free from rate whatever you want. Ideally, you will have to rate those contributions you think are useful and good quality.

## Reaction weights

Anyone can check the weight used for calculating contributions in this **json file**.

"reactionWeights": {
"👍": 1,
"🔥": 1,
"💯": 1,
"DAppNodeLogoColourAI_NO_LETTERS:784059580577087498": 2
}

## Node and Edge weights

Cred flows from node to node trough edges. These nodes and edges have a weight configuration which is defined in this **json file**.

If you want to learn more about how does this process work, visit the official [documentation](https://sourcecred.io/docs/beta/cred).

## Grain distribution

Distribution has been scheduled for Sundays. First will be computed the cred according to the previous weights configuration.

Cred will be calculated with a time lapse of 24 weeks.

There are 2 possible distributions: **inmediate** and **balanced**. In order to reward past and present contributions DAppNode has chosen to implement a mix distribution with a rate of 3:1 in favor of balanced.

"immediatePerWeek": 2000,
"balancedPerWeek": 7000,
"maxSimultaneousDistributions": 24
