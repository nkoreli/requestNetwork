import request from 'supertest';
import { StatusCodes } from 'http-status-codes';

import { getRequestNode } from '../src/server';
import { RequestNode } from '../src/requestNode';
import { setupServer } from 'msw/node';

const channelId = '010aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const anotherChannelId = '010bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const topics = [
  '010ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  '010ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
];
const transactionData = { data: `this is sample data for a transaction ${Date.now()}` };
const anotherTransactionData = { data: 'you can put any data' };
const badlyFormattedTransactionData = { not: 'a transaction' };

let requestNodeInstance: RequestNode;
let server: any;

jest.setTimeout(30000);

const mockServer = setupServer();

/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
describe('persistTransaction', () => {
  beforeAll(async () => {
    requestNodeInstance = getRequestNode();
    await requestNodeInstance.initialize();

    server = (requestNodeInstance as any).express;
  });

  afterAll(async () => {
    await requestNodeInstance.close();
    jest.restoreAllMocks();
    mockServer.restoreHandlers();
  });

  it('responds with status 200 to requests with correct values', async () => {
    let serverResponse = await request(server)
      .post('/persistTransaction')
      .send({ channelId, topics, transactionData })
      .set('Accept', 'application/json')
      .expect(StatusCodes.OK);

    expect(serverResponse.body).toMatchObject({ result: {} });

    // topics parameter should be optional
    serverResponse = await request(server)
      .post('/persistTransaction')
      .send({ channelId: anotherChannelId, transactionData: anotherTransactionData })
      .set('Accept', 'application/json')
      .expect(StatusCodes.OK);

    expect(serverResponse.body.result).toMatchObject({});
  });

  it('responds with status 422 to requests with no value', async () => {
    await request(server)
      .post('/persistTransaction')
      .send({})
      .set('Accept', 'application/json')
      .expect(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('responds with status 500 to requests with badly formatted value', async () => {
    await request(server)
      .post('/persistTransaction')
      .send({
        channelId,
        transactionData: badlyFormattedTransactionData,
      })
      .set('Accept', 'application/json')
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
