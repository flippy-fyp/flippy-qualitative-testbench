import { Promise as cancellablePromise } from 'bluebird'

cancellablePromise.config({
    cancellation: true,
})

export const CancellablePromise = cancellablePromise
