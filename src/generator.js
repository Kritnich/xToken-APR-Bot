const { MessageEmbed } = require('discord.js');
const { ethers, BigNumber } = require("ethers");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { XToken } = require("@xtoken/js");
const axios = require("axios");
const urql = require("@urql/core");
const fetch = require("node-fetch");

const { provider } = require("./provider.js");
const StakingRewardsAbi = require("./StakingRewards.json");
const pools = require("../pools.json");
const xtkAddr = "0x7f3edcdd180dbe4819bd98fee8929b5cedb3adeb";
const DEC_18 = ethers.constants.WeiPerEther;

const xtoken = new XToken(provider);

const urqlClient = urql.createClient({
  url: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  fetch: fetch
});

const uniUsdQuery = `
  query GetReserveUsd($id: ID!) {
    pair(id: $id) {
      reserveUSD
      totalSupply
    }
  }
`;

async function getPoolInfo(pool, xtkPrice, xAssets, xlpAssets, lpItems) {
  
  const poolContract = new ethers.Contract(pool.addr, StakingRewardsAbi, provider);
  const periodFinish = (await poolContract.periodFinish()).toNumber() * 1000;

  if (periodFinish < Date.now()) {
    // Incentive program has ended, no need to calculate anything
    console.log(`Incentive period for ${pool.name} has ended, skipping`);
    return {
      apr: 0,
      periodFinish: periodFinish,
      active: false
    }
  }

  const rewardRate = await poolContract.rewardRate();
  const totalStaked = await poolContract.totalSupply();

  if (pool.name == "XTK-WETH LP") {

    /* xToken/js doesn't provide information about the XTK-WETH Uni v2 pool
     * Fetch the total value from graphprotocol instead and calculate price
     */
    var { reserveUSD, totalSupply } = (await urqlClient.query(uniUsdQuery, { 
      id: "0x2fba756c64d4f9dbb17f1b3a1afb5f05af7f18c0"
    }).toPromise()).data.pair;

    var reserveUSD = parseEther(parseFloat(reserveUSD).toFixed(18));
    var totalSupply = parseEther(totalSupply);

    var price = reserveUSD
      .div(totalSupply)
      .mul(DEC_18);

  } else {

    switch (pool.type) {
      case 0:
        // Single asset (e.g. xBNTa, xKNCb)
        var { price } = xAssets.find(asset => asset.symbol === pool.name);
        break; 
      case 1:
        // XLPAssets (e.g. xU3LPa, xU3LPb)
        var { price } = xlpAssets.find(asset => asset.symbol === pool.name);
        break;
      case 2:
        // wETH LP (e.g. xSNXa-ETH)
        var price = lpItems.find(item => item.asset === pool.asset).poolPrice;
        break;
    }

    var price = parseEther(price.toString());
  }
  
  var xtkPrice = parseEther(xtkPrice.toString());
  const secondsInYear = BigNumber.from(31536000);

  const usdPerYear = rewardRate
    .mul(xtkPrice)
    .mul(secondsInYear)
    .mul(BigNumber.from(100))

  const totalUsdValue = totalStaked
    .mul(price);

  const apr = usdPerYear.div(totalUsdValue);

  return {
    apr: apr,
    periodFinish: periodFinish,
    active: true
  }
}

async function createEmbed() {
  var embed = new MessageEmbed()
    .setTitle("xToken Incentive Programs")
    .setDescription("These are the currently active incentive programs on https://xtoken.cafe")
    .setColor(0xa425fc)
    .setThumbnail("https://i.imgur.com/BuAp68G.png")
    .setTimestamp(Date.now());

  const xtkPrice = (await axios.get("https://api.coingecko.com/api/v3/simple/token_price/ethereum", {
    "params": {
      "contract_addresses": xtkAddr,
      "vs_currencies": "usd"
    }
  })).data[xtkAddr].usd;
  const xAssets = await xtoken.getXAssets();
  const xlpAssets = await xtoken.getXLPAssets();
  const lpItems = await xtoken.getLiquidityPoolItems();

  console.table(xAssets);
  console.table(xlpAssets);
  console.table(lpItems);

  for (const pool of pools) {
    const { apr, periodFinish, active } = await getPoolInfo(pool, xtkPrice, xAssets, xlpAssets, lpItems);

    if (active) {
      const endDate = new Intl.DateTimeFormat('en-US', {
        "weekday": "short",
        "year": "numeric",
        "month": "short",
        "day": "numeric"
      }).format(new Date(periodFinish));
      embed.addField(pool.name, `${apr}% (until ${endDate})`);
    }
  }

  return embed;
}

module.exports = createEmbed;
