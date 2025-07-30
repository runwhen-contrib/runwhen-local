#
# to run this test run `make memtest`
#

{Table, Lock} = require('./index')

STEPS = 1000 * 1000

print_usage = (note, ms, ops) =>
    heapUsedMb = process.memoryUsage().heapUsed / (1024 * 1024)
    heapTotalMb = process.memoryUsage().heapTotal / (1024 * 1024)
    opsPerMs = ops / ms
    console.log("#{ms}ms", "| ops per ms=#{opsPerMs.toFixed(0)} | ", note, {
      heapUsedMb,
      heapTotalMb,
    })

lock_and_release_test = (cb) =>
  global.gc()
  d = Date.now()
  l = new Lock()
  for i in [0...STEPS]
    await l.acquire defer()
    l.release()
  dt = Date.now() - d
  global.gc()
  note = "lock_and_release"
  print_usage(note, dt, STEPS)
  cb null

table_acquire_test = (cb) =>
  t = new Table()
  locks = []
  global.gc()
  d = Date.now()
  for i in [0...STEPS]
    await t.acquire2 {name : "#{i}"}, defer(locks[locks.length])
  dt = Date.now() - d
  global.gc()
  note = "table acquire"
  print_usage(note, dt, STEPS)
  cb locks

table_release_test = (locks, cb) =>
  global.gc()
  d = Date.now()
  for lock in locks
    lock.release()
  dt = Date.now() - d
  locks.splice(0, locks.length)
  global.gc()
  note = "table release"
  print_usage(note, dt, STEPS)
  cb locks

main = (_, cb)=>
  if not global.gc
    console.log 'Run this test with make memtest '
    process.exit 1
  print_usage('startup', 0, 0)
  while true
    await lock_and_release_test defer()
    await table_acquire_test defer locks
    await table_release_test locks, defer()
  cb null

await main null, defer()
