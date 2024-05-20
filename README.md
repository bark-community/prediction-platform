<img src="https://github.com/bark-community/prediction-platform/blob/2d4064427cffeac51cb457921435f16605be84af/github/github-header.png" alt="BARK Prediction dApp" width="2000">

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Features:](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Users are able to:](#users-are-able-to)
- [Jupiter Terminal V2](#jupiter-terminal-v2)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction
Welcome to BARK Prediction dApp! This decentralized application (dApp) built on the Solana blockchain empowers users to participate in prediction markets and unleash predictive insights on Solana.

## Features:
- **Prediction Markets:** Participate in prediction markets on various assets.
- **Real-time Price Feeds:** Access up-to-date asset prices including SOL, BARK, BTC, ETH, and more.
- **Token Swapping:** Seamlessly swap tokens across different clusters. Swap tokens using Jupiter Terminal V2 - Works only mainnet and need custom RPC or Jupiter API.
- **Account Management:** View balance, transaction history, and more.
- **Donation Functionality:** Contribute to charitable causes directly from the dApp.
- **Integration with BARK Token:** Stake BARK tokens, vote on governance proposals, and access premium features.
- **Cross-Chain Compatibility:** Interact with the dApp using assets from different blockchain networks.
- **Decentralized Governance:** Participate in decision-making processes related to platform upgrades and feature enhancements.
- **Privacy Features:** Prioritize user privacy and confidentiality through privacy-enhancing technologies.

## Installation
To install and run the BARK Prediction dApp locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/bark-community/prediction-platform.git
   ```

2. Install dependencies:

   ```bash
   pnpm install && npx @next/codemod new-link .
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Visit `http://localhost:3000` in your browser to access the dApp.

## Usage
Once the dApp is running, you can start exploring the prediction markets, accessing real-time price feeds, managing your account, and contributing to charitable causes directly from the interface. Follow the on-screen instructions to navigate through the features and functionalities of the dApp.

### Users are able to:

1. Users can now connect to the app with their crypto wallet using the Solana Wallet Adapter.
2. Implemented functionality to create and mint basic SPL tokens.
3. Added support for creating and minting tokens with metadata using Metaplex MPL-Token-Metadata.
4. Users can now connect to all available Chainlink Price Feeds and view real-time price updates on the Devnet for assets like SOL, BTC, ETH, LINK, USDC, and USDT.
5. Enabled token swapping functionality using Jupiter Terminal V2.
6. Implemented the ability for users to switch between different clusters: Devnet, Local, Testnet, and Mainnet.
7. Users can now view their SOL account balance within the app.
8. Added functionality for users to view their transaction history.
9. Users can now open transaction details in the block explorer directly from the app.
10. Implemented a feature for users to request an airdrop on the Devnet.
11. Added functionality for users to send SOL to other addresses.
12. Implemented the ability for users to copy their address to the clipboard for requesting SOL.


## Jupiter Terminal V2

To integrate token swapping using Jupiter Terminal V2, which works only on the mainnet.

1. **Integration with Jupiter Terminal V2 API**: Incorporate the Jupiter Terminal V2 API into your application to enable token swapping functionality. You'll need to make API requests to perform token swaps, so ensure you have the necessary endpoints and authentication tokens.

2. **Custom RPC or Jupiter API Configuration**: Set up a custom RPC endpoint or use the Jupiter API to interact with the Jupiter Terminal V2. This involves configuring part of application to communicate with the appropriate network and endpoints required for token swapping.

3. **User Interface for Token Swapping**: Design and implement a user interface within your application to facilitate token swapping. This interface should allow users to select the BARK and other tokens they want to swap, specify the amount, and initiate the swap transaction.

4. **Transaction Handling**: Implement logic to handle token swap transactions securely within your application. This includes validating user inputs, executing API requests to initiate swaps, and handling transaction responses (success or failure) from the Jupiter Terminal V2.

5. **Error Handling and Feedback**: Implement error handling and feedback mechanisms to users during the token swapping process. Inform users of transaction status updates, errors, or any other relevant information to ensure a smooth user experience.

6. **Testing and Optimization**: Test the token swapping functionality thoroughly to identify and address any bugs or issues. Optimize the performance of your application to ensure seamless token swapping experiences for users.

7. **Documentation and Support**: Document the token swapping feature within prediction dApp, including usage instructions and any prerequisites. Provide support resources or assistance channels for users who may encounter difficulties during the token swapping process.

8. **Implementation: Liquidity Pools and API**
- MarginFi: https://www.marginfi.com/

## Documentation
For detailed project documentation, please visit [Project Documentation](https://github.com/bark-community/prediction-platform/blob/main/docs/).

## Contributing
Contributions are welcome! If you'd like to contribute to the BARK Prediction dApp, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Create a new Pull Request.

Please ensure that your contributions adhere to the project's coding standards and follow the [Contributor Covenant](CONTRIBUTING.md).

## License
[MIT License](LICENSE).
