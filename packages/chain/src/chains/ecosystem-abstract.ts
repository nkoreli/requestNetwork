import { ChainTypes, RequestLogicTypes } from '@requestnetwork/types';
import { ChainAbstract } from './chain-abstract';

export abstract class EcosystemAbstract<CHAIN extends ChainTypes.IChain> {
  constructor(
    public name: ChainTypes.ChainEcosystem,
    public chainClass: new (id: string, name: string, testnet?: boolean) => CHAIN,
    public chains: Record<string, CHAIN>,
    public currencyType: RequestLogicTypes.CURRENCY,
  ) {
    // this.addNativeCurrenciesToChains(currencyType);
  }

  get chainNames(): string[] {
    return Object.keys(this.chains);
  }

  /**
   * Adds the native currency to the list of currencies supported by each chain
   */
  // private addNativeCurrenciesToChains(
  //   currencyType: RequestLogicTypes.CURRENCY.ETH | RequestLogicTypes.CURRENCY.BTC,
  // ): void {
  //   this.chainNames.forEach((chainName) => {
  //     const nativeCurrency = (
  //       nativeCurrencies[currencyType] as CurrencyTypes.NamedNativeCurrency[]
  //     ).find((currency) => currency.network === chainName);
  //     if (nativeCurrency) {
  //       const chainCurrencies: TokenMap = this.chains[chainName].currencies || {};
  //       chainCurrencies.native = nativeCurrency;
  //       this.chains[chainName].currencies = chainCurrencies;
  //     }
  //   });
  // }

  /**
   * Check if chainName lives amongst the list of supported chains by this chain type.
   * Throws in the case it's not supported.
   */
  public assertChainNameSupported(chainName?: string) {
    if (!this.isChainSupported(chainName)) throw new Error(`Unsupported chain ${chainName}`);
  }

  /**
   * Check if chainName lives amongst the list of supported chains by this chain type.
   * Throws in the case it's not supported.
   */
  public assertChainSupported(chain?: ChainAbstract): asserts chain is CHAIN {
    if (!this.isChainSupported(chain)) throw new Error(`Unsupported chain ${chain?.name}`);
  }

  /**
   * Check if chainName lives amongst the list of supported chains by this chain type.
   */
  public isChainSupported(chainName?: string | ChainAbstract) {
    return (
      !!chainName &&
      this.chainNames.includes(chainName instanceof ChainAbstract ? chainName.name : chainName)
    );
  }

  /**
   * Retrieve the corresponding chain ID from Request Network's internal chain name representation
   */
  public getChainId(chainName: string): string {
    return this.chains[chainName].id;
  }

  /**
   * Returns true is the chain is a testnet chain
   */
  public isTestnet(chainName: string): boolean {
    return Boolean(this.chains[chainName].testnet);
  }

  /**
   * @returns true if both chains have the same ID or same name
   */
  private isSameChain = (chain1: string, chain2: string): boolean => {
    return chain1 === chain2 || this.getChainId(chain1) === this.getChainId(chain2);
  };

  /**
   * @returns true if both chains have the same ID or same name
   */
  public isSameChainFromString = (chain1: string, chain2: string): boolean => {
    try {
      this.assertChainNameSupported(chain1);
      this.assertChainNameSupported(chain2);
    } catch {
      return false;
    }
    return this.isSameChain(chain1, chain2);
  };
}