1. Predicate Lock
- Any read need to acquire a predicate lock so that the future write (update/delete/insert) can detect the conflict in
- Heap scan need to take predicate lock on entire relation because any value can get inserted anywhere by future writer.
- Index scan will take the predicate lock in pages covered by it's range so that anything inserted in the GAP will generate the rw conflict.

2. RW dependency:
- Any reader reading the old version or the new insert is not visible then it will generated RW conflict outvwith the modifier.
- Any writer, will check whether it's write is conflicting with any predicate lock then it will generate RW conflict In with the reader who holds the predicate lock.
- Insert in relation need to check conflict with predicate lock on entire relation
- Update/delete need to check with that tuple as well as relation?  Lock can be promoted from finest to coarser so for delete/update also we need to check coarser lock as well.
- Insert in tree need to check in BT pages.
