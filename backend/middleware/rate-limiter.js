import {rateLimit} from 'express-rate-limit'

export const globalLimiter= rateLimit({
    windowMs: 5 * 60* 1000,
    max: 300,
    message: "Too many requests, please try again later.",
    standardHeaders : true,
    legacyHeaders: false // Disable the `X-RateLimit-*` headers.
})

export const authLimiter= rateLimit({
    windowMs: 15 * 60* 1000,
    max: 10,
    message: "Too many authentication attempts, Try again later.",
    standardHeaders : true,
    legacyHeaders: false // Disable the `X-RateLimit-*` headers.
})


export const aiLimiter= rateLimit({
    windowMs: 1 * 60* 1000,
    max: 10,
    message: "AI rate limit exceeded, please try again later",
    standardHeaders : true,
    legacyHeaders: false // Disable the `X-RateLimit-*` headers.
})

