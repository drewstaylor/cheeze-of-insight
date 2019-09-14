## Cheeze of Insight Market Creation

Adapted from Veil's market creation interface, this tool lets you easily create and update draft markets, and activate them when they're ready.

See Veil's implementation here: [https://create.veil.co](https://create.veil.co)

### Development

To run locally, you must clone this repo and install the dependencies (we prefer using [yarn](https://yarnpkg.com/en/)):

You'll need an Ethereum node connect to set to KOVAN (networkId: 42) or MAINNET (networkId: 1), so update the `ETHEREUM_HTTP` variable in `.env` to a publicly-accessible Ethereum node RPC URL (such as an [Infura](https://infura.io/) or [Alchemy](https://alchemyapi.io/) endpoint).

You'll also need a local PostgreSQL database named `coi_market_creation` with a `coi` user (or you can tweak `knexfile.js` to match your environment).

Once you have that, you can start the backend endpoint (powered by GraphQL):

```bash
yarn migrate
yarn dev:api
```

And in a separate terminal, start the frontend server:

```bash
yarn dev:web
```

You should be able to head to `localhost:9000` to see the app.