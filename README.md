# Festival Tickets Market

clone the repo with :
```shell
git clone https://github.com/satoshi-u/movie_fest_nft
```

do an npm install for installing project dependencies : 
```shell
npm install
```

To compile the contracts, simply run :
```shell
npx hardhat compile
```

To run the tests, simply run :
```shell
npx hardhat test
```

FLOW (Can try in remix) :
```shell
Deploy MasterERC - it will mint our currency tokens as well as NFT. Provide a "base_uri" in constructor arg.

Deploy FestMarket - it will handle all core flows. Provide  "address{MasterERC}" in constructor arg.

FestMarket -> mintCurrencyToken(1000000) -> mints 1 million tokens with decimal 18.

FestMarket -> buyCurrencyToken(100000000000000000000) {msg.value : 10 eth} -> 100 tokens bought with 10 eth.

MasterERC -> setApprovalForAll(FestMarket.address, true) -> approves MasterERC to carry transfers.

FestMarket -> buyFestTicket(10) -> buys 10 NFT Tickets with {10 currencyToken}.

FestMarket -> listTicketForSale(2, 1.1) {msg.value : 0.025 eth} -> lists NFT for sale @1.1 token price.

FestMarket -> buyTicketOnSale(1) -> buys NFT for sale @1.1 token price.

FestMarket -> fetchFestTicketsInSecondaryMarket() -> views all NFT tickets on secondary market.

```

To do further... 
```shell
Kept storage vars public for ease of testing. To make things pvt. and refctor tests.

Events capturing in tests.
```

To think further... 
```shell
We can't approve contract for say 'x' amount of tokens as in ERC20. In ERC1155, it is setAapprovalForAll!

_lastSalePrice is updated for seller when a ticket is sold in secondary market. Bullet prrof logic ?

Currently, no limit on buying NFT tickets in primary market!

Can more than 1 NFT ticket be listed in secondary market by same address? (friction with _lastSalePrice rule)
```
