import geoip from 'geoip-lite';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { successResponse } from './index.js';
import { client } from '../../database/connection.redis.js';
const fromWhere = async (ip) => { return geoip.lookup(ip) }

export const generateRateLimiter = ({
    limit,
    ttl = 5,
    legacyHeaders = false,
    standardHeaders = true,
    skipSuccessfulRequests,
    skipFailedRequests
}) => {
    return rateLimit({
        skipSuccessfulRequests,
        skipFailedRequests,
        windowMs: ttl * 60 * 10000,
        legacyHeaders,
        standardHeaders,
        handler: function (req, res, next) {
            successResponse({ res, status: 429, message: "Too many requests, please try again later." })
        },
        limit: async function (req) {
            const country = await fromWhere(req.ip)
            return country?.country == "EG" ? limit : 0
        },
        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 52)
            return `${ip}::${req.path}`
        },
        store: {
            async incr(key, cb) {
                try {
                    const count = await client.incr(key);
                    if (count === 1) await client.expire(key, 60)
                    cb(null, count)
                } catch (error) {
                    cb(error)
                }
            },
            async decrement(key) {
                if (await client.exists(key)) await client.decr(key)
            }
        }
    })
}