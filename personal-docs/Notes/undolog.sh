High level goals:
1. Should be append only like WAL so that insertion is easy.
2. Old log should be easily discardable like queue from the back.
3. Should allow the random read like relation for reading undo record just by undo record pointer.

- Undo logs physically consist of a set of 1MB segment files under $PGDATA/base/undo (or per-tablespace equivalent) that are created, deleted or renamed as required,
  similarly to the way that WAL segments are managed. Meta-data about the set of undo logs is stored in shared memory, and written to per-checkpoint files under $PGDATA/pg_undo.
- PostgreSQL undo log manager.  This module is responsible for lifecycle management of undo logs and backing files, associating undo logs with backends, allocating and managing
  space within undo logs.
- 

1.
typedef struct UndoLogSharedData
{
	UndoLogNumber	free_lists[UndoLogCategories];
	UndoLogNumber	low_logno;
	UndoLogNumber	next_logno;
	UndoLogNumber	nslots;
	UndoLogSlot		slots[FLEXIBLE_ARRAY_MEMBER];
} UndoLogSharedData;

a. Separate free list per catagory
b. Lowest log number created
c. Next log number to be created, it should not go beyond MaxUndoLogNumber
d. UndoLogSlot, one slot for each undo log.

2. Allocating and Undo log
Attach to log
- If freelist have undo log then take from the freelist
- Else Need to create new undo log
  - Allocate a free slot
  - Attach next_logno undo log to the slot and create new log (later we will add segment to this whenever needed)
  - In UndoLogDiscard if the undo log is entirely discarded then it will be detached from the slot so that slot can be reused for any other log.
- Slot is actually physical active log, logno is nothing but just a logical addressing space which can not be reused, otherwise UndoRecPtr will be repeated.

3. Detach the undo log
Either a log is full or the session is getting closed the undo log need to be detached
-  If log is not full and detaching due to session close, the slot(with the same logno) will be added to the freelist so that another backend find it
- If full it will not be added to free list and it will be marked full, we can not detach logno from slot because it still has valid undo logs which need to be discarded and used by another backend for visibility.


4. Discard
- Just move the discard point
- if we are discarding block then ForgetBuffer for those blocks.
- If complete segment(file) is discarded then delete that file, as an optimisation if we don't have any extra segment with us then recycle (rename) one segment as a future segment.
- If the log attached to the slot was full and it's completely discarded then detach the slot from the logno.


5. Checkpoint and startup
- Create file  pg_undo/CheckPointRedo
- Write UndoLogShared structure
- Followed by each undo log meta data.

On Startup
- Read UndoLogShared and nlogs
- For each log allocate a slot and attach logno and meta to that slot
- 

6. WAL log metadata after the checkpoint
a) Metadata image:  In UndoLogAllocateContext we keep meta data image (unlogged meta data which should be logged only on first update after the checkpoint)
	/*
	 * The maximum number of undo logs that a single WAL record could insert
	 * into, modifying its unlogged meta data.  Typically the number is 1, but
	 * it might touch a couple or more in rare cases where space runs out.
	 */
	struct
	{
		UndoLogNumber logno;
		UndoLogUnloggedMetaData data;
	} meta_data_images[MAX_META_DATA_IMAGES]
b) In single WAL operation, for each undo logno we touch we create one meta data image for that.
c) All undo log allocator (zheap) will call RegisterUndoLogBuffers, which will register all the undo buffers which go modified during this way operation and this will also call UndoLogRegister which will call XLogRegisterBufData to register each metadata image with the XLog Machinery.  Buffers will be register with special flag REGBUF_KEEP_DATA_AFTER_CP.
d) During XLogRecordAssemble, While processing each registered block if we find any block is registered with flag REGBUF_KEEP_DATA_AFTER_CP and (page_lsn <= RedoRecPtr) then checkpoint happened after we write into the buffer
So we need to keep the meta data.  Generally, it's opposite of other buffers, for that if buffer lsn is < RedoRecPtr then we keep full page image of buffer so we discard the registered data.  But here even though we are keeping
Full page image we need data because these data which we have associated with buffer for the xlog machinery to work smoothly is actually not buffer data but the undo log meta data.


7. Allocation during recovery mapping WAL record block-no to the logno.
 - In order to find the undo log that was used by UndoLogAllocate(), we consult the list of registered blocks to figure out which undo logs should be written to by this WAL record. Basically, in register block we can
Get relfilenode and from there we can get relnode that will be our logno.
 - First allocation from the context, will loop through all the block registered in this WAL and for first registered block of each wall it will check in the xlogrecord, if we have any meta-data backup image for again this block
   if so then we overwrite the undo log meta data with this backup image.
 - So basically, the first allocate in recovery for every wal will overwrite the meta data for all the logs till we find our log.  Next call onward the try_location in the context will be valid so it will not try this path.
 - If log is full then ....by while (context->recovery_block_id <= context->xlog_record->max_block_id) loop we will directly reach to next block which we haven't yet processed.  And, we will get the next logno from there.

8. Undo file management

