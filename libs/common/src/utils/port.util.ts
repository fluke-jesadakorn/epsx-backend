import * as net from 'net';

/**
 * This file previously contained dynamic port allocation logic.
 * We now use static ports defined in the root .env file for all services:
 *
 * - Gateway: 3001
 * - Exchange: 4100
 * - Stock: 4200
 * - Financial: 4300
 * - AI: 4400
 */
