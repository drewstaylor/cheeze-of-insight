export default function getRepAddress(networkId: string) {
  switch (parseInt(networkId)) {
    // Mainnet
    case 1:
      return "0x1985365e9f78359a9b6ad760e32412f4a445e862";
    // Case Rinkeby
    case 4:
      return "0xDE24730E12C76a269E99b8E7668A0b73102AfCa1";
    // Case Kovan
    case 42:
      return "0x4c7493b70f16bec1e087bf74a31d095f9b8f9c40";
    default:
      return false;
  }
}
