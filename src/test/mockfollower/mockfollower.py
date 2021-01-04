import sys
import argparse
import time

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Mock follower for testing'
    )

    parser.add_argument(
        '--ready',
        type=float,
        help='The time (in seconds) before READY is output',
        default=1.0,
    )    
    parser.add_argument(
        '--interval',
        type=float,
        help='The interval (in seconds) between two prints',
        default=1.0,
    )
    parser.add_argument(
        '--diff',
        type=float,
        help='The number (in seconds) to increment each printed number',
        default=0.1,
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='The number of number prints before exiting',
        default=50,
    )
    parser.add_argument(
        '--exitcode',
        type=int,
        help='Exit code when done',
        default=0,
    )

    args = parser.parse_args()

    ready = args.ready
    interval = args.interval
    diff = args.diff
    limit = args.limit
    exitcode = args.exitcode

    eprint('started')
    time.sleep(ready)
    print('READY', flush=True)

    acc = 0.0
    for i in range(limit):
        print(acc, flush=True)
        time.sleep(interval)
        acc += diff

    sys.exit(exitcode)