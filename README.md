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

FestMarket -> bfetchFestTicketsInSecondaryMarket() -> views all NFT tickets on sale.

```
