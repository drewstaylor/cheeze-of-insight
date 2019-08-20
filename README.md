# Cheeze of Insight

<p align="center">
  <img src="https://pbs.twimg.com/profile_images/724361623335362565/hnYhOeHl_400x400.jpg" alt="Cheeze of Insight"/>
</p>


## ABSTRACT

As a team built from players of Satoshi’s Treasure, we’re uniquely aware of the role statistics can have on gameplay and player
psychology. Enter _Cheese of Insight_. The _Cheeze of Insight_ DApp is a web application and browser extension designed to enrich player psychology by providing methods for realistic and test battle predictions, and a module for doing deep analytics of battle history. More specifically, _Cheese of Insight_ approaches player psychology using a three-pronged method that includes: an **Analytics** component, a **Battle** component, and a **Prediction Market** component.

- **Analytics Component:** 

    1. The **Analytics** component and its UI, provides players with a frontend for analyzing individual Wizards and battle history during and throughout the tournament.

    2. The **Analytics** component provides methods for comparing, grouping and sorting Wizards, and for listing Wizards owned by the connected _Metamask_ / _Dapper_ wallet.

- **Battle Component:** 

    1. This magic of how this component works is made possible by our modified Wizards contract that can “re-mint” specific Mainnet Wizards and import them into our own contract deployed on Rinkeby; this allows players to battle replicated versions of their Mainnet Wizards in a test environement against orth replicated versions of Mainnet Wizards.  

    2. When playing a test match, the human player invoking the Duel chooses whether they wish to dictate their opponent’s turn commitments, or have oponnent turns instead dictated by our super smart (and super dumb) AI. The AI player we’ve created, analyzes a Wizard’s match history, to find turn play patterns specific to that Wizard. Like a fine cheese, our AI matures with age, so our AI's predictions become more trustworthy as the tournament progresses. 

    4. Since the reliability of our AI's match predictions is in many ways proportional to the data available from a tournament’s match history, we can say our AI begins a tournament “dumb” and ends the tournament “smart”. 

- **Prediction Market Component:** 

    1. Decentralized prediction markets can be used to generate sets of tokens that represent a financial stake in the outcomes of any event.  

    2. By combining the _0x Protocol_ with an _Augur_ prediction market and open source code from _Veil_, once phase Phase III of the tournament has is reached our platform automatically begins launching prediction markets that speculate on each daily Duel window. 

    3. Each day, before each Dueling window, 2 categories of prediction markets will be launched, and this will acount for a total of 10
            prediction markets launched daily throughout Phase III of the tournament: 

    - **Market type #1)** 5 separate markets will be created to bet on whether each of the 5 most powerful Wizards will either _increase_ or _decrease_ in power level. If the Wizard's power level does not change, the market is invalidated and all bets will be returned to all betters at their original value. 

    - **Market type #2)** 5 separate markets will be created to bet on whether each of the 5 most "volatile" Wizards, from the previous day's Dueling window, will either _increase_ or _decrease_ in power level. If the Wizard's power level does not change, all bets will be returned at their original rate. We consider the 5 most "volatile" Wizards to be the 5 Wizards whose power levels fluctuated by the greatest margin during the previous day's Duel history (this perhaps is one indication of the most active players). 

    4. Using _0x_, the order book for our **Prediction Markets** are kept offline to limit gas transactions, and both LONG and SHORT tokens get merged into a single order book. 

    5. As the Blue Mold begins to show its effects, this **Prediction Market** will become a place where players who no longer have Wizards in the tournament (_"rind-in-the-game"_) can continue to follow along and participate in battles.
