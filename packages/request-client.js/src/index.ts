import { PaymentReferenceCalculator } from '@requestnetwork/payment-detection';

import Request from './api/request';
import Utils from './api/utils';
import { default as RequestNetwork } from './http-request-network';
import { default as RequestNetworkBase } from './api/request-network';
import { default as HttpMetaMaskDataAccess } from './http-metamask-data-access';
import { default as HttpDataAccess } from './http-data-access';
import * as Types from './types';
import { NodeConnectionConfig } from './http-data-access-config';

export type { NodeConnectionConfig };
export {
  PaymentReferenceCalculator,
  Request,
  RequestNetwork,
  RequestNetworkBase,
  HttpDataAccess,
  HttpMetaMaskDataAccess,
  Types,
  Utils,
};
