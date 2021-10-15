/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumberish, ContractTransaction, providers, Signer } from 'ethers';
import { erc20EscrowToPayArtifact } from '@requestnetwork/smart-contracts';
import { ERC20EscrowToPay__factory } from '@requestnetwork/smart-contracts/types';
import { ClientTypes, PaymentTypes } from '@requestnetwork/types';
import {
  getAmountToPay,
  getProvider,
  getRequestPaymentValues,
  getSigner,
  validateRequest,
} from './utils';
import { ITransactionOverrides } from './transaction-overrides';

/**
 * Functions in ERC20EscrowToPay Smart-Contract:
 * payEscrow(tokenAddress, , paymentAddress, amountToPay, `0x${paymentReference}`, feeAmount, feeAddress,)
 * payRequestFromEscrow(`0x${paymentReference}`)
 * freezeRequest(`0x${paymentReference}`)
 * refundFrozenFunds(`0x${paymentReference}`)
 */

/**
 * Processes a transaction to payEscrow().
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 * @param overrides optionally, override default transaction values, like gas.
 */
export async function payEscrow(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
  overrides?: ITransactionOverrides,
): Promise<ContractTransaction> {
  const encodedTx = encodePayEscrow(request, signerOrProvider);
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);
  const signer = getSigner(signerOrProvider);

  const tx = await signer.sendTransaction({
    data: encodedTx,
    to: contractAddress,
    value: 0,
    ...overrides,
  });
  return tx;
}

/**
 * Processes a transaction to payRequestFromEscrow().
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 * @param overrides optionally, override default transaction values, like gas.
 */
export async function payRequestFromEscrow(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
  overrides?: ITransactionOverrides,
): Promise<ContractTransaction> {
  const encodedTx = encodePayRequestFromEscrow(request, signerOrProvider);
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);

  const signer = getSigner(signerOrProvider);
  const tx = await signer.sendTransaction({
    data: encodedTx,
    to: contractAddress,
    value: 0,
    ...overrides,
  });
  return tx;
}

/**
 * Processes a transaction to freeze request.
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 * @param overrides optionally, override default transaction values, like gas.
 */
export async function freezeRequest(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
  overrides?: ITransactionOverrides,
): Promise<ContractTransaction> {
  const encodedTx = encodeFreezeRequest(request, signerOrProvider);
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);

  const signer = getSigner(signerOrProvider);
  const tx = await signer.sendTransaction({
    data: encodedTx,
    to: contractAddress,
    value: 0,
    ...overrides,
  });
  console.log(tx);
  return tx;
}

/**
 * Processes a transaction to refundFrozenFunds().
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 * @param overrides optionally, override default transaction values, like gas.
 */
 export async function refundFrozenFundsRequest(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
  overrides?: ITransactionOverrides,
): Promise<ContractTransaction> {
  const encodedTx = encodeRefundFrozenFundsRequest(request, signerOrProvider);
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);

  const signer = getSigner(signerOrProvider);
  const tx = await signer.sendTransaction({
    data: encodedTx,
    to: contractAddress,
    value: 0,
    ...overrides,
  });
  return tx;
}

/**
 * Encodes the call to payEscrow().
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 * @param amount optionally, the amount to pay. Defaults to remaining amount of the request.
 */
export function encodePayEscrow(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
  amount?: BigNumberish,
): string {
  validateRequest(request, PaymentTypes.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT);
  const signer = getSigner(signerOrProvider);

  // ERC20 token to be used
  const tokenAddress = request.currencyInfo.value;
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);

  // collects the parameters to be used, from the request
  const { paymentReference, paymentAddress , feeAmount, feeAddress } = getRequestPaymentValues(
    request,
  );
  const amountToPay = getAmountToPay(request, amount);

  // connects to ERC20EscrowToPayV1
  const erc20EscrowToPayContract = ERC20EscrowToPay__factory.connect(contractAddress, signer);

  return erc20EscrowToPayContract.interface.encodeFunctionData('payEscrow', [
    tokenAddress,
    paymentAddress,
    amountToPay,
    `0x${paymentReference}`,
    feeAmount,
    feeAddress
  ]);
}

/**
 * Returns the encoded data to withdraw funds from Escrow.
 * @param request request to pay
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 */
export function encodePayRequestFromEscrow(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
): string {
  validateRequest(request, PaymentTypes.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT);
  const signer = getSigner(signerOrProvider);

  // collects the parameters to be used from the request
  const { paymentReference } = getRequestPaymentValues(request);

  // connections to the escrow contract
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);
  const erc20EscrowToPayContract = ERC20EscrowToPay__factory.connect(contractAddress, signer);

  // encodes the function data and returns them
  return erc20EscrowToPayContract.interface.encodeFunctionData('payRequestFromEscrow', [
    `0x${paymentReference}`
  ]);
}

/**
 * Returns the encoded data to FreezeRequest().
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 */
export function encodeFreezeRequest(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
): string {
  validateRequest(request, PaymentTypes.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT);
  const signer = getSigner(signerOrProvider);

  // collects the parameters to be used from the request
  const { paymentReference } = getRequestPaymentValues(request);

  // connections to the escrow contract
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);
  const erc20EscrowToPayContract = ERC20EscrowToPay__factory.connect(contractAddress, signer);

  // encodes the function data and returns them
  return erc20EscrowToPayContract.interface.encodeFunctionData('FreezeRequest', [
    `0x${paymentReference}`,
  ]);
}

/**
 * Returns the encoded data to withdrawLockedfunds from TimeLockContract
 * @param request request to pay.
 * @param signerOrProvider the Web3 provider, or signer. Defaults to window.ethereum.
 */
export function encodeRefundFrozenFundsRequest(
  request: ClientTypes.IRequestData,
  signerOrProvider: providers.Web3Provider | Signer = getProvider(),
): string {
  validateRequest(request, PaymentTypes.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT);
  const signer = getSigner(signerOrProvider);

  // collects the parameters to be used from the request
  const { paymentReference } = getRequestPaymentValues(request);

  // connections to the escrow contract
  const contractAddress = erc20EscrowToPayArtifact.getAddress(request.currencyInfo.network!);
  const erc20EscrowToPayContract = ERC20EscrowToPay__factory.connect(contractAddress, signer);

  // encodes the function data and returns them
  return erc20EscrowToPayContract.interface.encodeFunctionData('refundFrozenFunds', [
    `0x${paymentReference}`,
  ]);
}